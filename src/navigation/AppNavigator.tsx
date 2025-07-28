import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from '../screens/MainScreen';
import TodayScreen from '../screens/TodayScreen';
import { ProjectSidebar } from '../components/ProjectSidebar';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide header for tabs, because the drawer navigator will have its own
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '오늘') {
            iconName = focused ? 'today' : 'today';
          } else if (route.name === '목록') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
          }

          return <Icon name={iconName as string} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F8EF7',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="오늘" component={TodayScreen} options={{ title: '오늘' }} />
      <Tab.Screen name="목록" component={MainScreen} options={{ title: '목록' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => (
          <ProjectSidebar
            {...props}
            projects={[]}
            selectedProjectId=""
            onSelectProject={() => {}}
            onAddProject={() => {}}
            onDeleteProject={() => {}}
            toggleSidebar={() => props.navigation.toggleDrawer()}
          />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Drawer.Screen name="Home" component={TabNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;