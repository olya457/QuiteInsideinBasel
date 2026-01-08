import React from 'react';
import { View, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { TabsParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import NoSavedScreen from '../screens/NoSavedScreen';
import InteractiveMapScreen from '../screens/InteractiveMapScreen';

const Tab = createBottomTabNavigator<TabsParamList>();

const ICON_HOME_OFF = require('../assets/home_off.png');
const ICON_HOME_ON = require('../assets/home_on.png');

const ICON_SAVED_OFF = require('../assets/saved_off.png');
const ICON_SAVED_ON = require('../assets/saved_on.png');

const ICON_MAP_OFF = require('../assets/map_off.png');
const ICON_MAP_ON = require('../assets/map_on.png');

const RAISE = 30;

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          let iconSource = ICON_HOME_OFF;

          if (route.name === 'Home') iconSource = isFocused ? ICON_HOME_ON : ICON_HOME_OFF;
          if (route.name === 'NoSaved') iconSource = isFocused ? ICON_SAVED_ON : ICON_SAVED_OFF;
          if (route.name === 'InteractiveMap')
            iconSource = isFocused ? ICON_MAP_ON : ICON_MAP_OFF;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.btn} hitSlop={12}>
              <Image source={iconSource} style={styles.icon} resizeMode="contain" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="NoSaved" component={NoSavedScreen} />
      <Tab.Screen name="InteractiveMap" component={InteractiveMapScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: (Platform.OS === 'ios' ? 18 : 14) + RAISE, 
    alignItems: 'center',
  },
  pill: {
    width: 330,
    height: 74,
    borderRadius: 26,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
  },
  btn: {
    width: 78,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 34,
    height: 34,
  },
});
