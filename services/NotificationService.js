import { NativeModules } from "react-native";

const { NotificationModule } = NativeModules;

export function startNotification(startTime) {
  NotificationModule?.startNotification(startTime);
}

export function updateUnlocks(count) {
  NotificationModule?.updateUnlocks(count);
}

export function stopNotification() {
  NotificationModule?.stopNotification();
}