const SUPER_ADMIN_EMAIL = process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAIL || null;
const SUPER_ADMIN_PASSWORD = process.env.EXPO_PUBLIC_SUPER_ADMIN_PASSWORD || null;

export const AUTH_CONFIG = {
    superAdminEmail: SUPER_ADMIN_EMAIL,
    superAdminPassword: SUPER_ADMIN_PASSWORD,
    isSuperAdminEnabled: Boolean(SUPER_ADMIN_EMAIL && SUPER_ADMIN_PASSWORD),
};
