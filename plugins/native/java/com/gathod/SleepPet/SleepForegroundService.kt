package com.gathod.SleepPet

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.util.Log
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

        handler.postDelayed(updateRunnable, 1000)

        startMovement(resumeMovement)

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        running = false
        stopMovement()
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

        /** Cierre de epochs por tiempo (tick de 1s del servicio) + log de calibración. */
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
            // Smart windows 30s — snapshot no-mutante
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
                smartAll.put(
                    JSONObject()
                        .put("startTime", sStart)
                        .put("durationMs", sDuration)
                        .put("avgMovement", round3(avg))
                        .put("maxMovement", round3(smartWindowMax.toDouble()))
                        .put("avgExcess", round3(avgExcess))
                        .put("samples", smartWindowSamples)
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

        private fun maybeCloseSmartWindows(nowWallMs: Long) {
            val idx = currentSmartIdx(nowWallMs)
            while (idx > lastClosedSmartIdx + 1) {
                closeSmartWindow(lastClosedSmartIdx + 1, SMART_WINDOW_MS)
            }
        }

        private fun closeSmartWindow(idx: Long, durationMs: Long) {
            val startWall = sessionStartMs + idx * SMART_WINDOW_MS
            val avg = if (smartWindowSamples > 0) smartWindowSum / smartWindowSamples else 0.0
            val avgExcess = if (durationMs > 0) smartWindowAccumExcess / (durationMs / 1000.0) else 0.0
            val obj = JSONObject()
                .put("startTime", startWall)
                .put("durationMs", durationMs)
                .put("avgMovement", round3(avg))
                .put("maxMovement", round3(smartWindowMax.toDouble()))
                .put("avgExcess", round3(avgExcess))
                .put("samples", smartWindowSamples)
            closedSmartWindows.put(obj)
            if (closedSmartWindows.length() > SMART_MAX_WINDOWS) {
                closedSmartWindows.remove(0)
            }
            // Clasificación temporal para log: LOW <0.10, MED <0.25, HIGH >=0.25 (calibración Fase A)
            val level = when {
                avg < 0.10 -> "LOW"
                avg < 0.25 -> "MED"
                else -> "HIGH"
            }
            Log.i(
                "SmartSleep",
                "ventana 30s #$idx avg=${String.format(Locale.US, "%.3f", avg)} " +
                    "max=${String.format(Locale.US, "%.3f", smartWindowMax)} " +
                    "avgExcess=${String.format(Locale.US, "%.3f", avgExcess)} " +
                    "samples=$smartWindowSamples $level"
            )
            smartWindowSum = 0.0
            smartWindowMax = 0f
            smartWindowSamples = 0
            smartWindowAccumExcess = 0.0
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
