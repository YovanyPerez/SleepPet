package com.gathod.SleepPet

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class ScreenAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {

        if (event == null) return

        // Cuando cambia la ventana (se abre otra app)
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

            val packageName = event.packageName?.toString() ?: return

            AccessibilityModule.checkForegroundApp(packageName)

        }

    }

    override fun onInterrupt() {
        // No se necesita hacer nada aquí
    }

}