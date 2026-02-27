import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import StorageService from '../services/StorageService';

export const DataContext = createContext();

const SAMPLE_PGS = [{
    id: '1',
    name: 'Sunshine Elite Stay',
    address: '123 Tech Park Road, Hinjewadi Phase 1, Pune',
    location: { latitude: 18.5913, longitude: 73.7389 },
    totalRooms: 15, occupiedRooms: 12, totalBeds: 45, vacantBeds: 8,
    facilities: ['Mess', 'Drinking Water', 'WiFi', 'Laundry', 'Power Backup'],
    safetyMeasures: ['CCTV', '24/7 Security', 'Biometric Entry'],
    gender: 'Female', rent: 8500, adminId: 'admin1',
    images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    ],
    rating: 4.8, reviews: 24,
}];

const SAMPLE_POSTS = [{
    id: 'post_1', userId: 'user1', authorName: 'Aman Kumar',
    title: 'Need a Cook for 3 People',
    description: 'Looking for a cook who can make North Indian food twice a day in Hinjewadi Phase 1.',
    category: 'Service', contactInfo: 'aman@example.com',
    date: new Date().toISOString(), status: 'Active',
}];

const DEFAULT_SETTINGS = { platformFee: 5 };

const SAMPLE_MESS_MENUS = [{
    pgId: '1',
    weeklyMenu: {
        monday:    { breakfast: 'Poha, Chai',        lunch: 'Dal Rice, Roti, Salad',     dinner: 'Paneer Butter Masala, Roti' },
        tuesday:   { breakfast: 'Upma, Coffee',      lunch: 'Rajma Chawal, Raita',       dinner: 'Chole, Rice, Roti' },
        wednesday: { breakfast: 'Paratha, Curd',     lunch: 'Sambar Rice, Papad',        dinner: 'Mix Veg, Dal, Roti' },
        thursday:  { breakfast: 'Idli Sambhar',      lunch: 'Kadhi Chawal, Salad',       dinner: 'Aloo Gobi, Rice, Roti' },
        friday:    { breakfast: 'Bread Omelette',    lunch: 'Biryani, Raita',            dinner: 'Dal Makhani, Jeera Rice' },
        saturday:  { breakfast: 'Aloo Puri, Chai',   lunch: 'Pav Bhaji',                 dinner: 'Paneer Tikka, Roti, Rice' },
        sunday:    { breakfast: 'Chole Bhature',     lunch: 'Special Thali',             dinner: 'Pasta, Garlic Bread, Soup' },
    },
    todaysSpecial: 'Gulab Jamun',
    mealPlanPrice: 3000,
    isVegOnly: true,
}];

async function loadOrSeed(getter, saver, seedData) {
    const data = await getter();
    if (data) return data;
    if (seedData) { await saver(seedData); return seedData; }
    return null;
}

