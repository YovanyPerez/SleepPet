package com.gathod.SleepPet

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
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

        val isFollowup = intent.action == ReminderModule.ACTION_FOLLOWUP

        if (isFollowup) {
            // Si ya está durmiendo, cancelar cadena y re-agendar diario
            if (prefs.getBoolean(ReminderModule.KEY_SLEEP_ACTIVE, false)) {
                ReminderModule.cancelFollowups(context)
                if (prefs.contains(ReminderModule.KEY_HOUR)) {
                    val hour = prefs.getInt(ReminderModule.KEY_HOUR, 22)
                    val minute = prefs.getInt(ReminderModule.KEY_MINUTE, 30)
                    ReminderModule.scheduleAlarmClock(context, hour, minute)
                }
                return
            }

            val count = prefs.getInt(ReminderModule.KEY_FOLLOWUP_COUNT, 0)
            val max = prefs.getInt(ReminderModule.KEY_FOLLOWUP_MAX, ReminderModule.DEFAULT_FOLLOWUP_MAX)

            if (count >= max) {
                // Tope alcanzado: re-agenda diario y para
                ReminderModule.cancelFollowups(context)
                if (prefs.contains(ReminderModule.KEY_HOUR)) {
                    val hour = prefs.getInt(ReminderModule.KEY_HOUR, 22)
                    val minute = prefs.getInt(ReminderModule.KEY_MINUTE, 30)
                    ReminderModule.scheduleAlarmClock(context, hour, minute)
                }
                return
            }

            // Mostrar notificación followup con texto diferenciado
            showNotification(context, prefs, isFollowup = true)

            // Incrementar contador y agendar siguiente
            prefs.edit().putInt(ReminderModule.KEY_FOLLOWUP_COUNT, count + 1).apply()
            ReminderModule.scheduleFollowup(context)
            return
        }

        // Alarma diaria inicial
        if (prefs.getBoolean(ReminderModule.KEY_SLEEP_ACTIVE, false)) {
            // Ya durmiendo antes de la hora: no molestar, re-agendar mañana
            if (prefs.contains(ReminderModule.KEY_HOUR)) {
                val hour = prefs.getInt(ReminderModule.KEY_HOUR, 22)
                val minute = prefs.getInt(ReminderModule.KEY_MINUTE, 30)
                ReminderModule.scheduleAlarmClock(context, hour, minute)
            }
            return
        }

        showNotification(context, prefs)

        // Inicia cadena de followups cada 15 min
        prefs.edit().putInt(ReminderModule.KEY_FOLLOWUP_COUNT, 1).apply()
        val max = prefs.getInt(ReminderModule.KEY_FOLLOWUP_MAX, ReminderModule.DEFAULT_FOLLOWUP_MAX)
        if (1 < max) {
            ReminderModule.scheduleFollowup(context)
        } else {
            // Si max es 1, no hay followups: re-agendar diario
            if (prefs.contains(ReminderModule.KEY_HOUR)) {
                val hour = prefs.getInt(ReminderModule.KEY_HOUR, 22)
                val minute = prefs.getInt(ReminderModule.KEY_MINUTE, 30)
                ReminderModule.scheduleAlarmClock(context, hour, minute)
            }
        }
    }

    private fun showNotification(
        context: Context,
        prefs: android.content.SharedPreferences,
        isFollowup: Boolean = false
    ) {
        val channelName = prefs.getString(
            ReminderModule.KEY_CHANNEL_NAME,
            "SleepPet"
        ) ?: "SleepPet"

        val channelDescription = prefs.getString(
            ReminderModule.KEY_CHANNEL_DESC,
            ""
        ) ?: ""

        val title = if (isFollowup) {
            prefs.getString(
                ReminderModule.KEY_FOLLOWUP_TITLE,
                prefs.getString(ReminderModule.KEY_TITLE, "SleepPet") ?: "SleepPet"
            ) ?: "SleepPet"
        } else {
            prefs.getString(
                ReminderModule.KEY_TITLE,
                "SleepPet"
            ) ?: "SleepPet"
        }

        val content = if (isFollowup) {
            prefs.getString(
                ReminderModule.KEY_FOLLOWUP_CONTENT,
                prefs.getString(ReminderModule.KEY_CONTENT, "") ?: ""
            ) ?: ""
        } else {
            prefs.getString(
                ReminderModule.KEY_CONTENT,
                ""
            ) ?: ""
        }

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
            .setSmallIcon(R.drawable.ic_sleep_moon)
            .setColor(0xFF5E60CE.toInt())
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher))
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
