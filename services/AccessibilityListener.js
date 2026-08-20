import { NativeModules, NativeEventEmitter } from "react-native";

const { AccessibilityModule } = NativeModules;

let subscription = null;

export function startAccessibilityListener(onUnlock) {

  if (!AccessibilityModule) {
    console.warn("AccessibilityModule not found");
    return;
  }

  const emitter = new NativeEventEmitter(AccessibilityModule);

  subscription = emitter.addListener(
    "PHONE_UNLOCKED",
    onUnlock
  );
}

export function stopAccessibilityListener() {

  if (subscription) {
    subscription.remove();
    subscription = null;
  }

}

export function isAccessibilityEnabled() {
  if (AccessibilityModule?.isAccessibilityEnabled) {
    return AccessibilityModule.isAccessibilityEnabled();
  }
  return Promise.resolve(false);
}

export function openAccessibilitySettings() {
  AccessibilityModule?.openAccessibilitySettings?.();
}