package com.gathod.SleepPet

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Calendar

class ReminderModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS = "sleep_reminder"
        const val KEY_HOUR = "hour"
        const val KEY_MINUTE = "minute"
        const val KEY_CHANNEL_NAME = "channelName"
        const val KEY_CHANNEL_DESC = "channelDescription"
        const val KEY_TITLE = "title"
        const val KEY_CONTENT = "content"

        const val CHANNEL_ID = "sleep_reminder_channel"
        const val NOTIFICATION_ID = 2001
        const val REQUEST_CODE = 2002

        fun buildPendingIntent(context: Context): PendingIntent {
            val alarmIntent = Intent(
                context,
                ReminderReceiver::class.java
            )
            return PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
            )
        }

        fun nextTriggerAt(
            hour: Int,
            minute: Int
        ): Long {
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            if (calendar.timeInMillis <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }

            return calendar.timeInMillis
        }

        fun scheduleAlarmClock(
            context: Context,
            hour: Int,
            minute: Int
        ) {
            val alarmManager = context.getSystemService(
                Context.ALARM_SERVICE
            ) as AlarmManager

            val pendingIntent = buildPendingIntent(context)

            val trigger = nextTriggerAt(hour, minute)

            val canUseExact =
                Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
                    alarmManager.canScheduleExactAlarms()

            if (canUseExact) {

                val info = AlarmManager.AlarmClockInfo(
                    trigger,
                    pendingIntent
                )

                alarmManager.setAlarmClock(info, pendingIntent)

            } else {

                alarmManager.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    trigger,
                    AlarmManager.INTERVAL_DAY,
                    pendingIntent
                )

            }
        }
    }

    override fun getName(): String = "ReminderModule"

    @ReactMethod
    fun schedule(
        hour: Int,
        minute: Int,
        channelName: String,
        channelDescription: String,
        title: String,
        content: String
    ) {
        val prefs = reactContext.getSharedPreferences(
            PREFS,
            Context.MODE_PRIVATE
        )

        prefs.edit()
            .putInt(KEY_HOUR, hour)
            .putInt(KEY_MINUTE, minute)
            .putString(KEY_CHANNEL_NAME, channelName)
            .putString(KEY_CHANNEL_DESC, channelDescription)
            .putString(KEY_TITLE, title)
            .putString(KEY_CONTENT, content)
            .apply()

        createChannel(channelName, channelDescription)

        scheduleAlarmClock(reactContext, hour, minute)
    }

    @ReactMethod
    fun canScheduleExact(promise: Promise) {
        val alarmManager = reactContext.getSystemService(
            Context.ALARM_SERVICE
        ) as AlarmManager

        val ok =
            Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
                alarmManager.canScheduleExactAlarms()

        promise.resolve(ok)
    }

    @ReactMethod
    fun openExactAlarmSettings() {
        try {
            val intent = Intent(
                Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                Uri.parse("package:" + reactContext.packageName)
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            // Dispositivo o ROM sin esta pantalla: se ignora.
        }
    }

    @ReactMethod
    fun cancel() {
        val alarmManager = reactContext.getSystemService(
            Context.ALARM_SERVICE
        ) as AlarmManager

        alarmManager.cancel(buildPendingIntent(reactContext))

        reactContext.getSharedPreferences(
            PREFS,
            Context.MODE_PRIVATE
        ).edit().clear().apply()
    }

    private fun createChannel(
        channelName: String,
        channelDescription: String
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = channelDescription
            }

            val manager = reactContext.getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager

            manager.createNotificationChannel(channel)
        }
    }
}
