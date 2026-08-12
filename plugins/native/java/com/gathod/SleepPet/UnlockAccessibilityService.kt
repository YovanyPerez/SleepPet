package com.gathod.SleepPet

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent

class UnlockAccessibilityService : AccessibilityService() {

    companion object {
        private const val SLEEPPET_PACKAGE = "com.gathod.SleepPet"
    }

    private var lastPackage = ""

    private var waitingForRealApp = false

    private val handler = Handler(Looper.getMainLooper())

    private var canCount = true

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {

        if (event == null) return

        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED)
            return

        val packageName = event.packageName?.toString() ?: return

        if (packageName == lastPackage)
            return

        lastPackage = packageName

        // El usuario abrió SleepPet
        if (packageName == SLEEPPET_PACKAGE) {

            waitingForRealApp = true

            return

        }

        // Todavía no ha salido de SleepPet
        if (!waitingForRealApp)
            return

        // Ignorar launcher, pantalla de bloqueo, SystemUI, etc.
        if (!isRealApp(packageName))
            return

        // Evitar múltiples eventos consecutivos
        if (!canCount)
            return

        canCount = false

        waitingForRealApp = false

        AccessibilityModule.checkForegroundApp(packageName)

        handler.postDelayed({

            canCount = true

        }, 3000)

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