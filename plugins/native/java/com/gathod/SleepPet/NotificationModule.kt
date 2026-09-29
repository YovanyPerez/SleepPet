package com.gathod.SleepPet

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class NotificationModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationModule"

    @ReactMethod
    fun getNotificationStatus(promise: Promise) {
        try {
            val context = reactApplicationContext
            val notificationsEnabled =
                NotificationManagerCompat.from(context)
                    .areNotificationsEnabled()
            val activityManager = context.getSystemService(
                Context.ACTIVITY_SERVICE
            ) as ActivityManager
            val serviceRunning = try {
                activityManager
                    .getRunningServices(Int.MAX_VALUE)
                    .any {
                        it.service.className ==
                            SleepForegroundService::class.java.name &&
                            it.foreground
                    }
            } catch (e: Exception) {
                false
            }
            val errors = WritableNativeArray().apply {
                SleepForegroundService.getErrorLog()
                    .forEach { pushString(it) }
            }
            val map = WritableNativeMap().apply {
                putBoolean(
                    "notificationsEnabled",
                    notificationsEnabled
                )
                putBoolean("serviceRunning", serviceRunning)
                putArray("errors", errors)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("status_error", e.message)
        }
    }

    @ReactMethod
    fun openNotificationSettings() {
        val context = reactApplicationContext
        val intent = Intent(
            Settings.ACTION_APP_NOTIFICATION_SETTINGS
        ).apply {
            putExtra(
                Settings.EXTRA_APP_PACKAGE,
                context.packageName
            )
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            val fallback = Intent(
                Settings.ACTION_APPLICATION_DETAILS_SETTINGS
            ).apply {
                data = Uri.parse(
                    "package:${context.packageName}"
                )
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(fallback)
        }
    }

    @ReactMethod
    fun startNotification(
        startTimeString: String,
        channelName: String,
        channelDescription: String,
        notificationTitle: String,
        notificationContent: String,
        timeLabel: String,
        unlockLabel: String,
        resumeMovement: Boolean
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
        intent.putExtra(
            SleepForegroundService.EXTRA_RESUME,
            resumeMovement
        )

        try {
            reactContext.startForegroundService(intent)
        } catch (e: Exception) {
            SleepForegroundService.recordError(
                "startNotification",
                e.toString()
            )
        }
    }

    @ReactMethod
    fun updateUnlocks(count: Int) {
        SleepForegroundService.updateUnlocks(count)
    }

    /**
     * Alerta de felicidad baja (one-shot): si la mascota se recupera antes,
     * JS la cancela con cancelPetAlert. No re-agenda (tras reboot se pierde
     * hasta reabrir la app, igual que el recordatorio).
     */
    @ReactMethod
    fun schedulePetAlert(title: String, content: String, delaySec: Int, promise: Promise) {
        try {
            val context = reactApplicationContext
            val manager = context.getSystemService(
                Context.ALARM_SERVICE
            ) as android.app.AlarmManager
            val intent = Intent(context, PetCheckReceiver::class.java).apply {
                putExtra(PetCheckReceiver.EXTRA_TITLE, title)
                putExtra(PetCheckReceiver.EXTRA_CONTENT, content)
            }
            val pending = android.app.PendingIntent.getBroadcast(
                context,
                PetCheckReceiver.REQUEST_CODE,
                intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or
                    android.app.PendingIntent.FLAG_IMMUTABLE
            )
            val triggerAt = System.currentTimeMillis() +
                (delaySec.coerceAtLeast(60)).toLong() * 1000
            try {
                manager.setExactAndAllowWhileIdle(
                    android.app.AlarmManager.RTC_WAKEUP, triggerAt, pending
                )
            } catch (e: Exception) {
                manager.setAndAllowWhileIdle(
                    android.app.AlarmManager.RTC_WAKEUP, triggerAt, pending
                )
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("petalert_error", e.message)
        }
    }

    @ReactMethod
    fun cancelPetAlert(promise: Promise) {
        try {
            val context = reactApplicationContext
            val manager = context.getSystemService(
                Context.ALARM_SERVICE
            ) as android.app.AlarmManager
            val intent = Intent(context, PetCheckReceiver::class.java)
            val pending = android.app.PendingIntent.getBroadcast(
                context,
                PetCheckReceiver.REQUEST_CODE,
                intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or
                    android.app.PendingIntent.FLAG_IMMUTABLE
            )
            manager.cancel(pending)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("petalert_error", e.message)
        }
    }

    @ReactMethod
    fun stopNotification() {
        SleepForegroundService.stopAndRemoveNotification(reactApplicationContext)
    }
}
