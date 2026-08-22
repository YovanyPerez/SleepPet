import React, { useContext } from "react";
import {
  NavigationContainer,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  const {

    loading,

    userName,

    achievementPopup,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  if (loading) {

    return <LoadingScreen tagline={t.splashTagline} />;

  }

  return (

    <>

      <NavigationContainer>

        <Stack.Navigator
          initialRouteName={
            userName ? "Home" : "Welcome"
          }
          screenOptions={{
            headerShown: false,
          }}
        >

          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
          />

          <Stack.Screen
            name="CreateProfile"
            component={CreateProfileScreen}
          />

          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />

          <Stack.Screen
            name="SleepMode"
            component={SleepModeScreen}
          />

          <Stack.Screen
            name="Results"
            component={ResultsScreen}
          />

          <Stack.Screen
            name="Menu"
            component={MenuScreen}
          />

          <Stack.Screen
            name="History"
            component={HistoryScreen}
          />

          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />

          <Stack.Screen
            name="PetShop"
            component={PetShopScreen}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
          />

          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
          />

          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
          />

          <Stack.Screen
            name="About"
            component={AboutScreen}
          />

          <Stack.Screen
            name="PPGMeasure"
            component={PPGMeasureScreen}
          />

        </Stack.Navigator>

      </NavigationContainer>

      <AchievementPopup
        visible={achievementPopup.visible}
        title={achievementPopup.title}
        reward={achievementPopup.reward}
      />

    </>

  );

}
//npx expo start