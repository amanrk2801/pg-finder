import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../hooks';
import { COLORS } from '../constants/theme';
import { ROUTES } from './routes';

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  const insets = useSafeAreaInsets();
  // Sit above the system navigation bar (edge-to-edge on installed Android builds).
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 12);
  const { ownerBookings, bookingsLastSeenAt } = useData();
  const sinceTime = bookingsLastSeenAt
    ? new Date(bookingsLastSeenAt).getTime()
    : Date.now() - NEW_WINDOW_MS;
  const newBookingsCount = (ownerBookings || []).filter((b) => {
    const created = new Date(b.createdAt).getTime();
    return !Number.isNaN(created) && created > sinceTime;
  }).length;

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
          height: 56 + bottomPad,
          paddingBottom: bottomPad,
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
        options={{
          title: 'Bookings',
          tabBarBadge: newBookingsCount > 0 ? newBookingsCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

