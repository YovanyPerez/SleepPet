package com.gathod.SleepPet

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class ReminderReceiver : BroadcastReceiver() {

    override fun onReceive(
        context: Context,
        intent: Intent
    ) {
        val prefs = context.getSharedPreferences(
            ReminderModule.PREFS,
            Context.MODE_PRIVATE
        )

        val channelName = prefs.getString(
            ReminderModule.KEY_CHANNEL_NAME,
            "SleepPet"
        ) ?: "SleepPet"

        val channelDescription = prefs.getString(
            ReminderModule.KEY_CHANNEL_DESC,
            ""
        ) ?: ""

        val title = prefs.getString(
            ReminderModule.KEY_TITLE,
            "🌙 SleepPet"
        ) ?: "🌙 SleepPet"

        val content = prefs.getString(
            ReminderModule.KEY_CONTENT,
            ""
        ) ?: ""

        createChannel(context, channelName, channelDescription)

        val launchIntent = Intent(
            context,
            MainActivity::class.java
        ).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val contentIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or
                PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(
            context,
            ReminderModule.CHANNEL_ID
        )
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(contentIntent)
            .build()

        val manager = context.getSystemService(
            Context.NOTIFICATION_SERVICE
        ) as NotificationManager

        manager.notify(
            ReminderModule.NOTIFICATION_ID,
            notification
        )

        // Re-agenda la siguiente dosis diaria a la misma hora
        if (prefs.contains(ReminderModule.KEY_HOUR)) {
            val hour = prefs.getInt(ReminderModule.KEY_HOUR, 22)
            val minute = prefs.getInt(ReminderModule.KEY_MINUTE, 30)
            ReminderModule.scheduleAlarmClock(context, hour, minute)
        }
    }

    private fun createChannel(
        context: Context,
        channelName: String,
        channelDescription: String
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                ReminderModule.CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = channelDescription
            }

            val manager = context.getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager

            manager.createNotificationChannel(channel)
        }
    }
}
