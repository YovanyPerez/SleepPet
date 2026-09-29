import { NativeModules } from "react-native";

const { NotificationModule } = NativeModules;

export { PET_ALERT_DELAY_SEC } from "./PetHappinessService";

export async function schedulePetAlertNative(title, content) {
  try {
    if (NotificationModule?.schedulePetAlert) {
      await NotificationModule.schedulePetAlert(title, content, PET_ALERT_DELAY_SEC);
      return true;
    }
  } catch (e) {
    console.log("PetAlert schedule fallback", e?.message ?? e);
  }
  return false;
}

export async function cancelPetAlertNative() {
  try {
    if (NotificationModule?.cancelPetAlert) {
      await NotificationModule.cancelPetAlert();
    }
  } catch (e) {}
}
