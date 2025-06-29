import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AuthHomeScreen from '../../screens/auth/AuthHomeScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import { AuthNavigation } from '../../constants';
import SignUpScreen from '../../screens/auth/SignupScreen';

export type AuthStackParamList = {
  [AuthNavigation.AUTH_HOME]: undefined;
  [AuthNavigation.LOGIN]: undefined;
  [AuthNavigation.SIGNUP]: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: 'white' },
        headerStyle: {
          backgroundColor: 'white',
          shadowColor: 'gray',
        },
        headerTitleStyle: {
          fontSize: 15,
          fontWeight: 'bold',
        },
        headerTintColor: 'black',
      }}
    >
      <Stack.Screen
        name={AuthNavigation.AUTH_HOME}
        component={AuthHomeScreen}
        options={{ headerTitle: ' ', headerShown: false }}
      />
      <Stack.Screen
        name={AuthNavigation.LOGIN}
        component={LoginScreen}
        options={{ headerTitle: '로그인' }}
      />
      <Stack.Screen
        name={AuthNavigation.SIGNUP}
        component={SignUpScreen}
        options={{ headerTitle: '회원가입' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
