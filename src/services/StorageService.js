import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const STORAGE_KEYS = {
    USER_SESSION: 'userSession',
    PGS: 'pgs',
    BOOKINGS: 'bookings',
    FAVORITES: 'favorites',
    REVIEWS: 'reviews',
    COMMUNITY_POSTS: 'communityPosts',
    PENDING_PGS: 'pendingPgs',
    USERS: 'users',
    DISPUTES: 'disputes',
    SETTINGS: 'settings',
    PAYMENTS: 'payments',
    MESS_MENUS: 'messMenus',
};

/**
 * StorageService
 * Wraps AsyncStorage to handle JSON serialization/deserialization
 * and centralizes error handling for data storage.
 */
class StorageService {
    async getItem(key) {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`StorageService - Error getting item [${key}]:`, error);
            throw error;
        }
    }

    async setItem(key, value) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`StorageService - Error setting item [${key}]:`, error);
            throw error;
        }
    }

    async removeItem(key) {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`StorageService - Error removing item [${key}]:`, error);
            throw error;
        }
    }

    // --- Domain Specific Storage Methods ---

    // Auth
    async getUserSession() {
        return this.getItem(STORAGE_KEYS.USER_SESSION);
    }

    async saveUserSession(sessionData) {
        return this.setItem(STORAGE_KEYS.USER_SESSION, sessionData);
    }

    async removeUserSession() {
        return this.removeItem(STORAGE_KEYS.USER_SESSION);
    }

    // PGs
    async getPgs() {
        return this.getItem(STORAGE_KEYS.PGS);
    }

    async savePgs(pgs) {
        return this.setItem(STORAGE_KEYS.PGS, pgs);
    }

    // Bookings
    async getBookings() {
        return this.getItem(STORAGE_KEYS.BOOKINGS);
    }

    async saveBookings(bookings) {
        return this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    }

    // Favorites
    async getFavorites() {
        return this.getItem(STORAGE_KEYS.FAVORITES);
    }

    async saveFavorites(favorites) {
        return this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    }

    // Reviews
    async getReviews() {
        return this.getItem(STORAGE_KEYS.REVIEWS);
    }

    async saveReviews(reviews) {
        return this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    }

    // Community Posts
    async getCommunityPosts() {
        return this.getItem(STORAGE_KEYS.COMMUNITY_POSTS);
    }

    async saveCommunityPosts(posts) {
        return this.setItem(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    }

    // Pending PGs (Onboarding)
    async getPendingPgs() {
        return this.getItem(STORAGE_KEYS.PENDING_PGS);
    }

    async savePendingPgs(pgs) {
        return this.setItem(STORAGE_KEYS.PENDING_PGS, pgs);
    }

    // Platform Users
    async getUsers() {
        return this.getItem(STORAGE_KEYS.USERS);
    }

    async saveUsers(users) {
        return this.setItem(STORAGE_KEYS.USERS, users);
    }

    // Disputes / Tickets
    async getDisputes() {
        return this.getItem(STORAGE_KEYS.DISPUTES);
    }

    async saveDisputes(disputes) {
        return this.setItem(STORAGE_KEYS.DISPUTES, disputes);
    }

    // Global Platform Settings
    async getSettings() {
        return this.getItem(STORAGE_KEYS.SETTINGS);
    }

    async saveSettings(settings) {
        return this.setItem(STORAGE_KEYS.SETTINGS, settings);
    }

    // Payments
    async getPayments() {
        return this.getItem(STORAGE_KEYS.PAYMENTS);
    }

    async savePayments(payments) {
        return this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    }

    // Mess Menus
    async getMessMenus() {
        return this.getItem(STORAGE_KEYS.MESS_MENUS);
    }

    async saveMessMenus(menus) {
        return this.setItem(STORAGE_KEYS.MESS_MENUS, menus);
    }
}

// Export a singleton instance
export default new StorageService();