export const DataProvider = ({ children }) => {
    const [pgs, setPgs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [communityPosts, setCommunityPosts] = useState([]);
    const [pendingPgs, setPendingPgs] = useState([]);
    const [users, setUsers] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [payments, setPayments] = useState([]);
    const [messMenus, setMessMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        try {
            const [pgData, bookingsData, favoritesData, reviewsData, postsData, pendingData, usersData, disputeData, settingsData, paymentsData, messMenusData] = await Promise.all([
                loadOrSeed(() => StorageService.getPgs(), (d) => StorageService.savePgs(d), SAMPLE_PGS),
                StorageService.getBookings(),
                StorageService.getFavorites(),
                StorageService.getReviews(),
                loadOrSeed(() => StorageService.getCommunityPosts(), (d) => StorageService.saveCommunityPosts(d), SAMPLE_POSTS),
                StorageService.getPendingPgs(),
                StorageService.getUsers(),
                StorageService.getDisputes(),
                loadOrSeed(() => StorageService.getSettings(), (d) => StorageService.saveSettings(d), DEFAULT_SETTINGS),
                StorageService.getPayments(),
                loadOrSeed(() => StorageService.getMessMenus(), (d) => StorageService.saveMessMenus(d), SAMPLE_MESS_MENUS),
            ]);

            if (pgData) setPgs(pgData);
            if (bookingsData) setBookings(bookingsData);
            if (favoritesData) setFavorites(favoritesData);
            if (reviewsData) setReviews(reviewsData);
            if (postsData) setCommunityPosts(postsData);
            if (pendingData) setPendingPgs(pendingData);
            if (usersData) setUsers(usersData);
            if (disputeData) setDisputes(disputeData);
            if (settingsData) setSettings(settingsData);
            if (paymentsData) setPayments(paymentsData);
            if (messMenusData) setMessMenus(messMenusData);
        } catch (error) {
            console.error('DataContext - Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Generic persist + setState helper ---
    const persistAndSet = useCallback(async (saver, setter, newData) => {
        try {
            await saver(newData);
            setter(newData);
            return true;
        } catch (err) {
            console.error('DataContext - persist error:', err);
            return false;
        }
    }, []);

    // --- PGs ---
    const savePgsInternal = useCallback(async (newPgs) => {
        await persistAndSet(StorageService.savePgs.bind(StorageService), setPgs, newPgs);
    }, [persistAndSet]);

    const addPg = useCallback(async (pg) => {
        const newPg = { ...pg, id: Date.now().toString() };
        await savePgsInternal([...pgs, newPg]);
    }, [pgs, savePgsInternal]);

    const updatePg = useCallback(async (id, updatedData) => {
        await savePgsInternal(pgs.map(pg => pg.id === id ? { ...pg, ...updatedData } : pg));
    }, [pgs, savePgsInternal]);

    const deletePg = useCallback(async (id) => {
        await savePgsInternal(pgs.filter(pg => pg.id !== id));
    }, [pgs, savePgsInternal]);

    // --- Bookings ---
    const addBooking = useCallback(async (userId, pgId, { monthlyRent, mealPlan = null, paymentMethod = 'upi' } = {}) => {
        const now = new Date();
        const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const newBooking = {
            id: Date.now().toString(), userId, pgId,
            date: now.toISOString(), status: 'Confirmed',
            monthlyRent: monthlyRent || 0,
            nextDueDate: nextDue.toISOString(),
            paymentMethod,
            mealPlan,
        };
        return persistAndSet(StorageService.saveBookings.bind(StorageService), setBookings, [...bookings, newBooking]);
    }, [bookings, persistAndSet]);

    const updateBooking = useCallback(async (bookingId, updates) => {
        return persistAndSet(
            StorageService.saveBookings.bind(StorageService), setBookings,
            bookings.map(b => b.id === bookingId ? { ...b, ...updates } : b),
        );
    }, [bookings, persistAndSet]);

    const clearBookings = useCallback(async (userId) => {
        await persistAndSet(StorageService.saveBookings.bind(StorageService), setBookings, bookings.filter(b => b.userId !== userId));
    }, [bookings, persistAndSet]);

    // --- Favorites ---
    const toggleFavorite = useCallback(async (userId, pgId) => {
        const updated = favorites.includes(pgId)
            ? favorites.filter(id => id !== pgId)
            : [...favorites, pgId];
        await persistAndSet(StorageService.saveFavorites.bind(StorageService), setFavorites, updated);
    }, [favorites, persistAndSet]);

    // --- Reviews ---
    const addReview = useCallback(async (review) => {
        const newReview = { ...review, id: Date.now().toString(), date: new Date().toISOString() };
        const updatedReviews = [...reviews, newReview];
        await persistAndSet(StorageService.saveReviews.bind(StorageService), setReviews, updatedReviews);

        const pgReviews = updatedReviews.filter(r => r.pgId === review.pgId);
        const avgRating = pgReviews.reduce((sum, r) => sum + r.rating, 0) / pgReviews.length;
        await savePgsInternal(
            pgs.map(p => p.id === review.pgId ? { ...p, rating: parseFloat(avgRating.toFixed(1)), reviews: pgReviews.length } : p),
        );
    }, [reviews, pgs, persistAndSet, savePgsInternal]);

    // --- Community Posts ---
    const addCommunityPost = useCallback(async (post) => {
        const newPost = { ...post, id: Date.now().toString(), date: new Date().toISOString(), status: 'Active' };
        await persistAndSet(StorageService.saveCommunityPosts.bind(StorageService), setCommunityPosts, [newPost, ...communityPosts]);
    }, [communityPosts, persistAndSet]);

    const updateCommunityPost = useCallback(async (id, updatedData) => {
        await persistAndSet(
            StorageService.saveCommunityPosts.bind(StorageService), setCommunityPosts,
            communityPosts.map(p => p.id === id ? { ...p, ...updatedData } : p),
        );
    }, [communityPosts, persistAndSet]);

    const deleteCommunityPost = useCallback(async (id) => {
        await persistAndSet(
            StorageService.saveCommunityPosts.bind(StorageService), setCommunityPosts,
            communityPosts.filter(p => p.id !== id),
        );
    }, [communityPosts, persistAndSet]);

    // --- Pending PGs ---
    const addPendingPg = useCallback(async (pgData) => {
        const newRequest = { ...pgData, id: Date.now().toString(), status: 'pending', dateSubmitted: new Date().toISOString() };
        return persistAndSet(StorageService.savePendingPgs.bind(StorageService), setPendingPgs, [...pendingPgs, newRequest]);
    }, [pendingPgs, persistAndSet]);

    const approvePendingPg = useCallback(async (requestId) => {
        const request = pendingPgs.find(req => req.id === requestId);
        if (!request) return false;

        const updatedPending = pendingPgs.filter(req => req.id !== requestId);
        await persistAndSet(StorageService.savePendingPgs.bind(StorageService), setPendingPgs, updatedPending);

        const { businessName, address, rent, adminId, phone } = request;
        await addPg({
            name: businessName, address, rent: parseFloat(rent), adminId, phone,
            location: { latitude: 18.5204, longitude: 73.8567 },
            totalRooms: 10, occupiedRooms: 0, totalBeds: 20, vacantBeds: 20,
            facilities: ['WiFi', 'Drinking Water'], safetyMeasures: ['CCTV'],
            gender: 'Any', images: [], rating: 0, reviews: 0,
        });
        return true;
    }, [pendingPgs, addPg, persistAndSet]);

    const rejectPendingPg = useCallback(async (requestId) => {
        return persistAndSet(
            StorageService.savePendingPgs.bind(StorageService), setPendingPgs,
            pendingPgs.filter(req => req.id !== requestId),
        );
    }, [pendingPgs, persistAndSet]);

    // --- Users ---
    const toggleUserStatus = useCallback(async (userId) => {
        const updated = users.map(u =>
            u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u,
        );
        return persistAndSet(StorageService.saveUsers.bind(StorageService), setUsers, updated);
    }, [users, persistAndSet]);

    // --- Disputes ---
    const addDispute = useCallback(async (userId, pgId, title, description) => {
        const newDispute = {
            id: Date.now().toString(), userId, pgId, title, description,
            status: 'Open', date: new Date().toISOString(),
        };
        return persistAndSet(StorageService.saveDisputes.bind(StorageService), setDisputes, [newDispute, ...disputes]);
    }, [disputes, persistAndSet]);

    const updateDisputeStatus = useCallback(async (disputeId, newStatus) => {
        return persistAndSet(
            StorageService.saveDisputes.bind(StorageService), setDisputes,
            disputes.map(d => d.id === disputeId ? { ...d, status: newStatus } : d),
        );
    }, [disputes, persistAndSet]);

    // --- Settings ---
    const updateSettings = useCallback(async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        return persistAndSet(StorageService.saveSettings.bind(StorageService), setSettings, merged);
    }, [settings, persistAndSet]);

    // --- Payments ---
    const addPayment = useCallback(async (paymentData) => {
        const newPayment = {
            id: Date.now().toString(),
            ...paymentData,
            date: new Date().toISOString(),
        };
        const updated = [newPayment, ...payments];
        return persistAndSet(StorageService.savePayments.bind(StorageService), setPayments, updated);
    }, [payments, persistAndSet]);

    // --- Mess Menus ---
    const getMessMenuForPg = useCallback((pgId) => {
        return messMenus.find(m => m.pgId === pgId) || null;
    }, [messMenus]);

    const updateMessMenu = useCallback(async (pgId, menuData) => {
        const existing = messMenus.find(m => m.pgId === pgId);
        let updated;
        if (existing) {
            updated = messMenus.map(m => m.pgId === pgId ? { ...m, ...menuData } : m);
        } else {
            updated = [...messMenus, { pgId, ...menuData }];
        }
        return persistAndSet(StorageService.saveMessMenus.bind(StorageService), setMessMenus, updated);
    }, [messMenus, persistAndSet]);

    const contextValue = useMemo(() => ({
        pgs, bookings, favorites, reviews, communityPosts, pendingPgs, users, disputes, settings, payments, messMenus, isLoading,
        addPg, updatePg, deletePg,
        addBooking, updateBooking, clearBookings,
        toggleFavorite,
        addReview,
        addCommunityPost, updateCommunityPost, deleteCommunityPost,
        addPendingPg, approvePendingPg, rejectPendingPg,
        toggleUserStatus,
        addDispute, updateDisputeStatus,
        updateSettings,
        addPayment, getMessMenuForPg, updateMessMenu,
    }), [
        pgs, bookings, favorites, reviews, communityPosts, pendingPgs, users, disputes, settings, payments, messMenus, isLoading,
        addPg, updatePg, deletePg, addBooking, updateBooking, clearBookings, toggleFavorite, addReview,
        addCommunityPost, updateCommunityPost, deleteCommunityPost,
        addPendingPg, approvePendingPg, rejectPendingPg, toggleUserStatus,
        addDispute, updateDisputeStatus, updateSettings,
        addPayment, getMessMenuForPg, updateMessMenu,
    ]);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};
