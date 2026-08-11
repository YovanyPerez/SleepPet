import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "sleep_reminder_settings";

export async function getReminderSettings() {

  try {

    const data = await AsyncStorage.getItem(KEY);

    return data
      ? JSON.parse(data)
      : {
          enabled: false,
          hour: 22,
          minute: 30,
        };

  } catch (e) {

    return {
      enabled: false,
      hour: 22,
      minute: 30,
    };

  }

}

export async function saveReminderSettings(settings) {

  try {

    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(settings)
    );

  } catch (e) {

    console.log(e);

  }

}
