package com.gathod.SleepPet

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class UnlockAccessibilityService : AccessibilityService() {

    companion object {
        private const val SLEEPPET_PACKAGE = "com.gathod.SleepPet"
        private const val SYSTEM_UI = "com.android.systemui"
        private const val TAG = "UnlockA11y"
        private const val MIN_INTERVAL_MS = 2000L
    }

    private var lastPackage = ""

    private var armed = false

    private var lastCountTime = 0L

    private val screenReceiver = object : BroadcastReceiver() {

        override fun onReceive(context: Context?, intent: Intent?) {

            when (intent?.action) {

                Intent.ACTION_SCREEN_OFF -> {

                    Log.d(TAG, "Pantalla apagada: armado")

                    armed = true

                }

                Intent.ACTION_USER_PRESENT -> {

                    Log.d(TAG, "Usuario desbloqueó (USER_PRESENT)")

                    countUnlock()

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

        try {

            unregisterReceiver(screenReceiver)

        } catch (e: Exception) {

            Log.w(TAG, "Receiver no registrado", e)

        }

        return super.onUnbind(intent)

    }

    override fun onDestroy() {

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

        armed = false

        lastCountTime = now

        Log.i(TAG, "DESBLOQUEO contado en: $packageName")

        AccessibilityModule.checkForegroundApp(packageName)

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
