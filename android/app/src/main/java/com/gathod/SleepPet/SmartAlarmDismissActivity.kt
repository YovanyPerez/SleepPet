package com.gathod.SleepPet

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.text.InputType
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Desafío para apagar la SmartAlarm: muestra una palabra aleatoria (banco
 * ES/EN sin tildes, según dismissLang) y solo silencia al teclearla exacta.
 * Estilo nocturno de la app (degradado + luna + input glass), programático
 * para que `expo prebuild` no borre layouts XML. Se muestra sobre el bloqueo.
 * El acierto reutiliza ACTION_STOP (misma ruta que Detener: fecha + cancela
 * escaladas + para el player). Atrás bloqueado: solo se sale acertando.
 */
class SmartAlarmDismissActivity : Activity() {

    companion object {
        private const val TAG = "SmartAlarm"

        private val WORDS_ES = arrayOf(
            "despertar", "ventana", "guitarra", "manzana",
            "bosque", "camino", "jardin", "pelota",
            "luna", "cafe", "trueno", "espejo"
        )
        private val WORDS_EN = arrayOf(
            "morning", "window", "guitar", "apple",
            "forest", "pillow", "cloud", "thunder",
            "mirror", "coffee", "river", "candle"
        )
    }

    private var word: String = ""
    private var langEn: Boolean = false
    private lateinit var input: EditText
    private lateinit var errorText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                setShowWhenLocked(true)
                setTurnScreenOn(true)
            } else {
                @Suppress("DEPRECATION")
                window.addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                )
            }
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        } catch (e: Exception) {
            Log.w(TAG, "lockscreen flags error ${e.message}")
        }

        val prefs = getSharedPreferences(
            SleepForegroundService.SMART_ALARM_PREFS_NAME, MODE_PRIVATE
        )
        // Si ya se resolvió hoy (ej. activity vieja tras reboot), no molestar
        if (SmartAlarmReceiver.isStoppedToday(prefs)) {
            finish()
            return
        }
        langEn = prefs.getString("dismissLang", "es") == "en"
        word = savedInstanceState?.getString("word")?.takeIf { it.isNotEmpty() }
            ?: pickWord()
        setContentView(buildUi())
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString("word", word)
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        // Bloqueado: solo se sale acertando la palabra
    }

    private fun pickWord(): String {
        val bank = if (langEn) WORDS_EN else WORDS_ES
        return bank[kotlin.random.Random(System.currentTimeMillis()).nextInt(bank.size)]
    }

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()

    private fun glassBg(radiusDp: Int, fill: Int, stroke: Int): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dp(radiusDp).toFloat()
            setColor(fill)
            setStroke(dp(1), stroke)
        }
    }

    private fun buildUi(): LinearLayout {
        val tTitle = if (langEn) "Good morning" else "Buenos días"
        val tHint = if (langEn) "Type the word to stop the alarm"
            else "Escribe la palabra para apagar la alarma"
        val tButton = if (langEn) "STOP" else "APAGAR"
        val tWordHint = if (langEn) "Word" else "Palabra"

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(32), dp(48), dp(32), dp(48))
            background = GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                intArrayOf(0xFF1B1B4B.toInt(), 0xFF5E60CE.toInt())
            )
        }

        val moon = ImageView(this).apply {
            try {
                setImageResource(R.drawable.ic_sleep_moon)
            } catch (_: Exception) {}
            layoutParams = LinearLayout.LayoutParams(dp(72), dp(72)).apply {
                gravity = Gravity.CENTER
                bottomMargin = dp(16)
            }
        }
        root.addView(moon)

        val title = TextView(this).apply {
            text = tTitle
            setTextColor(Color.WHITE)
            textSize = 30f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            gravity = Gravity.CENTER
        }
        root.addView(title)

        val wordView = TextView(this).apply {
            text = word
            setTextColor(0xFFFFD166.toInt())
            textSize = 38f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dp(24)
                bottomMargin = dp(8)
            }
        }
        root.addView(wordView)

        val hint = TextView(this).apply {
            text = tHint
            setTextColor(Color.argb(179, 255, 255, 255))
            textSize = 14f
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(16) }
        }
        root.addView(hint)

        input = EditText(this).apply {
            setHint(tWordHint)
            setHintTextColor(Color.argb(128, 255, 255, 255))
            setTextColor(Color.WHITE)
            textSize = 22f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            gravity = Gravity.CENTER
            // Sin sugerencias/autocorrect: el teclado no debe regalar la palabra
            inputType = InputType.TYPE_CLASS_TEXT or
                InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
            imeOptions = EditorInfo.IME_ACTION_DONE
            background = glassBg(
                16,
                Color.argb(26, 255, 255, 255),
                Color.argb(41, 255, 255, 255)
            )
            setPadding(dp(18), dp(16), dp(18), dp(16))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setOnEditorActionListener { _, actionId, _ ->
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    checkWord()
                    true
                } else false
            }
        }
        root.addView(input)

        errorText = TextView(this).apply {
            text = if (langEn) "Almost… try again" else "Casi… intenta de nuevo"
            setTextColor(0xFFFF8FAB.toInt())
            textSize = 13f
            gravity = Gravity.CENTER
            visibility = android.view.View.GONE
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(8) }
        }
        root.addView(errorText)

        val button = Button(this, null, android.R.attr.buttonStyle).apply {
            text = tButton
            setTextColor(Color.WHITE)
            textSize = 16f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            isAllCaps = true
            background = glassBg(28, 0xFF5E60CE.toInt(), 0xFF5E60CE.toInt())
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(20) }
            setPadding(dp(18), dp(18), dp(18), dp(18))
            setOnClickListener { checkWord() }
        }
        root.addView(button)

        return root
    }

    private fun checkWord() {
        val typed = input.text.toString().trim().lowercase()
        if (typed == word) {
            Log.i(TAG, "desafío resuelto — apagando alarma")
            try {
                val stop = Intent(this, SmartAlarmReceiver::class.java).apply {
                    action = SmartAlarmScheduler.ACTION_STOP
                }
                sendBroadcast(stop)
            } catch (e: Exception) {
                Log.e(TAG, "stop error ${e.message}")
            }
            finish()
        } else {
            errorText.visibility = android.view.View.VISIBLE
            buzz(200)
            input.selectAll()
        }
    }

    private fun buzz(ms: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = getSystemService(VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vm?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                (getSystemService(VIBRATOR_SERVICE) as? Vibrator)?.let { vib ->
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vib.vibrate(
                            VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE)
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        vib.vibrate(ms)
                    }
                }
            }
        } catch (_: Exception) {}
    }
}
