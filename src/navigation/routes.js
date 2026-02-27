// Route Definitions
// Extracting route names into constants prevents typos and makes refactoring easier.

export const ROUTES = {
    // Auth Flows
    LOGIN: 'Login',

    // Admin Flows
    ADMIN: {
        DASHBOARD: 'AdminDashboard',
        PENDING_APPROVAL: 'PendingApproval',
        ADD_PG: 'AddPG',
        EDIT_PG: 'EditPG',
        PG_DETAILS: 'PGDetails',
        PROFILE: 'AdminProfile',
        MANAGE_MENU: 'ManageMenu',
    },

    // Super Admin Flows
    SUPER_ADMIN: {
        DASHBOARD: 'SuperAdminDashboard',
    },

    // User Flows
    USER: {
        TABS: 'UserTabs',
        DASHBOARD: 'UserDashboard',
        PG_DETAILS: 'PGDetailsUser',
        FAVORITES: 'Favorites',
        MY_PG: 'MyPG',
        MY_BOOKINGS: 'MyBookings',
        COMMUNITY: 'Community',
        CREATE_POST: 'CreatePost',
        PROFILE: 'UserProfile',
        PAYMENT: 'Payment',
        PAYMENT_HISTORY: 'PaymentHistory',
        WEEKLY_MENU: 'WeeklyMenu',
        PAY_RENT: 'PayRent',
    }
};
