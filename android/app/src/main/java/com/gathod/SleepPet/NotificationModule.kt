package com.gathod.SleepPet

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class NotificationModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationModule"

    @ReactMethod
    fun startNotification(
        startTimeString: String,
        channelName: String,
        channelDescription: String,
        notificationTitle: String,
        notificationContent: String,
        timeLabel: String,
        unlockLabel: String
    ) {
        val reactContext = reactApplicationContext

        val format = SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            Locale.US
        )
        format.timeZone = TimeZone.getTimeZone("UTC")

        val startTime: Long = try {
            val parsed = format.parse(startTimeString)
            if (parsed != null) parsed.time else System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }

        val intent = Intent(
            reactContext,
            SleepForegroundService::class.java
        )
        intent.putExtra(SleepForegroundService.EXTRA_START_TIME, startTime)
        intent.putExtra(SleepForegroundService.EXTRA_CHANNEL_NAME, channelName)
        intent.putExtra(SleepForegroundService.EXTRA_CHANNEL_DESC, channelDescription)
        intent.putExtra(SleepForegroundService.EXTRA_TITLE, notificationTitle)
        intent.putExtra(SleepForegroundService.EXTRA_CONTENT, notificationContent)
        intent.putExtra(SleepForegroundService.EXTRA_TIME_LABEL, timeLabel)
        intent.putExtra(SleepForegroundService.EXTRA_UNLOCK_LABEL, unlockLabel)

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
        } catch (e: Exception) {
            // La app estaba en segundo plano y Android no permitió
            // arrancar el servicio; no debe tumbar la app.
        }
    }

    @ReactMethod
    fun updateUnlocks(count: Int) {
        SleepForegroundService.updateUnlocks(count)
    }

    @ReactMethod
    fun stopNotification() {
        SleepForegroundService.stopAndRemoveNotification(reactApplicationContext)
    }
}
