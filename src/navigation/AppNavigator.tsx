import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from '../screens/MainScreen';
import TodayScreen from '../screens/TodayScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === '오늘') {
              iconName = focused ? 'today' : 'today';
            } else if (route.name === '목록') {
              iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
            }

            // You can return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4F8EF7',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="오늘" component={TodayScreen} options={{ title: '오늘' }} />
        <Tab.Screen name="목록" component={MainScreen} options={{ title: '목록' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
