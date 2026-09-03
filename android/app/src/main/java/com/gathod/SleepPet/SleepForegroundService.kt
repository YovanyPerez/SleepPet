package com.gathod.SleepPet

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.core.app.NotificationCompat
import java.util.Collections
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToLong
import kotlin.math.sqrt
import org.json.JSONArray
import org.json.JSONObject

/**
 * Mantiene viva la sesión de sueño en segundo plano.
 * Una notificación "ongoing" normal NO conserva el proceso;
 * este foreground service sí, y así el listener de accesibilidad
 * sigue contando los desbloqueos del teléfono.
 *
 * Además captura el acelerómetro (TYPE_ACCELEROMETER) durante la sesión
 * para medir movimiento nocturno: eventos + epochs de 5 min + score.
 * El procesamiento vive aquí (no en JS) para seguir funcionando con la
 * pantalla apagada y sin UI de React Native activa.
 */
class SleepForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "sleep_session_channel"
        const val NOTIFICATION_ID = 1001

        const val EXTRA_START_TIME = "startTime"
        const val EXTRA_CHANNEL_NAME = "channelName"
        const val EXTRA_CHANNEL_DESC = "channelDescription"
        const val EXTRA_TITLE = "title"
        const val EXTRA_CONTENT = "content"
        const val EXTRA_TIME_LABEL = "timeLabel"
        const val EXTRA_UNLOCK_LABEL = "unlockLabel"
        const val EXTRA_RESUME = "resumeMovement"

        // Persistencia de movimiento (sobrevive muerte del proceso)
        const val MOVEMENT_PREFS_NAME = "sleep_movement"
        const val MOVEMENT_PREFS_KEY = "movement_summary"

        // ===========================
        // Tunables del detector de movimiento (patrón PPG: arriba, documentados)
        // Unidades reales del sensor: m/s² (SensorManager.STANDARD_GRAVITY = 9.80665).
        // Valores calibrados para teléfono sobre la cama (giros suaves del cuerpo
        // generan 0.25-0.45); NO clínicamente validados: recalibrar con pruebas reales
        // usando el log "pico del minuto".
        // ===========================
        const val MOVEMENT_START_THRESHOLD = 0.32f  // |mag-g| (m/s²) por encima -> inicia evento (antes 0.60: no captaba giros de cama)
        const val MOVEMENT_END_THRESHOLD = 0.15f    // histéresis: debajo de esto la actividad se considera terminada
        // NOTA calibración dispositivo rsmzu8mztspndyj7: baseline quieto ~0.88-0.94 (no 0.07) visto 21:06-21:07 HIGH constante + evento nunca cierra
        // → este dispositivo reporta ~0.9 offset. Para Fase A se mantienen umbrales, pero SmartSleep LEVEL se recalibra abajo.
        const val MOVEMENT_QUIET_MS = 2000L         // silencio continuo para cerrar un evento
        const val MIN_MOVEMENT_DURATION_MS = 1200L  // evento válido >= 1.2s (cuenta voltereos breves)
        const val MOVEMENT_COOLDOWN_MS = 3000L      // mínimo tiempo entre eventos contados (anti fragmentación)
        const val MOVEMENT_EPOCH_MS = 300000L       // epoch de 5 min, anclado al startTime de la sesión
        const val MOVEMENT_NOISE_FLOOR = 0.10f      // piso (m/s²) para el score: se acumula solo el exceso
        const val MOVEMENT_MAX_EPOCHS = 160         // cap ~13h; los más viejos se descartan

        // Fase A Smart Sleep: ventanas de 30s (Fase 2) — observable sin mic ni reglas,
        // paralelas a los epochs de 5 min (estos últimos se mantienen intactos).
        const val SMART_WINDOW_MS = 30000L            // ventana configurable 30s
        const val SMART_MAX_WINDOWS = 960             // cap ~8h (960*30s)

        // Fase B Smart Sleep: audio ventana 30s sincronizada con movimiento
        const val AUDIO_SAMPLE_RATE = 16000
        const val AUDIO_CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        const val AUDIO_SOURCE = MediaRecorder.AudioSource.VOICE_RECOGNITION

        // Fase C: clasificador WAKE/LIGHT/DEEP (reglas Cole-Kripke/Sadeh adaptadas, sin ML)
        // Umbrales calibrados con logs rsmzu8mztspndyj7: quieto ~0.88-0.94 LOW, mano ~1.02+ HIGH
        // Cole-Kripke 5-ventana ponderada, threshold 1.0; LIGHT/DEEP secundario por avg+audioRms
        const val SMART_WAKE_THRESHOLD = 1.0f
        const val SMART_AUDIO_RMS_THRESHOLD = 0.015f
        const val SMART_LIGHT_AVG_THRESHOLD = 0.90f

        // Fase C: SmartAlarm ventana favorable
        const val SMART_ALARM_PREFS_NAME = "smart_alarm"
        const val SMART_ALARM_KEY = "smart_alarm_config"

        private var instance: SleepForegroundService? = null

        private val errorLog = Collections.synchronizedList(
            mutableListOf<String>()
        )

        fun recordError(source: String, message: String?) {
            val line = "$source: ${message ?: "sin mensaje"}"
            errorLog.add(line)
            if (errorLog.size > 30) errorLog.removeAt(0)
            Log.e("SleepPet", line)
        }

        fun getErrorLog(): List<String> = errorLog.toList()

        fun updateUnlocks(count: Int) {
            instance?.unlocks = count
        }

        fun stopAndRemoveNotification(context: Context) {
            instance?.let { service ->
                service.running = false
                service.handler.removeCallbacksAndMessages(null)
            }
            val manager = context.getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager
            manager.cancel(NOTIFICATION_ID)
            context.stopService(
                Intent(context, SleepForegroundService::class.java)
            )
        }

        /**
         * Resumen de movimiento para JS (MovementModule).
         * Si el servicio está vivo usa el detector en memoria (snapshot que NO
         * muta estado, incluye el epoch parcial en curso — evita la carrera con
         * stopNotification). Si no, lee las SharedPreferences del último flush.
         */
        fun movementSnapshot(context: Context): JSONObject {
            val live = instance?.movementDetector
            if (live != null) {
                return live.snapshot()
            }
            return try {
                val raw = context
                    .getSharedPreferences(MOVEMENT_PREFS_NAME, Context.MODE_PRIVATE)
                    .getString(MOVEMENT_PREFS_KEY, null)
                raw?.let { JSONObject(it) }
                    ?: emptyMovementJson()
            } catch (e: Exception) {
                emptyMovementJson()
            }
        }

        fun clearMovementSummary(context: Context) {
            try {
                context
                    .getSharedPreferences(MOVEMENT_PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .remove(MOVEMENT_PREFS_KEY)
                    .apply()
                Log.i("Movement", "resumen de sesión limpiado")
            } catch (e: Exception) {
                recordError("movementClear", e.toString())
            }
        }

        private fun emptyMovementJson(): JSONObject = JSONObject()
            .put("events", 0)
            .put("score", 0.0)
            .put("epochs", JSONArray())
            .put("smartWindows", JSONArray())
            .put("smartWindowMs", SMART_WINDOW_MS)

        fun setSmartAlarmConfig(context: Context, enabled: Boolean, hour: Int, minute: Int, windowMin: Int) {
            try {
                context.getSharedPreferences(SMART_ALARM_PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putBoolean("enabled", enabled)
                    .putInt("hour", hour)
                    .putInt("minute", minute)
                    .putInt("windowMin", windowMin)
                    .apply()
                Log.i("SmartAlarm", "config guardada enabled=$enabled ${hour}:${minute} window ${windowMin}m")
            } catch (e: Exception) {
                recordError("smartAlarmSet", e.toString())
            }
        }

        fun getSmartAlarmConfig(context: Context): JSONObject {
            return try {
                val prefs = context.getSharedPreferences(SMART_ALARM_PREFS_NAME, Context.MODE_PRIVATE)
                JSONObject()
                    .put("enabled", prefs.getBoolean("enabled", false))
                    .put("hour", prefs.getInt("hour", 7))
                    .put("minute", prefs.getInt("minute", 0))
                    .put("windowMin", prefs.getInt("windowMin", 30))
            } catch (e: Exception) {
                JSONObject().put("enabled", false).put("hour", 7).put("minute", 0).put("windowMin", 30)
            }
        }

        fun isInSmartAlarmWindow(context: Context, nowMs: Long): Boolean {
            return try {
                val prefs = context.getSharedPreferences(SMART_ALARM_PREFS_NAME, Context.MODE_PRIVATE)
                if (!prefs.getBoolean("enabled", false)) return false
                val hour = prefs.getInt("hour", 7)
                val minute = prefs.getInt("minute", 0)
                val windowMin = prefs.getInt("windowMin", 30)
                val cal = java.util.Calendar.getInstance()
                cal.timeInMillis = nowMs
                val target = java.util.Calendar.getInstance()
                target.timeInMillis = nowMs
                target.set(java.util.Calendar.HOUR_OF_DAY, hour)
                target.set(java.util.Calendar.MINUTE, minute)
                target.set(java.util.Calendar.SECOND, 0)
                target.set(java.util.Calendar.MILLISECOND, 0)
                if (target.timeInMillis <= nowMs) return false
                val windowStart = target.timeInMillis - windowMin * 60 * 1000L
                nowMs in windowStart..target.timeInMillis
            } catch (e: Exception) {
                false
            }
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private val updateRunnable = object : Runnable {
        override fun run() {
            if (!running) return
            try {
                // cierre de epochs por tiempo (aunque el sensor no entregue samples)
                movementDetector?.tick()
                val manager = getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager
                manager.notify(NOTIFICATION_ID, buildNotification())
            } catch (e: Exception) {
                recordError("updateNotif", e.toString())
            }
            handler.postDelayed(this, 1000)
        }
    }

    private var startTime: Long = 0L
    private var unlocks = 0
    private var running = false
    private var movementDetector: MovementDetector? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var sensorManagerRef: SensorManager? = null
    private var accelerometerSensor: Sensor? = null

    // Fase B: audio
    private var audioRecord: AudioRecord? = null
    private var audioThread: HandlerThread? = null
    private var audioHandler: Handler? = null
    private var audioEnabled = false

    // KeepAlive para Doze: re-registra sensor cada 2 min para evitar silencio 0 samples visto 21:42
    private val sensorKeepAliveRunnable = object : Runnable {
        override fun run() {
            if (!running) return
            try {
                val detector = movementDetector
                val sm = sensorManagerRef
                val sensor = accelerometerSensor
                if (detector != null && sm != null && sensor != null) {
                    sm.unregisterListener(detector)
                    sm.registerListener(detector, sensor, SensorManager.SENSOR_DELAY_GAME)
                    Log.i("SmartSleep", "sensor keepAlive re-registrado")
                }
            } catch (e: Exception) {
                recordError("sensorKeepAlive", e.toString())
            }
            handler.postDelayed(this, 120000)
        }
    }

    private var channelName = ""
    private var channelDescription = ""
    private var notificationTitle = ""
    private var notificationContent = ""
    private var timeLabel = ""
    private var unlockLabel = ""

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {
        if (intent == null) {
            return START_STICKY
        }

        startTime = intent.getLongExtra(
            EXTRA_START_TIME,
            System.currentTimeMillis()
        )
        channelName = intent.getStringExtra(EXTRA_CHANNEL_NAME) ?: ""
        channelDescription = intent.getStringExtra(EXTRA_CHANNEL_DESC) ?: ""
        notificationTitle = intent.getStringExtra(EXTRA_TITLE) ?: ""
        notificationContent = intent.getStringExtra(EXTRA_CONTENT) ?: ""
        timeLabel = intent.getStringExtra(EXTRA_TIME_LABEL) ?: ""
        unlockLabel = intent.getStringExtra(EXTRA_UNLOCK_LABEL) ?: ""
        val resumeMovement = intent.getBooleanExtra(EXTRA_RESUME, false)

        createChannel()

        try {
            startForeground(
                NOTIFICATION_ID,
                buildNotification()
            )
        } catch (e: Exception) {
            recordError("startForeground", e.toString())
            stopSelf()
            return START_NOT_STICKY
        }

        running = true

        // Fase A Smart Sleep: partial wake lock para que el acelerómetro
        // siga entregando muestras con pantalla apagada/Doze (TYPE_ACCELEROMETER
        // no es wake-up). Sin esto el sensor se silencia ~8 min tras screen off
        // (visto 21:08 0 samples).
        try {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SleepPet:SmartSleep")
            wakeLock?.setReferenceCounted(false)
            wakeLock?.acquire(12 * 60 * 60 * 1000L) // max 12h, release en onDestroy
            Log.i("SmartSleep", "wakeLock adquirido")
        } catch (e: Exception) {
            recordError("wakeLock", e.toString())
        }

        handler.postDelayed(updateRunnable, 1000)
        handler.postDelayed(sensorKeepAliveRunnable, 120000)

        startMovement(resumeMovement)
        startAudio()

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        running = false
        stopMovement()
        stopAudio()
        handler.removeCallbacks(sensorKeepAliveRunnable)
        try {
            wakeLock?.let { if (it.isHeld) it.release() }
        } catch (e: Exception) {
            recordError("wakeLockRelease", e.toString())
        }
        wakeLock = null
        sensorManagerRef = null
        accelerometerSensor = null
        instance = null
        handler.removeCallbacksAndMessages(null)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    /**
     * Registra el acelerómetro solo mientras la sesión está activa.
     * resume=true  -> restaurar epochs/eventos de SharedPreferences y continuar
     * resume=false -> sesión nueva: descartar restos anteriores y empezar de cero
     */
    private fun startMovement(resume: Boolean) {
        try {
            val sensorManager =
                getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            val sensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            if (sensorManager == null || sensor == null) {
                Log.w("Movement", "acelerómetro no disponible en este dispositivo")
                return
            }
            if (!resume) {
                getSharedPreferences(MOVEMENT_PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .remove(MOVEMENT_PREFS_KEY)
                    .apply()
            }
            sensorManagerRef = sensorManager
            accelerometerSensor = sensor
            movementDetector = MovementDetector(startTime, resume)
            sensorManager.registerListener(
                movementDetector,
                sensor,
                // GAME (~50Hz) en vez de NORMAL (~5Hz): a 5Hz la rampa de un giro
                // breve cae entre samples y el pico real no se ve. Coste de batería
                // despreciable frente a la pantalla apagada.
                SensorManager.SENSOR_DELAY_GAME
            )
            Log.i("Movement", "sensor registrado resume=$resume")
        } catch (e: Exception) {
            recordError("movementStart", e.toString())
        }
    }

    /** Desregistra el listener y hace flush terminal (cierra epoch parcial + prefs). */
    private fun stopMovement() {
        val detector = movementDetector
        movementDetector = null
        if (detector == null) return
        try {
            (getSystemService(Context.SENSOR_SERVICE) as? SensorManager)
                ?.unregisterListener(detector)
        } catch (e: Exception) {
            recordError("movementStop", e.toString())
        }
        detector.flush()
        Log.i("Movement", "sensor desregistrado")
    }

    /**
     * Fase B: inicia captura de audio ventana 30s sincronizada con movimiento.
     * - Verifica RECORD_AUDIO (fallback accel-only si denegado)
     * - AudioRecord VOICE_RECOGNITION 16kHz mono PCM16
     * - Thread HandlerThread lee short[] continuo, calcula RMS+ZCR por ventana,
     *   alimenta MovementDetector (misma ventana 30s) y descarta PCM tras features.
     */
    private fun startAudio() {
        try {
            if (Build.VERSION.SDK_INT >= 23 &&
                ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                Log.i("SmartAudio", "RECORD_AUDIO no concedido — fallback accel-only")
                audioEnabled = false
                return
            }
            val minBuf = AudioRecord.getMinBufferSize(AUDIO_SAMPLE_RATE, AUDIO_CHANNEL_CONFIG, AUDIO_FORMAT)
            if (minBuf <= 0) {
                Log.w("SmartAudio", "getMinBufferSize invalido $minBuf — fallback")
                audioEnabled = false
                return
            }
            val bufSize = (minBuf * 2).coerceAtLeast(4096)
            val ar = AudioRecord(AUDIO_SOURCE, AUDIO_SAMPLE_RATE, AUDIO_CHANNEL_CONFIG, AUDIO_FORMAT, bufSize)
            if (ar.state != AudioRecord.STATE_INITIALIZED) {
                Log.w("SmartAudio", "AudioRecord no inicializado state=${ar.state}")
                try { ar.release() } catch (_: Exception) {}
                audioEnabled = false
                return
            }
            audioRecord = ar
            audioEnabled = true
            audioThread = HandlerThread("SmartAudioThread").also { it.start() }
            audioHandler = Handler(audioThread!!.looper)
            Log.i("SmartAudio", "AudioRecord iniciado ${AUDIO_SAMPLE_RATE}Hz buf=$bufSize")
            ar.startRecording()
            val buffer = ShortArray(1024)
            val runnable = object : Runnable {
                override fun run() {
                    if (!running || !audioEnabled) return
                    try {
                        val read = ar.read(buffer, 0, buffer.size)
                        if (read > 0) {
                            // Copia solo lo leído y descarta tras procesar (no guarda archivo)
                            val chunk = ShortArray(read)
                            System.arraycopy(buffer, 0, chunk, 0, read)
                            movementDetector?.addAudioChunk(chunk)
                            // chunk queda para GC, no se persiste
                        } else if (read < 0) {
                            Log.w("SmartAudio", "read error $read")
                        }
                    } catch (e: Exception) {
                        recordError("audioRead", e.toString())
                    }
                    audioHandler?.post(this)
                }
            }
            audioHandler?.post(runnable)
        } catch (e: Exception) {
            recordError("audioStart", e.toString())
            audioEnabled = false
            try { audioRecord?.release() } catch (_: Exception) {}
            audioRecord = null
        } catch (e: SecurityException) {
            Log.i("SmartAudio", "SecurityException RECORD_AUDIO — fallback accel-only")
            audioEnabled = false
        }
    }

    private fun stopAudio() {
        audioEnabled = false
        try { audioHandler?.removeCallbacksAndMessages(null) } catch (_: Exception) {}
        audioHandler = null
        try {
            audioThread?.quitSafely()
            audioThread?.join(500)
        } catch (_: Exception) {}
        audioThread = null
        try {
            audioRecord?.let {
                try { if (it.recordingState == AudioRecord.RECORDSTATE_RECORDING) it.stop() } catch (_: Exception) {}
                it.release()
            }
        } catch (e: Exception) {
            recordError("audioStop", e.toString())
        }
        audioRecord = null
        Log.i("SmartAudio", "AudioRecord detenido")
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = channelDescription
                setShowBadge(false)
            }
            val manager = getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun elapsedString(): String {
        val elapsedMillis = System.currentTimeMillis() - startTime
        val totalSeconds = (elapsedMillis / 1000).coerceAtLeast(0)
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return String.format(Locale.US, "%d:%02d:%02d", hours, minutes, seconds)
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(notificationTitle)
            .setContentText(notificationContent)
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "$timeLabel: ${elapsedString()}\n" +
                        "$unlockLabel: $unlocks"
                )
            )
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    /**
     * Detector de movimiento nocturno (v1 determinista, sin ML).
     *
     * Señal: movimiento = |sqrt(x²+y²+z²) - gravedad| en m/s²
     * (el acelerómetro entrega m/s² e incluye ~1g de gravedad quieto;
     * no depende de la orientación del teléfono).
     *
     * Eventos: histéresis inicio/fin + duración mínima + cooldown,
     * sobre reloj monótono (SystemClock.elapsedRealtime) para no verse
     * afectado por saltos de reloj de pared.
     *
     * Epochs: ventanas de 5 min ancladas al startTime de la sesión
     * (determinista: idx = (ahora - startTime) / EPOCH_MS), resumen por epoch:
     * {startTime, durationMs, movementScore, movementEvents}.
     *
     * Score de epoch: promedio del exceso sobre el piso de ruido (m/s²),
     * fórmula simple y transparente — NO es una métrica clínica.
     *
     * Persistencia: SharedPreferences "sleep_movement" con
     * {events, lastEpochIdx, epochs:[...]} — escrita al cerrar cada epoch y
     * en el flush terminal; sobrevive muerte del proceso.
     */
    private inner class MovementDetector(
        private val sessionStartMs: Long,
        resume: Boolean
    ) : SensorEventListener {

        // Estado de sesión
        private var totalEvents = 0
        private var epochEvents = 0
        private var epochScoreAccum = 0.0 // suma de max(0, movimiento - piso) * dt (m/s²·s)
        private var lastClosedIdx = -1L
        private var lastSampleNs = 0L

        // Fase A Smart Sleep: ventanas 30s
        private var lastClosedSmartIdx = -1L
        private var smartWindowSum = 0.0   // suma de movement (m/s²) sin piso, para avg
        private var smartWindowMax = 0f
        private var smartWindowSamples = 0
        private var smartWindowAccumExcess = 0.0 // suma exceso sobre piso * dt, para avgExcess
        private val closedSmartWindows = JSONArray()

        // Fase B Smart Sleep: audio ventana 30s sincronizada
        private var audioWindowSumSq = 0.0
        private var audioWindowSamples = 0
        private var audioWindowZcr = 0
        private var audioPrevSample: Short? = null

        // Fase C: suavizado temporal (evita DEEP→LIGHT cada 30s)
        private var prevRawStage: String? = null
        private var prevPrevRawStage: String? = null
        private var smoothedStage: String = "LIGHT"

        // Estado del evento en curso (reloj monótono)
        private var inEvent = false
        private var eventStartMono = 0L
        private var eventLastActiveMono = 0L
        private var lastCountedEndMono = 0L

        // Pico máximo por minuto (calibración de umbrales con el log)
        private var minutePeak = 0f
        private var lastMinuteIdx = -1L

        private val closedEpochs = JSONArray()

        init {
            if (resume) {
                try {
                    val raw = getSharedPreferences(
                        MOVEMENT_PREFS_NAME,
                        Context.MODE_PRIVATE
                    ).getString(MOVEMENT_PREFS_KEY, null)
                    if (raw != null) {
                        val saved = JSONObject(raw)
                        totalEvents = saved.optInt("events", 0)
                        lastClosedIdx = saved.optLong("lastEpochIdx", -1L)
                        val arr = saved.optJSONArray("epochs")
                        if (arr != null) {
                            for (i in 0 until arr.length()) {
                                closedEpochs.put(arr.get(i))
                            }
                        }
                        // Fase A Smart Sleep
                        lastClosedSmartIdx = saved.optLong("lastSmartWindowIdx", -1L)
                        val sArr = saved.optJSONArray("smartWindows")
                        if (sArr != null) {
                            for (i in 0 until sArr.length()) {
                                closedSmartWindows.put(sArr.get(i))
                            }
                        }
                        Log.i(
                            "Movement",
                            "sesión restaurada eventos=$totalEvents " +
                                "epochs=${closedEpochs.length()} lastEpochIdx=$lastClosedIdx " +
                                "smartWindows=${closedSmartWindows.length()} lastSmartIdx=$lastClosedSmartIdx"
                        )
                    }
                } catch (e: Exception) {
                    recordError("movementRestore", e.toString())
                }
            }
        }

        @Synchronized
        override fun onSensorChanged(event: SensorEvent) {
            if (!running) return
            try {
                val nowMono = SystemClock.elapsedRealtime()

                val x = if (event.values.isNotEmpty()) event.values[0] else 0f
                val y = if (event.values.size > 1) event.values[1] else 0f
                val z = if (event.values.size > 2) event.values[2] else 0f
                val magnitude = sqrt(x * x + y * y + z * z)
                // movimiento = desviación respecto a la gravedad (m/s²), sin importar orientación
                val movement = abs(magnitude - SensorManager.STANDARD_GRAVITY)

                if (movement > minutePeak) {
                    minutePeak = movement
                }

                // dt del sample vía timestamps del sensor (ns, monótono)
                val dtSec = if (lastSampleNs > 0L) {
                    (event.timestamp - lastSampleNs).coerceAtLeast(0L) / 1_000_000_000.0
                } else {
                    0.0
                }
                lastSampleNs = event.timestamp
                if (dtSec > 1.0) return // hueco anómalo: no contaminar el score

                val nowWallForWindow = System.currentTimeMillis()
                maybeCloseEpochs(nowWallForWindow)
                maybeCloseSmartWindows(nowWallForWindow)

                // Fase A Smart Sleep: acumulo para ventana 30s
                smartWindowSum += movement
                smartWindowSamples += 1
                if (movement > smartWindowMax) smartWindowMax = movement
                val excessSmart = movement - MOVEMENT_NOISE_FLOOR
                if (excessSmart > 0f) {
                    smartWindowAccumExcess += excessSmart * dtSec
                }

                // score: solo el exceso sobre el piso de ruido
                val excess = movement - MOVEMENT_NOISE_FLOOR
                if (excess > 0f) {
                    epochScoreAccum += excess * dtSec
                }

                // Máquina de estados del evento
                if (!inEvent) {
                    if (movement > MOVEMENT_START_THRESHOLD) {
                        inEvent = true
                        eventStartMono = nowMono
                        eventLastActiveMono = nowMono
                        Log.i("Movement", "evento iniciado")
                    }
                } else {
                    if (movement > MOVEMENT_END_THRESHOLD) {
                        eventLastActiveMono = nowMono
                    } else if (nowMono - eventLastActiveMono >= MOVEMENT_QUIET_MS) {
                        val durationMs = eventLastActiveMono - eventStartMono
                        inEvent = false
                        Log.i(
                            "Movement",
                            "evento terminado duracion=${durationMs}ms"
                        )
                        val spaced = lastCountedEndMono == 0L ||
                            (eventStartMono - lastCountedEndMono) >= MOVEMENT_COOLDOWN_MS
                        if (durationMs >= MIN_MOVEMENT_DURATION_MS && spaced) {
                            totalEvents += 1
                            epochEvents += 1
                            lastCountedEndMono = nowMono
                        }
                    }
                }
            } catch (e: Exception) {
                recordError("movementSample", e.toString())
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
            // sin uso
        }

        /**
         * Fase B: alimenta chunk PCM16 mono (short) para ventana 30s actual.
         * Calcula RMS y ZCR por ventana, descarta PCM tras features.
         * Sincronizada con maybeCloseSmartWindows (mismo idx 30s).
         */
        @Synchronized
        fun addAudioChunk(chunk: ShortArray) {
            if (!running) return
            try {
                val nowWall = System.currentTimeMillis()
                maybeCloseSmartWindows(nowWall)
                var localSumSq = 0.0
                var localZcr = 0
                var prev = audioPrevSample
                for (s in chunk) {
                    val norm = s / 32768.0
                    localSumSq += norm * norm
                    if (prev != null) {
                        if ((prev!! >= 0 && s < 0) || (prev!! < 0 && s >= 0)) localZcr += 1
                    }
                    prev = s
                }
                synchronized(this) {
                    audioWindowSumSq += localSumSq
                    audioWindowSamples += chunk.size
                    audioWindowZcr += localZcr
                    audioPrevSample = prev
                }
                // chunk descartado — no se guarda archivo, solo features
            } catch (e: Exception) {
                recordError("audioChunk", e.toString())
            }
        }

        /** Cierre de epochs por tiempo (tick de 1s del servicio) + log de calibración. */
        @Synchronized
        fun tick() {
            val nowMs = System.currentTimeMillis()

            // Pico máximo del minuto anterior: sirve para calibrar los umbrales
            // con la cama/colocación real (minutos quietos deberían dar <0.10-0.15)
            val minuteIdx = (nowMs - sessionStartMs) / 60000L
            if (lastMinuteIdx >= 0 && minuteIdx > lastMinuteIdx) {
                Log.i(
                    "Movement",
                    "pico del minuto: " +
                        String.format(Locale.US, "%.2f", minutePeak)
                )
                minutePeak = 0f
            }
            lastMinuteIdx = minuteIdx

            maybeCloseEpochs(nowMs)
            maybeCloseSmartWindows(nowMs)
        }

        /**
         * Resumen para JS. NO muta estado: incluye el epoch parcial en curso
         * como elemento extra de la lista, sin cerrarlo ni escribir prefs
         * (así el polling cada 30s no fragmenta los epochs).
         * Fase A añade smartWindows 30s con la misma semántica no-mutante.
         */
        @Synchronized
        fun snapshot(): JSONObject {
            val nowWall = System.currentTimeMillis()
            val idx = currentEpochIdx(nowWall)
            val all = JSONArray()
            for (i in 0 until closedEpochs.length()) {
                all.put(closedEpochs.get(i))
            }
            if (idx > lastClosedIdx) {
                val startWall = sessionStartMs + idx * MOVEMENT_EPOCH_MS
                val duration = (nowWall - startWall)
                    .coerceIn(0L, MOVEMENT_EPOCH_MS)
                val score = epochScoreFor(duration)
                all.put(
                    JSONObject()
                        .put("startTime", startWall)
                        .put("durationMs", duration)
                        .put("movementScore", round3(score))
                        .put("movementEvents", epochEvents)
                )
            }
            // Smart windows 30s — snapshot no-mutante (movimiento + audio Fase B)
            val sIdx = currentSmartIdx(nowWall)
            val smartAll = JSONArray()
            for (i in 0 until closedSmartWindows.length()) {
                smartAll.put(closedSmartWindows.get(i))
            }
            if (sIdx > lastClosedSmartIdx) {
                val sStart = sessionStartMs + sIdx * SMART_WINDOW_MS
                val sDuration = (nowWall - sStart).coerceIn(0L, SMART_WINDOW_MS)
                val avg = if (smartWindowSamples > 0) smartWindowSum / smartWindowSamples else 0.0
                val avgExcess = if (sDuration > 0) smartWindowAccumExcess / (sDuration / 1000.0) else 0.0
                val audioRms = if (audioWindowSamples > 0) sqrt(audioWindowSumSq / audioWindowSamples) else 0.0
                val audioZcr = if (audioWindowSamples > 0) audioWindowZcr.toDouble() / audioWindowSamples else 0.0
                val levelPrev = when {
                    avg < 0.93 -> "LOW"
                    avg < 1.02 -> "MED"
                    else -> "HIGH"
                }
                val isWakePrev = avg >= SMART_WAKE_THRESHOLD || (audioWindowSamples > 0 && audioRms >= SMART_AUDIO_RMS_THRESHOLD && avg >= 0.93)
                val rawPrev = when {
                    isWakePrev -> "WAKE"
                    avg < SMART_LIGHT_AVG_THRESHOLD && (audioWindowSamples == 0 || audioRms < SMART_AUDIO_RMS_THRESHOLD) -> "DEEP"
                    else -> "LIGHT"
                }
                smartAll.put(
                    JSONObject()
                        .put("startTime", sStart)
                        .put("durationMs", sDuration)
                        .put("avgMovement", round3(avg))
                        .put("maxMovement", round3(smartWindowMax.toDouble()))
                        .put("avgExcess", round3(avgExcess))
                        .put("samples", smartWindowSamples)
                        .put("audioRms", round3(audioRms))
                        .put("audioZcr", round3(audioZcr))
                        .put("audioSamples", audioWindowSamples)
                        .put("hasAudio", audioWindowSamples > 0)
                        .put("level", levelPrev)
                        .put("stage", smoothedStage)
                        .put("rawStage", rawPrev)
                        .put("confidence", 0.5)
                )
            }
            return JSONObject()
                .put("events", totalEvents)
                .put("score", round3(weightedScore(all)))
                .put("epochs", all)
                .put("smartWindows", smartAll)
                .put("smartWindowMs", SMART_WINDOW_MS)
        }

        /** Flush terminal: cierra el epoch parcial y escribe prefs (onDestroy/stop). */
        @Synchronized
        fun flush() {
            try {
                val nowWall = System.currentTimeMillis()
                var didWrite = false
                val idx = currentEpochIdx(nowWall)
                if (idx > lastClosedIdx) {
                    val startWall = sessionStartMs + idx * MOVEMENT_EPOCH_MS
                    val duration = (nowWall - startWall)
                        .coerceIn(0L, MOVEMENT_EPOCH_MS)
                    closeEpoch(idx, duration)
                    didWrite = true
                }
                val sIdx = currentSmartIdx(nowWall)
                if (sIdx > lastClosedSmartIdx) {
                    val sStart = sessionStartMs + sIdx * SMART_WINDOW_MS
                    val sDuration = (nowWall - sStart).coerceIn(0L, SMART_WINDOW_MS)
                    closeSmartWindow(sIdx, sDuration)
                    didWrite = true
                }
                if (!didWrite) {
                    writePrefs()
                }
                Log.i(
                    "Movement",
                    "resumen de sesión eventos=$totalEvents epochs=${closedEpochs.length()} " +
                        "smartWindows=${closedSmartWindows.length()}"
                )
            } catch (e: Exception) {
                recordError("movementFlush", e.toString())
            }
        }

        private fun currentEpochIdx(nowWallMs: Long): Long {
            val elapsed = nowWallMs - sessionStartMs
            return if (elapsed <= 0) 0L else elapsed / MOVEMENT_EPOCH_MS
        }

        @Synchronized
        private fun maybeCloseEpochs(nowWallMs: Long) {
            val idx = currentEpochIdx(nowWallMs)
            // cerrar epochs completos que quedaron atrás (normalmente 0 iteraciones)
            while (idx > lastClosedIdx + 1) {
                closeEpoch(lastClosedIdx + 1, MOVEMENT_EPOCH_MS)
            }
        }

        private fun currentSmartIdx(nowWallMs: Long): Long {
            val elapsed = nowWallMs - sessionStartMs
            return if (elapsed <= 0) 0L else elapsed / SMART_WINDOW_MS
        }

        @Synchronized
        private fun maybeCloseSmartWindows(nowWallMs: Long) {
            val idx = currentSmartIdx(nowWallMs)
            while (idx > lastClosedSmartIdx + 1) {
                closeSmartWindow(lastClosedSmartIdx + 1, SMART_WINDOW_MS)
            }
        }

        @Synchronized
        private fun closeSmartWindow(idx: Long, durationMs: Long) {
            val startWall = sessionStartMs + idx * SMART_WINDOW_MS
            val avg = if (smartWindowSamples > 0) smartWindowSum / smartWindowSamples else 0.0
            val avgExcess = if (durationMs > 0) smartWindowAccumExcess / (durationMs / 1000.0) else 0.0
            val audioRms = if (audioWindowSamples > 0) sqrt(audioWindowSumSq / audioWindowSamples) else 0.0
            val audioZcr = if (audioWindowSamples > 0) audioWindowZcr.toDouble() / audioWindowSamples else 0.0
            val hasAudio = audioWindowSamples > 0
            // Fase C: clasificador WAKE/LIGHT/DEEP (Cole-Kripke adaptado, sin ML)
            // WAKE si avg >= 1.02 (HIGH) o audioRms alto; si no, LIGHT/DEEP por avg y audio
            val level = when {
                avg < 0.93 -> "LOW"
                avg < 1.02 -> "MED"
                else -> "HIGH"
            }
            val isWake = avg >= SMART_WAKE_THRESHOLD || (hasAudio && audioRms >= SMART_AUDIO_RMS_THRESHOLD && avg >= 0.93)
            val rawStage = when {
                isWake -> "WAKE"
                avg < SMART_LIGHT_AVG_THRESHOLD && (!hasAudio || audioRms < SMART_AUDIO_RMS_THRESHOLD) -> "DEEP"
                else -> "LIGHT"
            }
            val distance = when (rawStage) {
                "WAKE" -> kotlin.math.abs(avg - SMART_WAKE_THRESHOLD) / 0.5
                "DEEP" -> kotlin.math.abs(avg - SMART_LIGHT_AVG_THRESHOLD) / 0.3
                else -> kotlin.math.abs(avg - 0.96) / 0.3
            }
            val rawConfidence = (0.5 + distance * 0.5).coerceIn(0.3, 0.95)
            // Suavizado: requiere 2 ventanas consecutivas mismo rawStage para cambiar smoothed
            val smoothed = if (prevRawStage == rawStage || prevPrevRawStage == rawStage) rawStage else smoothedStage
            val confidence = if (smoothed == rawStage) rawConfidence else (rawConfidence * 0.7).coerceIn(0.3, 0.9)
            prevPrevRawStage = prevRawStage
            prevRawStage = rawStage
            smoothedStage = smoothed
            val obj = JSONObject()
                .put("startTime", startWall)
                .put("durationMs", durationMs)
                .put("avgMovement", round3(avg))
                .put("maxMovement", round3(smartWindowMax.toDouble()))
                .put("avgExcess", round3(avgExcess))
                .put("samples", smartWindowSamples)
                .put("audioRms", round3(audioRms))
                .put("audioZcr", round3(audioZcr))
                .put("audioSamples", audioWindowSamples)
                .put("hasAudio", hasAudio)
                .put("level", level)
                .put("stage", smoothed)
                .put("rawStage", rawStage)
                .put("confidence", round3(confidence))
            closedSmartWindows.put(obj)
            if (closedSmartWindows.length() > SMART_MAX_WINDOWS) {
                closedSmartWindows.remove(0)
            }
            Log.i(
                "SmartSleep",
                "ventana 30s #$idx avg=${String.format(Locale.US, "%.3f", avg)} " +
                    "max=${String.format(Locale.US, "%.3f", smartWindowMax)} " +
                    "avgExcess=${String.format(Locale.US, "%.3f", avgExcess)} " +
                    "samples=$smartWindowSamples $level " +
                    "audioRms=${String.format(Locale.US, "%.4f", audioRms)} " +
                    "audioZcr=${String.format(Locale.US, "%.4f", audioZcr)} " +
                    "audioSamples=$audioWindowSamples ${if (hasAudio) "AUDIO" else "NO_AUDIO"} " +
                    "stage=$smoothed raw=$rawStage conf=${String.format(Locale.US, "%.2f", confidence)}"
            )
            // Fase B: log separado audio para filtrar logcat SmartAudio
            if (hasAudio) {
                Log.i("SmartAudio", "ventana 30s #$idx rms=${String.format(Locale.US, "%.4f", audioRms)} zcr=${String.format(Locale.US, "%.4f", audioZcr)} samples=$audioWindowSamples stage=$smoothed")
            } else {
                Log.i("SmartAudio", "ventana 30s #$idx NO_AUDIO stage=$smoothed")
            }
            // Fase C: SmartAlarm ventana favorable (progresiva: sonido suave -> vibración)
            try {
                val inWindow = isInSmartAlarmWindow(this@SleepForegroundService, startWall)
                if (inWindow && smoothed == "LIGHT" && confidence >= 0.6) {
                    // Evitar disparar cada 30s dentro de misma ventana: solo 1 vez por noche/ventana
                    val prefs = this@SleepForegroundService.getSharedPreferences(SMART_ALARM_PREFS_NAME, Context.MODE_PRIVATE)
                    val lastFavorable = prefs.getLong("lastFavorableMs", 0L)
                    val alreadyFired = lastFavorable != 0L && kotlin.math.abs(startWall - lastFavorable) < 3600000L // 1h
                    if (!alreadyFired) {
                        Log.i("SmartAlarm", "momento favorable LIGHT en ventana SmartAlarm idx=$idx conf=${String.format(Locale.US, "%.2f", confidence)} — disparando alarma progresiva")
                        prefs.edit().putLong("lastFavorableMs", startWall).apply()
                        SmartAlarmScheduler.scheduleFavorableNow(this@SleepForegroundService)
                    } else {
                        Log.i("SmartAlarm", "momento favorable LIGHT ya disparado antes (last=$lastFavorable) — ignorado")
                    }
                } else if (inWindow) {
                    Log.i("SmartAlarm", "en ventana SmartAlarm pero stage=$smoothed conf=${String.format(Locale.US, "%.2f", confidence)} no favorable")
                }
            } catch (e: Exception) {
                recordError("smartAlarmCheck", e.toString())
            }
            smartWindowSum = 0.0
            smartWindowMax = 0f
            smartWindowSamples = 0
            smartWindowAccumExcess = 0.0
            audioWindowSumSq = 0.0
            audioWindowSamples = 0
            audioWindowZcr = 0
            // no resetea audioPrevSample para ZCR continuo entre ventanas (opcional)
            lastClosedSmartIdx = idx
            writePrefs()
        }

        private fun closeEpoch(idx: Long, durationMs: Long) {
            val startWall = sessionStartMs + idx * MOVEMENT_EPOCH_MS
            val score = epochScoreFor(durationMs)
            val obj = JSONObject()
                .put("startTime", startWall)
                .put("durationMs", durationMs)
                .put("movementScore", round3(score))
                .put("movementEvents", epochEvents)
            closedEpochs.put(obj)
            if (closedEpochs.length() > MOVEMENT_MAX_EPOCHS) {
                closedEpochs.remove(0)
            }
            Log.i(
                "Movement",
                "epoch completado eventos=$epochEvents " +
                    "score=${String.format(Locale.US, "%.3f", score)} idx=$idx"
            )
            epochEvents = 0
            epochScoreAccum = 0.0
            lastClosedIdx = idx
            writePrefs()
        }

        private fun epochScoreFor(durationMs: Long): Double {
            return if (durationMs > 0) {
                epochScoreAccum / (durationMs / 1000.0)
            } else {
                0.0
            }
        }

        private fun weightedScore(epochs: JSONArray): Double {
            var weighted = 0.0
            var totalMs = 0L
            for (i in 0 until epochs.length()) {
                val e = epochs.getJSONObject(i)
                val d = e.optLong("durationMs", 0L)
                weighted += e.optDouble("movementScore", 0.0) * d
                totalMs += d
            }
            return if (totalMs > 0) weighted / totalMs else 0.0
        }

        private fun round3(value: Double): Double {
            return (value * 1000).roundToLong() / 1000.0
        }

        private fun writePrefs() {
            try {
                val json = JSONObject()
                    .put("events", totalEvents)
                    .put("lastEpochIdx", lastClosedIdx)
                    .put("score", round3(weightedScore(closedEpochs)))
                    .put("epochs", closedEpochs)
                    .put("smartWindows", closedSmartWindows)
                    .put("lastSmartWindowIdx", lastClosedSmartIdx)
                    .put("smartWindowMs", SMART_WINDOW_MS)
                getSharedPreferences(MOVEMENT_PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putString(MOVEMENT_PREFS_KEY, json.toString())
                    .apply()
            } catch (e: Exception) {
                recordError("movementWrite", e.toString())
            }
        }
    }
}
