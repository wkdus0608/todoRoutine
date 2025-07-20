import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// TODO: Screen components will be imported later
// import MainScreen from '../screens/MainScreen';
// import AddScreen from '../screens/AddScreen';
import MainScreen from '../screens/MainScreen';
import AddScreen from '../screens/AddScreen';
import RoutineScreen from '../screens/RoutineScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: ' ' }}
        />
        <Stack.Screen
          name="Add"
          component={AddScreen}
          options={{ title: 'Add Todo' }}
        />
        <Stack.Screen name="Routines" component={RoutineScreen} options={{ title: 'Routines' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
