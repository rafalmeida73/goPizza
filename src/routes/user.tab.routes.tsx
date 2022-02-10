import React, { useCallback, useEffect, useState } from 'react';

import firestore from '@react-native-firebase/firestore';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useTheme } from 'styled-components/native';

import { BottomMenu } from '../components/BottomMenu';
import { Home } from '../screens/Home';
import { Orders } from '../screens/Orders';

const { Navigator, Screen } = createBottomTabNavigator();

export function UserTabRoutes() {
  const { COLORS } = useTheme();

  const [notifications, setNotifications] = useState('0');

  const barIcon = useCallback(
    (title: string, color: string, notificationsLenght?: string) => {
      return (
        <BottomMenu
          title={title}
          color={color}
          notifications={notificationsLenght}
        />
      );
    },
    [],
  );

  const getNotifications = async () => {
    const subscribe = await firestore()
      .collection('orders')
      .where('status', '==', 'Pronto')
      .onSnapshot((querySnapshot) => {
        setNotifications(String(querySnapshot.docs.length));
      });

    return () => subscribe();
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.SECONDARY_900,
        tabBarInactiveTintColor: COLORS.SECONDARY_400,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          paddingVertical: Platform.OS === 'ios' ? 20 : 0,
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => barIcon('Casdápio', color),
        }}
      />
      <Screen
        name="Orders"
        component={Orders}
        options={{
          tabBarIcon: ({ color }) => barIcon('Pedidos', color, notifications),
        }}
      />
    </Navigator>
  );
}
