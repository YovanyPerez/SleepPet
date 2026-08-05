package com.gathod.SleepPet

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class NotificationModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val CHANNEL_ID = "sleep_session_channel"
        const val NOTIFICATION_ID = 1001
    }

    private val notificationManager =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE)
                as NotificationManager

    private val handler = Handler(Looper.getMainLooper())

    private var startTime: Long = 0L
    private var unlocks = 0
    private var running = false

    private var channelName = ""
    private var channelDescription = ""
    private var notificationTitle = ""
    private var notificationContent = ""
    private var timeLabel = ""
    private var unlockLabel = ""

    override fun getName(): String {
        return "NotificationModule"
    }

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

        this.channelName = channelName
        this.channelDescription = channelDescription
        this.notificationTitle = notificationTitle
        this.notificationContent = notificationContent
        this.timeLabel = timeLabel
        this.unlockLabel = unlockLabel

        createChannel()

        val format = SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            Locale.US
        )

        format.timeZone = TimeZone.getTimeZone("UTC")

        startTime = try {
            format.parse(startTimeString)?.time
                ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }

        unlocks = 0
        running = true

        updateLoop()
    }

    private fun createChannel() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            val channel = NotificationChannel(
                CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_LOW
            )

            channel.description = channelDescription

            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun updateLoop() {

        if (!running) return

        val elapsedMillis =
            System.currentTimeMillis() - startTime

        val totalSeconds = elapsedMillis / 1000

        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60

        val elapsed = String.format(
            "%d:%02d:%02d",
            hours,
            minutes,
            seconds
        )

        notificationManager.notify(
            NOTIFICATION_ID,
            buildNotification(
                elapsed,
                unlocks
            )
        )

        handler.postDelayed(
            {
                updateLoop()
            },
            1000
        )
    }

    @ReactMethod
    fun updateUnlocks(count: Int) {
        unlocks = count
    }

    @ReactMethod
    fun stopNotification() {

        running = false

        handler.removeCallbacksAndMessages(null)

        notificationManager.cancel(
            NOTIFICATION_ID
        )
    }

    private fun buildNotification(
        elapsed: String,
        unlocks: Int
    ): Notification {

        return NotificationCompat.Builder(
            reactApplicationContext,
            CHANNEL_ID
        )
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(notificationTitle)
            .setContentText(notificationContent)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(
                        "$timeLabel: $elapsed\n$unlockLabel: $unlocks"
                    )
            )
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }
}