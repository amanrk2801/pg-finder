import AsyncStorage from '@react-native-async-storage/async-storage';

// Only session and favorites live on-device; all other data comes from the backend API.
const STORAGE_KEYS = {
    APP_META: 'appMeta',
    USER_SESSION: 'userSession',
    FAVORITES: 'favorites',
    BOOKINGS_LAST_SEEN_AT: 'bookingsLastSeenAt',
};

const STORAGE_SCHEMA_VERSION = 2;

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

    async ensureMigrations() {
        const meta = (await this.getAppMeta()) || { schemaVersion: 1 };
        if (meta.schemaVersion >= STORAGE_SCHEMA_VERSION) {
            return;
        }

        if (meta.schemaVersion < 2) {
            const currentFavorites = await this.getFavorites();
            if (Array.isArray(currentFavorites)) {
                await this.saveFavorites({ __legacy: currentFavorites });
            }
        }

        await this.saveAppMeta({ schemaVersion: STORAGE_SCHEMA_VERSION, migratedAt: new Date().toISOString() });
    }

    async getAppMeta() {
        return this.getItem(STORAGE_KEYS.APP_META);
    }

    async saveAppMeta(meta) {
        return this.setItem(STORAGE_KEYS.APP_META, meta);
    }

    async getUserSession() { return this.getItem(STORAGE_KEYS.USER_SESSION); }
    async saveUserSession(sessionData) { return this.setItem(STORAGE_KEYS.USER_SESSION, sessionData); }
    async removeUserSession() { return this.removeItem(STORAGE_KEYS.USER_SESSION); }

    async getFavorites() { return this.getItem(STORAGE_KEYS.FAVORITES); }
    async saveFavorites(favorites) { return this.setItem(STORAGE_KEYS.FAVORITES, favorites); }

    async getBookingsLastSeenAt() { return this.getItem(STORAGE_KEYS.BOOKINGS_LAST_SEEN_AT); }
    async saveBookingsLastSeenAt(isoString) { return this.setItem(STORAGE_KEYS.BOOKINGS_LAST_SEEN_AT, isoString); }
}

export default new StorageService();
