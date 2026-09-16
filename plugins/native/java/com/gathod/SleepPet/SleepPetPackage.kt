package com.gathod.SleepPet

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SleepPetPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {

        return listOf(
            AccessibilityModule(reactContext),
            MovementModule(reactContext),
            NotificationModule(reactContext),
            ReminderModule(reactContext),
            SmartAlarmModule(reactContext)
        )

    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {

        return emptyList()

    }
}
