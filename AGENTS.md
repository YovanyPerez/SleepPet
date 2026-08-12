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

## Conventions
- Code comments, log strings, and user-facing copy are in Spanish — keep new code consistent.
