import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import LoaderScreen from '../screens/LoaderScreen';
import OnboardScreen from '../screens/OnboardScreen';
import CreateProfile1Screen from '../screens/CreateProfile1Screen';

import TabsNavigator from './TabsNavigator';

import ClosedQuizScreen from '../screens/ClosedQuizScreen';
import ListPlaceScreen from '../screens/ListPlaceScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import InformationScreen from '../screens/InformationScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loader"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboard" component={OnboardScreen} />
      <Stack.Screen name="CreateProfile1" component={CreateProfile1Screen} />

      <Stack.Screen name="Tabs" component={TabsNavigator} />

      <Stack.Screen name="ClosedQuiz" component={ClosedQuizScreen} />
      <Stack.Screen name="ListPlace" component={ListPlaceScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="Information" component={InformationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
