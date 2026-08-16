# SleepPet — Expo SDK 54 / RN 0.81.5 (Android)

Read the exact versioned Expo docs at https://docs.expo.dev/versions/v54.0.0/ before writing code.

## CRITICAL: New Architecture must stay ON
- `newArchEnabled` is `true` in **both** `app.json` and `android/gradle.properties`.
- The app registers custom legacy native modules (`AccessibilityModule`, `NotificationModule`, `ReminderModule`) in `MainApplication.getPackages()`.
- If New Arch is disabled (Legacy mode), those modules are **not exposed to JS** → `NativeModules.AccessibilityModule` is `undefined` (JS warns "AccessibilityModule not found") and unlock/notification features silently stop working. Keep both flags `true`; `expo prebuild` syncs `app.json` → `gradle.properties`, so changing only one is not enough.

## Native code: two copies, keep in sync
- `plugins/native/java/com/gathod/SleepPet/` is the source of truth; `withSleepPetNative.js` (registered in `app.json` plugins) copies it to `android/app/src/main/java/...` on `expo prebuild`.
- Gradle compiles the `android/` copies. When editing any native `.kt`, edit **both** copies (they are byte-identical).
- `expo prebuild` wipes and regenerates `android/`, so manual edits there are lost unless mirrored in `plugins/`.

## Building & installing
- Build directly with Gradle (no prebuild): `cd android` then `gradlew assembleRelease` → APK at `android/app/build/outputs/apk/release/app-release.apk` (debug-signed via `app/debug.keystore`).
- Install: `adb install -r app\build\outputs\apk\release\app-release.apk`.
- **Ask the user before running any Gradle build** — the user builds themselves; builds take minutes and must not be launched unprompted.
- No test / lint / typecheck scripts exist.

