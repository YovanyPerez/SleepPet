import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomNav, { TabBarFramesContext } from "../components/BottomNav";
import { NIGHT, NIGHT_STYLES } from "../constants/theme";
import { TAB_ORDER } from "../constants/tabs";

import HomeScreen from "../screens/HomeScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import PetShopScreen from "../screens/PetShopScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createMaterialTopTabNavigator();

const TABS = {
  Home: HomeScreen,
  Statistics: StatisticsScreen,
  Achievements: AchievementsScreen,
  PetShop: PetShopScreen,
  Settings: SettingsScreen,
};

// Tabs como pares con swipe nativo (pager-view). La barra es una sola
// instancia custom (BottomNav) y no viaja con las páginas.
export default function TabsNavigator() {
  const insets = useSafeAreaInsets();
  const [tabFrames, setTabFrames] = useState({});

  const setTabFrame = (key) => (e) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setTabFrames((prev) => {
      const cur = prev[key];
      if (
        cur &&
        cur.x === x &&
        cur.y === y &&
        cur.width === width &&
        cur.height === height
      ) {
        return prev;
      }
      return { ...prev, [key]: { x, y, width, height } };
    });
  };

  return (
    <TabBarFramesContext.Provider value={tabFrames}>
      <Tab.Navigator
        initialRouteName="Home"
        backBehavior="initialRoute"
        tabBarPosition="bottom"
        screenOptions={{
          lazy: true,
          lazyPreloadDistance: 1,
          animationEnabled: false,
          sceneStyle: { backgroundColor: NIGHT.start },
        }}
        tabBar={(props) => (
          <View
            style={[styles.bottomNav, { bottom: 22 + insets.bottom }]}
            onLayout={setTabFrame("__tabsWrap")}
          >
            <BottomNav
              active={props.state.routes[props.state.index].name}
              navigation={props.navigation}
              position={props.position}
              onTabLayout={(key, layout) => {
                const k =
                  key === "Statistics"
                    ? "tabStats"
                    : key === "Achievements"
                      ? "tabAch"
                      : null;
                if (k) setTabFrame(k)({ nativeEvent: { layout } });
                else if (key === "__bar") setTabFrame("__bar")({ nativeEvent: { layout } });
              }}
            />
          </View>
        )}
      >
        {TAB_ORDER.map((name) => (
          <Tab.Screen key={name} name={name} component={TABS[name]} />
        ))}
      </Tab.Navigator>
    </TabBarFramesContext.Provider>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    ...NIGHT_STYLES.bottomNav,
  },
});
