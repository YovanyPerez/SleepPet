package com.gathod.SleepPet

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.Collections

/**
 * Mantiene viva la sesión de sueño en segundo plano.
 * Una notificación "ongoing" normal NO conserva el proceso;
 * este foreground service sí, y así el listener de accesibilidad
 * sigue contando los desbloqueos del teléfono.
 */
class SleepForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "sleep_session_channel"
        const val NOTIFICATION_ID = 1001

        const val EXTRA_START_TIME = "startTime"
        const val EXTRA_CHANNEL_NAME = "channelName"
        const val EXTRA_CHANNEL_DESC = "channelDescription"
        const val EXTRA_TITLE = "title"
        const val EXTRA_CONTENT = "content"
        const val EXTRA_TIME_LABEL = "timeLabel"
        const val EXTRA_UNLOCK_LABEL = "unlockLabel"

        private var instance: SleepForegroundService? = null

        private val errorLog = Collections.synchronizedList(
            mutableListOf<String>()
        )

        fun recordError(source: String, message: String?) {
            val line = "$source: ${message ?: "sin mensaje"}"
            errorLog.add(line)
            if (errorLog.size > 30) errorLog.removeAt(0)
            Log.e("SleepPet", line)
        }

        fun getErrorLog(): List<String> = errorLog.toList()

        fun updateUnlocks(count: Int) {
            instance?.unlocks = count
        }

        fun stopAndRemoveNotification(context: Context) {
            instance?.let { service ->
                service.running = false
                service.handler.removeCallbacksAndMessages(null)
            }
            val manager = context.getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager
            manager.cancel(NOTIFICATION_ID)
            context.stopService(
                Intent(context, SleepForegroundService::class.java)
            )
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private val updateRunnable = object : Runnable {
        override fun run() {
            if (!running) return
            try {
                val manager = getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager
                manager.notify(NOTIFICATION_ID, buildNotification())
            } catch (e: Exception) {
                recordError("updateNotif", e.toString())
            }
            handler.postDelayed(this, 1000)
        }
    }

    private var startTime: Long = 0L
    private var unlocks = 0
    private var running = false

    private var channelName = ""
    private var channelDescription = ""
    private var notificationTitle = ""
    private var notificationContent = ""
    private var timeLabel = ""
    private var unlockLabel = ""

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {
        if (intent == null) {
            return START_STICKY
        }

        startTime = intent.getLongExtra(
            EXTRA_START_TIME,
            System.currentTimeMillis()
        )
        channelName = intent.getStringExtra(EXTRA_CHANNEL_NAME) ?: ""
        channelDescription = intent.getStringExtra(EXTRA_CHANNEL_DESC) ?: ""
        notificationTitle = intent.getStringExtra(EXTRA_TITLE) ?: ""
        notificationContent = intent.getStringExtra(EXTRA_CONTENT) ?: ""
        timeLabel = intent.getStringExtra(EXTRA_TIME_LABEL) ?: ""
        unlockLabel = intent.getStringExtra(EXTRA_UNLOCK_LABEL) ?: ""

        createChannel()

        try {
            startForeground(
                NOTIFICATION_ID,
                buildNotification()
            )
        } catch (e: Exception) {
            recordError("startForeground", e.toString())
            stopSelf()
            return START_NOT_STICKY
        }

        running = true

        handler.postDelayed(updateRunnable, 1000)

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        running = false
        instance = null
        handler.removeCallbacksAndMessages(null)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = channelDescription
                setShowBadge(false)
            }
            val manager = getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun elapsedString(): String {
        val elapsedMillis = System.currentTimeMillis() - startTime
        val totalSeconds = (elapsedMillis / 1000).coerceAtLeast(0)
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return String.format("%d:%02d:%02d", hours, minutes, seconds)
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(notificationTitle)
            .setContentText(notificationContent)
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "$timeLabel: ${elapsedString()}\n" +
                        "$unlockLabel: $unlocks"
                )
            )
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }
}
