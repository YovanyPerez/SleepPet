import React, { useContext } from "react";
import {
  NavigationContainer,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { hasExistingUserData } from "../services/UserDataService";
import LoadingScreen from "../components/LoadingScreen";

import HomeScreen from "../screens/HomeScreen";
import SleepModeScreen from "../screens/SleepModeScreen";
import ResultsScreen from "../screens/ResultsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MenuScreen from "../screens/MenuScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import CreateProfileScreen from "../screens/CreateProfileScreen";
import PetShopScreen from "../screens/PetShopScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import AchievementPopup from "../components/AchievementPopup";
import AboutScreen from "../screens/AboutScreen";
import PPGMeasureScreen from "../screens/PPGMeasureScreen";
import SleepSetupScreen from "../screens/SleepSetupScreen";

const Stack = createNativeStackNavigator();

const SCREENS = {
  Welcome: WelcomeScreen,
  CreateProfile: CreateProfileScreen,
  Home: HomeScreen,
  SleepMode: SleepModeScreen,
  Results: ResultsScreen,
  Menu: MenuScreen,
  History: HistoryScreen,
  Statistics: StatisticsScreen,
  Settings: SettingsScreen,
  PetShop: PetShopScreen,
  Profile: ProfileScreen,
  EditProfile: EditProfileScreen,
  Achievements: AchievementsScreen,
  About: AboutScreen,
  PPGMeasure: PPGMeasureScreen,
  SleepSetup: SleepSetupScreen,
};

export default function AppNavigator() {

  const ctx = useContext(AppContext);

  const {
    achievementPopup,
    setAchievementPopup,
    language,
  } = ctx;

  const t = getTranslations(language);

  if (ctx.loading) {

    return <LoadingScreen tagline={t.splashTagline} />;

  }

  // REGLA CRÍTICA: usuario nuevo = sin datos reales persistidos (nunca un solo flag)
  const existingUser = hasExistingUserData(ctx);

  return (

    <>

      <NavigationContainer>

        <Stack.Navigator
          initialRouteName={
            existingUser ? "Home" : "Welcome"
          }
          screenOptions={{
            headerShown: false,
          }}
        >

          {Object.entries(SCREENS).map(([name, component]) => (
            <Stack.Screen
              key={name}
              name={name}
              component={component}
            />
          ))}

        </Stack.Navigator>

      </NavigationContainer>

      <AchievementPopup
        visible={achievementPopup.visible}
        title={achievementPopup.title}
        reward={achievementPopup.reward}
        onHide={() =>
          setAchievementPopup({
            visible: false,
            title: "",
            reward: 0,
          })
        }
      />

    </>

  );

}
//npx expo start