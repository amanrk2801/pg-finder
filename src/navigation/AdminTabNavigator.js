import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { ROUTES } from './routes';

import AdminDashboard from '../screens/admin/AdminDashboard';
import LeaveRequestsScreen from '../screens/admin/LeaveRequestsScreen';
import LeavesHistoryScreen from '../screens/admin/LeavesHistoryScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';

const Tab = createBottomTabNavigator();

const ADMIN_TAB_ROUTES = {
  HOME: 'AdminTabHome',
  APPROVALS: 'AdminTabApprovals',
  LEAVES: 'AdminTabLeaves',
  BOOKINGS: 'AdminTabBookings',
};

const ADMIN_TAB_ICONS = {
  [ADMIN_TAB_ROUTES.HOME]: { active: 'home', inactive: 'home-outline' },
  [ADMIN_TAB_ROUTES.APPROVALS]: { active: 'alert-circle', inactive: 'alert-circle-outline' },
  [ADMIN_TAB_ROUTES.LEAVES]: { active: 'checkmark-done', inactive: 'checkmark-done-outline' },
  [ADMIN_TAB_ROUTES.BOOKINGS]: { active: 'list', inactive: 'list-outline' },
};

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = ADMIN_TAB_ICONS[route.name];
          const iconName = focused ? icons?.active : icons?.inactive;
          return <Ionicons name={iconName || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          backgroundColor: COLORS.white,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name={ADMIN_TAB_ROUTES.HOME}
        component={AdminDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name={ADMIN_TAB_ROUTES.APPROVALS}
        component={LeaveRequestsScreen}
        options={{ title: 'Approvals' }}
      />
      <Tab.Screen
        name={ADMIN_TAB_ROUTES.LEAVES}
        component={LeavesHistoryScreen}
        options={{ title: 'Leaves' }}
      />
      <Tab.Screen
        name={ADMIN_TAB_ROUTES.BOOKINGS}
        component={AdminBookingsScreen}
        options={{ title: 'Bookings' }}
      />
    </Tab.Navigator>
  );
}