## Unlock detection flow (native → JS)
- `UnlockAccessibilityService.kt` (accessibility service, enabled in Android settings) counts unlocks:
  - `ACTION_SCREEN_OFF` arms the counter.
  - `ACTION_USER_PRESENT` counts the unlock (Android's exact unlock signal); `TYPE_WINDOW_STATE_CHANGED` of a real app is the fallback for devices without keyguard.
  - 2s debounce.
- It calls `AccessibilityModule.checkForegroundApp()` → emits `PHONE_UNLOCKED`.
- `services/AccessibilityListener.js` subscribes; `context/AppContext.js` increments `unlockCount`/`unlockTimes` only while `sleepSessionStarted` is true.
- Session state persists via `services/SleepService.js` → `storage/CurrentSleepStorage.js`.
- Unlocks only count **after the screen turns off** (screen-off arms the counter).

## Testing on device
- `adb` lives at `C:\Android\Sdk\platform-tools\adb.exe` (not on PATH).
- Logcat tags: `UnlockA11y` (native: "Pantalla apagada: armado", "Usuario desbloqueó (USER_PRESENT)", "DESBLOQUEO contado") and `ReactNativeJS` (JS).
- Release APK runs the embedded Hermes bundle (no Metro); JS changes need a debug build (`npx expo run:android`) to hot-load.

## Foreground service
- `SleepForegroundService.kt` shows the persistent notification (elapsed time + unlock count). It uses `foregroundServiceType="specialUse"` with `PROPERTY_SPECIAL_USE_FGS_SUBTYPE` — do not revert to `health`; that caused `SecurityException` crashes on `startForeground`.

## App architecture & main flows

### Bootstrap & navigation
- `App.js` → `AppProvider` (`context/AppContext.js`) wraps `navigation/AppNavigator.js` (single native stack, `headerShown: false`).
- Initial route: `Welcome` if no `userName`, else `Home`. Screens live in `screens/`; shared UI in `components/`.
- `AppContext` is the single source of state (profile, economy, pets, achievements, session, unlocks). It auto-saves to AsyncStorage (`storage/AppStorage.js`) on changes and restores on load. On mount it also restarts an active session (notification) and re-schedules the bedtime reminder.

### Sleep session flow
1. `SleepModeScreen.handleStartSleep` → requests `POST_NOTIFICATIONS` (Android 13+) + `ACTIVITY_RECOGNITION` → `setSleepSessionStarted(true)` → `startSleep()` writes `current_sleep_session` (`{startTime, active, unlockCount: 0, unlockTimes: []}`) → `startNotification` starts `SleepForegroundService` (persistent notification with elapsed time + unlock count).
2. `hooks/useSleepSession.js` ticks elapsed time every second from `startTime`.
3. Unlocks increment in `AppContext` while `sleepSessionStarted`; persisted by `updateUnlockState` (`services/SleepService.js`) and mirrored to the notification by `updateUnlocks`.
4. `finishSleep` → `finishSleepSession()` clears the active session; sessions < 0.5 h are discarded. Otherwise: `calculateSleepRewards` → `SleepScoreService.calculateSleepScore` (score = 100 − (goal−hours)·10 − unlocks·5) → coins (score ≥90: 50, ≥75: 35, ≥60: 20, else 5) → XP via `LevelService.getXPFromQuality` (Excellent 25, Good 18, Fair 10, else 5; 100 XP per level) → session saved to `sleep_history` → streak (+1 if ≥7 h, else 0) → `unlockAchievements` → navigate to `Results`.

### Economy / gamification
- Coins: sleep rewards + achievement rewards; spent in PetShop.
- Level: `addXP` accumulates 100 XP per level.
- Pet mood: derived from sleep score (happy ≥90, normal ≥75, sleepy ≥60, sad).
- Pets: `PETS` catalog in `services/PetService.js` (cat is default/0; dog 100 … dragon 3000). Only pets with `available: true` can be bought; buying checks `canBuyPet`.

### Storage (AsyncStorage keys)
- `sleep_pet_data` — profile + economy + settings (coins, streak, petMood, petHappiness, userName, userAge, goalHours, goalType, selectedPet, ownedPets, language, level, xp).
- `current_sleep_session` — active session state.
- `sleep_history` — array of finished session objects.
- `sleep_pet_achievements` — unlocked achievement ids.
- `sleep_reminder_settings` — `{enabled, hour, minute}`.

### Translations
- `translations/es.js` and `translations/en.js`; selected via `services/TranslationService.js` (`getTranslations(language)`). All UI strings go through `t.*`.

### Bedtime reminder
- `SettingsScreen` saves `{enabled, hour, minute}` and calls `scheduleReminder`/`cancelReminder` (`services/ReminderService.js`).
- `ReminderModule.schedule` stores title/content in SharedPreferences and sets an **exact** daily alarm via `AlarmManager.setAlarmClock` (exempt from Doze and `SCHEDULE_EXACT_ALARM`). `ReminderReceiver` shows the notification and **re-arms the next daily alarm** (same hour/minute from prefs). Reuses `ReminderModule.buildPendingIntent`/`nextTriggerAt`/`scheduleAlarmClock` (companion).
- `AppContext` re-schedules on app start and language change if enabled. **No `BOOT_COMPLETED` receiver** → the alarm is lost on reboot until the app is opened again.

## Design system (night redesign, in progress)
- Fonts: `@expo-google-fonts/nunito` + `expo-font`, cargadas en `App.js` con `useFonts` (`Nunito_400Regular`, `Nunito_600SemiBold`, `Nunito_700Bold`, `Nunito_800ExtraBold`). `theme.js` exporta `FONT_FAMILY` y las variantes `TEXT` ya traen `fontFamily` → todo `AppText` usa Nunito.
- Paleta nocturna en `theme.js` bajo `NIGHT`: `start #1B1B4B`, `end #5E60CE`, `lavender #EAE6F7`, `lavenderSoft #F4F1FB`, `lavenderDark #C9B8E8`, `yellow #FFD166`, `pink #FF8FAB`, `textOnNight #FFFFFF`.
- Primitivas de diseño: `ScreenContainer`, `Card`, `AppText` (compartidas) + `NightBackground` (degradado + estrellas/luna/nubes; props opcionales `colors` y `moon`), `ProgressBar` (barra redondeada), `GlowMoon` (luna creciente animada: floating + halo), `AppIcon` (wrapper semántico → `@expo/vector-icons`; mapea nombres como `home`/`streak`/`night` a Ionicons/MaterialCommunityIcons), `BottomNav` (5 tabs **solo iconos**: Home/Statistics/Achievements/PetShop/Settings; usa `navigation.navigate`, prop `active`, iconos vía `AppIcon`; el activo se marca con cápsula translúcida), `SectionHeader` (icono + título), `MotivationalCard` (lavanda + mascota decorativa), `AchievementSummary`, `AchievementFilter`.
- `HomeScreen` es la pantalla de referencia rediseñada: header (saludo + nombre + botón de menú a la izquierda + spacer a la derecha) → tarjeta de mascota (imagen `PET_IMAGES[selectedPet][petMood]`, `petName`, globo de diálogo, barra de felicidad) → streak/coins → nivel + barra XP → LAST NIGHT (`lastSleepSession`) → botón START SLEEP (`SleepMode`) → `BottomNav active="Home"`. Sin emojis: todos los iconos son `AppIcon`.
- `SleepModeScreen` rediseñada (inmersiva/nocturna): `SafeAreaView` + `NightBackground` (gradiente 3 tonos que termina en lavanda, `moon={false}`) + `ScrollView`; cápsula de estado (activo/inactivo), `GlowMoon` grande, contador real (`formatTime()` con horas pad), tarjeta glass "Phone unlocks" (`unlockCount`), tarjeta motivacional, botón WAKE UP/START SLEEP (`finishSleep`/`handleStartSleep`), acceso discreto a View Logs. Sin botón "Cancel Session". Animaciones con `Animated` nativo. Lógica intacta.
- `petName` editable: estado en `AppContext`, persistido en `sleep_pet_data`, editado en `EditProfileScreen` (input "Pet name"); Home muestra el nombre de la mascota traducido si está vacío.
- Las pantallas del BottomNav rediseñadas (Statistics, Achievements, Settings, PetShop): `NightBackground` + `SafeAreaView` + `ScrollView` + `BottomNav active` + fade-in `Animated`. Lógica intacta.
  - `StatisticsScreen`: `SectionHeader`, `WeeklyBarChart` (barras con degradado índigo→morado, línea de meta dorada "Meta Xh" con `goalHours`, día actual destacado con columna lavanda), `NightChart`, `StatCard` horizontal (icono en círculo lavanda + label/valor/sub), `MotivationalCard`, empty state si no hay sesiones registradas.
  - `AchievementsScreen`: `AchievementSummary` (desbloqueados + recompensas reales), `AchievementFilter` (pills funcionales Todos/En progreso/Rachas/Especiales, filtrado local de presentación), `AchievementCard` horizontal (estados Completado/En progreso/Bloqueado, recompensa en cápsula). `AchievementService` agregó `iconName` a cada logro (el `icon` emoji queda como fallback).
  - `SettingsScreen`: `Switch` nativo en el recordatorio + `TimeSelector` (cápsula única `[−] 19 : 15 [+]`, campos hora/minuto seleccionables por toque, botones −/+ actúan sobre el campo seleccionado con press-and-hold vía `setTimeout`/`setInterval`), caja motivacional navy, cards Reiniciar/Acerca de (`APP_VERSION` hardcode "1.0.2", sin mascota debajo).
  - `PetShopScreen`: header (huella + título + subtítulo + cápsula de saldo con `AppIcon coins`), `PetCard` oscura translúcida (seleccionada → borde dorado + check; comprable → "Comprar"; poseída → "Seleccionar"; no disponible → `comingsoon.png` + "Próximamente"). El botón de tienda del header de Home se movió al `BottomNav`.
- `MenuScreen` rediseñada (solo 2 opciones): `NightBackground` + `SafeAreaView` + `ScrollView` + fade-in; header con `AppIcon sparkles` dorada + título + subtítulo; tarjetas **glassmorphism** (`rgba(255,255,255,0.12)` + borde translúcido + radio 28) con icono en círculo semi-transparente + botón circular `>`; botón "Volver al Inicio" (`navigation.goBack()`). Opciones: Mi Perfil (`AppIcon person`) e Historial (`AppIcon calendar`). Sin folder/mascota/emojis.
- `ProfileScreen` ("Mi Perfil"): mascota con glow + card de identidad glass + sección "Información personal" (3 filas) + sección "Tu progreso" (bloque XP con `ProgressBar` + grid 2 col) + botón "Editar perfil" (`AppIcon pencil`).
- `EditProfileScreen` ("Editar perfil"): header con botón de regreso + campos glass (Nombre, Edad, Pet name, Meta de sueño con unidad y hint de horas recomendadas) + tarjeta "Tu objetivo" (gradiente morado) + botones Guardar (`AppIcon save`)/Cancelar.
- `HistoryScreen` ("Historial"): header con regreso + tarjetas glass por sesión (`SleepCard` con icono de mood en círculo, fecha, hora, badge de estado y 3 métricas con divisores) + empty state. `AppIcon` tiene `cloud` para mood sad.
- `WelcomeScreen` (héroe con `GlowMoon` + pills de idioma + botón Get Started), `AboutScreen` (regreso + `AppIcon about` + `GlowMoon` + cards glass Hecho por/Versión), `CreateProfileScreen` (onboarding 3 pasos con inputs glass y opciones de objetivo con `AppIcon`), `ResultsScreen` (título según mood, mascota con glow, métricas glass, rewards, card de nivel subido dorada, botón continuar).
- Dependencias agregadas: `expo-linear-gradient`, `expo-font`, `@expo-google-fonts/nunito`, `@expo/vector-icons` (en uso vía `AppIcon`).
- Pendiente: swipe entre pestañas del `BottomNav` (planificado: `constants/tabs.js` con `TAB_ORDER` + `SwipeableTabScreen` con `PanResponder`); las pantallas ya están todas sin emojis en la UI (iconos vía `AppIcon`).

## Conventions
- Code comments, log strings, and user-facing copy are in Spanish — keep new code consistent.
