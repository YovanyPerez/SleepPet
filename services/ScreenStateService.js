import { NativeModules, NativeEventEmitter } from "react-native";

const { ScreenState } = NativeModules;

const eventEmitter = new NativeEventEmitter(ScreenState);

let subscription = null;

export function startScreenStateListener(onUnlock) {

  if (!ScreenState) {

    console.warn("ScreenState native module not found.");

    return;

  }

  subscription = eventEmitter.addListener(

    "PHONE_UNLOCKED",

    (event) => {

      onUnlock(event);

    }

  );

}

export function stopScreenStateListener() {

  if (subscription) {

    subscription.remove();

    subscription = null;

  }

}