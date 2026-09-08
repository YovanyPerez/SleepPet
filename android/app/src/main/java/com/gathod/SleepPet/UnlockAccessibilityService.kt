package com.gathod.SleepPet
import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class UnlockAccessibilityService : AccessibilityService() {

    companion object {

        private const val SLEEPPET_PACKAGE = "com.gathod.SleepPet"
        private const val SYSTEM_UI = "com.android.systemui"
        private const val TAG = "UnlockA11y"
        private const val MIN_INTERVAL_MS = 2000L

        // Delay para resolver qué app quedó en primer plano tras USER_PRESENT:
        // en el instante del desbloqueo la keyguard recién se va y rootInActiveWindow
        // puede apuntar a la app anterior. Tunable, validar con pruebas reales.
        private const val FOREGROUND_CHECK_DELAY_MS = 800L
    }

    private var lastPackage = ""

    private var armed = false

    private var lastCountTime = 0L

    private val handler = Handler(Looper.getMainLooper())

    private val screenReceiver = object : BroadcastReceiver() {

        override fun onReceive(context: Context?, intent: Intent?) {

            when (intent?.action) {

                Intent.ACTION_SCREEN_OFF -> {

                    Log.d(TAG, "Pantalla apagada: armado")

                    armed = true

                }

                Intent.ACTION_USER_PRESENT -> {

                    Log.d(TAG, "Usuario desbloqueó (USER_PRESENT)")

                    // Se resuelve el paquete real tras un delay corto y se pasa a
                    // countUnlock: si el usuario quedó en SleepPet, el filtro de
                    // checkForegroundApp ya funciona (antes se pasaba "" y contaba siempre).
                    handler.postDelayed(
                        { countUnlock(foregroundPackage()) },
                        FOREGROUND_CHECK_DELAY_MS
                    )

                }

            }

        }

    }

    override fun onServiceConnected() {

        super.onServiceConnected()

        Log.i(TAG, "Servicio conectado")

        val filter = IntentFilter().apply {

            addAction(Intent.ACTION_SCREEN_OFF)

            addAction(Intent.ACTION_USER_PRESENT)

        }

        registerReceiver(screenReceiver, filter)

    }

    override fun onUnbind(intent: Intent?): Boolean {

        Log.i(TAG, "Servicio desenlazado")

        handler.removeCallbacksAndMessages(null)

        try {

            unregisterReceiver(screenReceiver)

        } catch (e: Exception) {

            Log.w(TAG, "Receiver no registrado", e)

        }

        return super.onUnbind(intent)

    }

    override fun onDestroy() {

        handler.removeCallbacksAndMessages(null)

        try {

            unregisterReceiver(screenReceiver)

        } catch (e: Exception) {

            Log.w(TAG, "Receiver no registrado", e)

        }

        super.onDestroy()

    }

    private fun countUnlock(packageName: String = "") {

        val now = System.currentTimeMillis()

        if (!armed) {

            Log.d(TAG, "Ignorado: no armado")

            return

        }

        if (now - lastCountTime < MIN_INTERVAL_MS) {

            Log.d(TAG, "Ignorado: demasiado rápido")

            return

        }

        // Si quedó en SleepPet no se cuenta ni se consume: el armado sobrevive
        // y la primera app real que abra después contará 1 vía el fallback
        // (TYPE_WINDOW_STATE_CHANGED). Así desbloqueo→SleepPet→otra app sí cuenta.
        if (packageName == SLEEPPET_PACKAGE) {

            Log.i(TAG, "Desbloqueo en SleepPet: en espera")

            return

        }

        // Decisión única por desbloqueo contado: se consume el armado para que
        // navegaciones posteriores con la pantalla encendida no sobrecuenten.
        armed = false

        lastCountTime = now

        Log.i(TAG, "DESBLOQUEO contado en: $packageName")

        AccessibilityModule.checkForegroundApp(packageName)

    }

    /**
     * Paquete de la ventana activa visible tras el desbloqueo, leído por el
     * propio servicio de accesibilidad. "" si la transición aún no define
     * ventana: en ese caso cuenta por defecto (comportamiento conservador).
     */
    private fun foregroundPackage(): String {

        return try {

            rootInActiveWindow?.packageName?.toString() ?: ""

        } catch (e: Exception) {

            Log.w(TAG, "No se pudo leer la ventana activa", e)

            ""

        }

    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {

        // Respaldo por si USER_PRESENT no llega (dispositivos sin keyguard)

        if (event == null) return

        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED)
            return

        val packageName = event.packageName?.toString() ?: return

        if (packageName == lastPackage)
            return

        lastPackage = packageName

        if (packageName == SLEEPPET_PACKAGE)
            return

        if (packageName == SYSTEM_UI)
            return

        if (!armed)
            return

        if (!isRealApp(packageName)) {

            Log.d(TAG, "No es app real: $packageName")

            return

        }

        countUnlock(packageName)

    }

    private fun isRealApp(packageName: String): Boolean {

        return try {

            packageManager.getLaunchIntentForPackage(packageName) != null

        } catch (e: Exception) {

            false

        }

    }

    override fun onInterrupt() {
    }

}
