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
- `ReminderModule.schedule` stores title/content in SharedPreferences and sets an inexact daily `AlarmManager` (`RTC_WAKEUP`, `INTERVAL_DAY`) → `ReminderReceiver` shows the notification.
- `AppContext` re-schedules on app start and language change if enabled. **No `BOOT_COMPLETED` receiver** → the alarm is lost on reboot until the app is opened again.

### Dead code (safe to remove)
- `storage/StorageService.js`, `services/UsageService.js` (empty), `services/SleepSessionManager.js` (one stray line), `components/CustomButton.js` (empty), `styles/globalStyles.js` (empty).

## Conventions
- Code comments, log strings, and user-facing copy are in Spanish — keep new code consistent.
