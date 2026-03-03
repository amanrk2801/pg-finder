import React from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks';
import { COLORS } from '../constants/theme';
import { ROUTES } from './routes';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AddPGScreen from '../screens/admin/AddPGScreen';
import EditPGScreen from '../screens/admin/EditPGScreen';
import PGDetailsScreen from '../screens/admin/PGDetailsScreen';
import ManageMenuScreen from '../screens/admin/ManageMenuScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import CreatePostScreen from '../screens/user/CreatePostScreen';
import RaiseIssueScreen from '../screens/user/RaiseIssueScreen';
import PaymentScreen from '../screens/user/PaymentScreen';
import PaymentHistoryScreen from '../screens/user/PaymentHistoryScreen';
import WeeklyMenuScreen from '../screens/user/WeeklyMenuScreen';
import FavoritesScreen from '../screens/user/FavoritesScreen';
import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import PendingApprovalScreen from '../screens/admin/PendingApprovalScreen';
import AdminTabNavigator from './AdminTabNavigator';
import UserTabNavigator from './UserTabNavigator';
import PGDetailsUserScreen from '../screens/user/PGDetailsUserScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { user, userType, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <ActivityIndicator size="large" color={COLORS.white} />
            </View>
        );
    }

    const hasKnownRole = ['user', 'admin', 'pending_admin', 'superadmin'].includes(userType);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.white } }}>
                {(!user || !hasKnownRole) && (
                    <>
                        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
                        <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
                    </>
                )}

                {userType === 'superadmin' && (
                    <Stack.Screen name={ROUTES.SUPER_ADMIN.DASHBOARD} component={SuperAdminDashboard} />
                )}

                {userType === 'admin' && (
                    <>
                        <Stack.Screen name={ROUTES.ADMIN.DASHBOARD} component={AdminTabNavigator} />
                        <Stack.Screen name={ROUTES.ADMIN.PENDING_APPROVAL} component={PendingApprovalScreen} />
                        <Stack.Screen name={ROUTES.ADMIN.ADD_PG} component={AddPGScreen} />
                        <Stack.Screen name={ROUTES.ADMIN.EDIT_PG} component={EditPGScreen} />
                        <Stack.Screen name={ROUTES.ADMIN.PG_DETAILS} component={PGDetailsScreen} />
                        <Stack.Screen name={ROUTES.ADMIN.PROFILE} component={ProfileScreen} />
                        <Stack.Screen name={ROUTES.ADMIN.MANAGE_MENU} component={ManageMenuScreen} />
                    </>
                )}

                {userType === 'pending_admin' && (
                    <Stack.Screen name={ROUTES.ADMIN.PENDING_APPROVAL} component={PendingApprovalScreen} />
                )}

                {userType === 'user' && (
                    <>
                        <Stack.Screen name={ROUTES.USER.TABS} component={UserTabNavigator} />
                        <Stack.Screen name={ROUTES.USER.PG_DETAILS} component={PGDetailsUserScreen} />
                        <Stack.Screen name={ROUTES.USER.FAVORITES} component={FavoritesScreen} />
                        <Stack.Screen name={ROUTES.USER.CREATE_POST} component={CreatePostScreen} />
                        <Stack.Screen name={ROUTES.USER.RAISE_ISSUE} component={RaiseIssueScreen} />
                        <Stack.Screen name={ROUTES.USER.PAYMENT} component={PaymentScreen} />
                        <Stack.Screen name={ROUTES.USER.PAYMENT_HISTORY} component={PaymentHistoryScreen} />
                        <Stack.Screen name={ROUTES.USER.WEEKLY_MENU} component={WeeklyMenuScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
});
