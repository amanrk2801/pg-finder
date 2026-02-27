import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { ROUTES } from './routes';

import UserDashboard from '../screens/user/UserDashboard';
import MyPGScreen from '../screens/user/MyPGScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import CommunityScreen from '../screens/user/CommunityScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    [ROUTES.USER.DASHBOARD]:  { active: 'home',     inactive: 'home-outline' },
    [ROUTES.USER.MY_PG]:      { active: 'business',  inactive: 'business-outline' },
    [ROUTES.USER.MY_BOOKINGS]:{ active: 'calendar',  inactive: 'calendar-outline' },
    [ROUTES.USER.COMMUNITY]:  { active: 'people',    inactive: 'people-outline' },
    [ROUTES.USER.PROFILE]:    { active: 'person',    inactive: 'person-outline' },
};

export default function UserTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = TAB_ICONS[route.name];
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
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 4,
                },
            })}
        >
            <Tab.Screen
                name={ROUTES.USER.DASHBOARD}
                component={UserDashboard}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name={ROUTES.USER.MY_PG}
                component={MyPGScreen}
                options={{ title: 'My PG' }}
            />
            <Tab.Screen
                name={ROUTES.USER.MY_BOOKINGS}
                component={MyBookingsScreen}
                options={{ title: 'Bookings' }}
            />
            <Tab.Screen
                name={ROUTES.USER.COMMUNITY}
                component={CommunityScreen}
                options={{ title: 'Community' }}
            />
            <Tab.Screen
                name={ROUTES.USER.PROFILE}
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}
