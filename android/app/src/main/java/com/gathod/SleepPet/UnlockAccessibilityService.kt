package com.gathod.SleepPet

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class UnlockAccessibilityService : AccessibilityService() {

    companion object {
        private const val SLEEPPET_PACKAGE = "com.gathod.SleepPet"
    }

    private var lastPackage = ""
    private var wasInSleepPet = false

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
            wasInSleepPet = true
            return
        }

        // Solo contar cuando estaba en SleepPet y abrió otra app
        if (wasInSleepPet) {

            wasInSleepPet = false

            AccessibilityModule.checkForegroundApp(packageName)
        }
    }

    override fun onInterrupt() {
    }
}