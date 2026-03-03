import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import StorageService from '../services/StorageService';
import ApiClient from '../services/ApiClient';
import { generateId } from '../utils/id';

export const DataContext = createContext();

const DEFAULT_SETTINGS = { platformFee: 5 };

const USE_BACKEND = process.env.EXPO_PUBLIC_USE_BACKEND === 'true';

async function loadOrSeed(getter, saver, seedData) {
    const data = await getter();
    if (data) return data;
    if (seedData) {
        await saver(seedData);
        return seedData;
    }
    return null;
}

function normalizeFavoritesData(data) {
    if (!data) return {};
    if (Array.isArray(data)) return { __legacy: data };
    return data;
}

export const DataProvider = ({ children }) => {
    const [pgs, setPgs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [favoritesByUser, setFavoritesByUser] = useState({});
    const [reviews, setReviews] = useState([]);
    const [communityPosts, setCommunityPosts] = useState([]);
    const [pendingPgs, setPendingPgs] = useState([]);
    const [users, setUsers] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [payments, setPayments] = useState([]);
    const [messMenus, setMessMenus] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const loadAllData = useCallback(async () => {
        try {
            await StorageService.ensureMigrations();
            let pgData = null;
            let postsData = null;
            let settingsData = null;

            if (USE_BACKEND) {
                pgData = await ApiClient.get('/pgs');
                postsData = await ApiClient.get('/community');
                settingsData = await ApiClient.get('/settings');
            } else {
                [pgData, postsData, settingsData] = await Promise.all([
                    StorageService.getPgs(),
                    StorageService.getCommunityPosts(),
                    StorageService.getSettings(),
                ]);
            }

            const [bookingsData, favoritesData, reviewsData, pendingData, usersData, disputeData, paymentsData, messMenusData, leaveRequestsData] = await Promise.all([
                StorageService.getBookings(),
                StorageService.getFavorites(),
                StorageService.getReviews(),
                StorageService.getPendingPgs(),
                StorageService.getUsers(),
                StorageService.getDisputes(),
                StorageService.getPayments(),
                StorageService.getMessMenus(),
                StorageService.getLeaveRequests(),
            ]);

            if (pgData) setPgs(pgData || []);
            if (bookingsData) setBookings(bookingsData);
            setFavoritesByUser(normalizeFavoritesData(favoritesData));
            if (reviewsData) setReviews(reviewsData);
            if (postsData) setCommunityPosts(postsData || []);
            if (pendingData) setPendingPgs(pendingData);
            if (usersData) setUsers(usersData);
            if (disputeData) setDisputes(disputeData);
            if (settingsData) setSettings(settingsData || DEFAULT_SETTINGS);
            if (paymentsData) setPayments(paymentsData);
            if (messMenusData) setMessMenus(messMenusData);
            if (leaveRequestsData) setLeaveRequests(leaveRequestsData);
        } catch (error) {
            console.error('DataContext - Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadAllData(); }, [loadAllData]);

    const savePgsInternal = useCallback(async (newPgs) => {
        await persistAndSet(StorageService.savePgs.bind(StorageService), setPgs, newPgs);
    }, [persistAndSet]);

    const addPg = useCallback(async (pg) => {
        const newPg = { ...pg, id: generateId('pg') };
        await savePgsInternal([...pgs, newPg]);
    }, [pgs, savePgsInternal]);

    const updatePg = useCallback(async (id, updatedData) => {
        await savePgsInternal(pgs.map((pg) => (pg.id === id ? { ...pg, ...updatedData } : pg)));
    }, [pgs, savePgsInternal]);

    const deletePg = useCallback(async (id) => {
        await savePgsInternal(pgs.filter((pg) => pg.id !== id));
    }, [pgs, savePgsInternal]);

    const addBooking = useCallback(async (userId, pgId, { monthlyRent, mealPlan = null, paymentMethod = 'upi' } = {}) => {
        const now = new Date();
        const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const newBooking = {
            id: generateId('booking'), userId, pgId,
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
            StorageService.saveBookings.bind(StorageService),
            setBookings,
            bookings.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)),
        );
    }, [bookings, persistAndSet]);

    const clearBookings = useCallback(async (userId) => {
        await persistAndSet(StorageService.saveBookings.bind(StorageService), setBookings, bookings.filter((b) => b.userId !== userId));
    }, [bookings, persistAndSet]);

    const getFavoritesForUser = useCallback((userId) => {
        if (!userId) return [];
        return favoritesByUser[userId] || [];
    }, [favoritesByUser]);

    const toggleFavorite = useCallback(async (userId, pgId) => {
        if (!userId) return false;

        const current = favoritesByUser[userId] || favoritesByUser.__legacy || [];
        const updatedUserFavorites = current.includes(pgId)
            ? current.filter((id) => id !== pgId)
            : [...current, pgId];

        const updated = {
            ...favoritesByUser,
            [userId]: updatedUserFavorites,
        };

        if (favoritesByUser.__legacy) {
            delete updated.__legacy;
        }

        return persistAndSet(StorageService.saveFavorites.bind(StorageService), setFavoritesByUser, updated);
    }, [favoritesByUser, persistAndSet]);

    const addReview = useCallback(async (review) => {
        const newReview = { ...review, id: generateId('review'), date: new Date().toISOString() };
        const updatedReviews = [...reviews, newReview];
        await persistAndSet(StorageService.saveReviews.bind(StorageService), setReviews, updatedReviews);

        const pgReviews = updatedReviews.filter((r) => r.pgId === review.pgId);
        const avgRating = pgReviews.reduce((sum, r) => sum + r.rating, 0) / pgReviews.length;
        await savePgsInternal(pgs.map((p) => (p.id === review.pgId ? {
            ...p,
            rating: parseFloat(avgRating.toFixed(1)),
            reviews: pgReviews.length,
        } : p)));
    }, [reviews, pgs, persistAndSet, savePgsInternal]);

    const addCommunityPost = useCallback(async (post) => {
        const newPost = { ...post, id: generateId('post'), date: new Date().toISOString(), status: 'Active' };
        await persistAndSet(StorageService.saveCommunityPosts.bind(StorageService), setCommunityPosts, [newPost, ...communityPosts]);
    }, [communityPosts, persistAndSet]);

    const updateCommunityPost = useCallback(async (id, updatedData) => {
        await persistAndSet(
            StorageService.saveCommunityPosts.bind(StorageService),
            setCommunityPosts,
            communityPosts.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
        );
    }, [communityPosts, persistAndSet]);

    const deleteCommunityPost = useCallback(async (id) => {
        await persistAndSet(
            StorageService.saveCommunityPosts.bind(StorageService),
            setCommunityPosts,
            communityPosts.filter((p) => p.id !== id),
        );
    }, [communityPosts, persistAndSet]);

    const addPendingPg = useCallback(async (pgData) => {
        const newRequest = { ...pgData, id: generateId('pending_pg'), status: 'pending', dateSubmitted: new Date().toISOString() };
        return persistAndSet(StorageService.savePendingPgs.bind(StorageService), setPendingPgs, [...pendingPgs, newRequest]);
    }, [pendingPgs, persistAndSet]);

    const approvePendingPg = useCallback(async (requestId) => {
        const request = pendingPgs.find((req) => req.id === requestId);
        if (!request) return false;

        const updatedPending = pendingPgs.filter((req) => req.id !== requestId);
        await persistAndSet(StorageService.savePendingPgs.bind(StorageService), setPendingPgs, updatedPending);

        const { businessName, address, rent, adminId, phone } = request;
        await addPg({
            name: businessName,
            address,
            rent: parseFloat(rent),
            adminId,
            phone,
            location: { latitude: 18.5204, longitude: 73.8567 },
            totalRooms: 10,
            occupiedRooms: 0,
            totalBeds: 20,
            vacantBeds: 20,
            facilities: ['WiFi', 'Drinking Water'],
            safetyMeasures: ['CCTV'],
            gender: 'Any',
            images: [],
            rating: 0,
            reviews: 0,
        });
        return true;
    }, [pendingPgs, addPg, persistAndSet]);

    const rejectPendingPg = useCallback(async (requestId) => {
        return persistAndSet(
            StorageService.savePendingPgs.bind(StorageService),
            setPendingPgs,
            pendingPgs.filter((req) => req.id !== requestId),
        );
    }, [pendingPgs, persistAndSet]);

    const toggleUserStatus = useCallback(async (userId) => {
        const updated = users.map((u) => (u.id === userId ? {
            ...u,
            status: u.status === 'suspended' ? 'active' : 'suspended',
        } : u));
        return persistAndSet(StorageService.saveUsers.bind(StorageService), setUsers, updated);
    }, [users, persistAndSet]);

    const addDispute = useCallback(async (userId, pgId, title, description) => {
        const newDispute = {
            id: generateId('dispute'),
            userId,
            pgId,
            title,
            description,
            status: 'Open',
            date: new Date().toISOString(),
        };
        return persistAndSet(StorageService.saveDisputes.bind(StorageService), setDisputes, [newDispute, ...disputes]);
    }, [disputes, persistAndSet]);

    const updateDisputeStatus = useCallback(async (disputeId, newStatus) => {
        return persistAndSet(
            StorageService.saveDisputes.bind(StorageService),
            setDisputes,
            disputes.map((d) => (d.id === disputeId ? { ...d, status: newStatus } : d)),
        );
    }, [disputes, persistAndSet]);

    const updateSettings = useCallback(async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        return persistAndSet(StorageService.saveSettings.bind(StorageService), setSettings, merged);
    }, [settings, persistAndSet]);

    const addPayment = useCallback(async (paymentData) => {
        const newPayment = {
            id: generateId('payment'),
            ...paymentData,
            date: new Date().toISOString(),
        };
        return persistAndSet(StorageService.savePayments.bind(StorageService), setPayments, [newPayment, ...payments]);
    }, [payments, persistAndSet]);

    const getMessMenuForPg = useCallback((pgId) => {
        return messMenus.find((m) => m.pgId === pgId) || null;
    }, [messMenus]);

    const updateMessMenu = useCallback(async (pgId, menuData) => {
        const existing = messMenus.find((m) => m.pgId === pgId);
        const updated = existing
            ? messMenus.map((m) => (m.pgId === pgId ? { ...m, ...menuData } : m))
            : [...messMenus, { pgId, ...menuData }];
        return persistAndSet(StorageService.saveMessMenus.bind(StorageService), setMessMenus, updated);
    }, [messMenus, persistAndSet]);

    const addLeaveRequest = useCallback(async ({ userId, pgId, bookingId }) => {
        const newRequest = {
            id: generateId('leave_req'),
            userId,
            pgId,
            bookingId,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        return persistAndSet(
            StorageService.saveLeaveRequests.bind(StorageService),
            setLeaveRequests,
            [newRequest, ...leaveRequests],
        );
    }, [leaveRequests, persistAndSet]);

    const updateLeaveRequestStatus = useCallback(async (requestId, status) => {
        return persistAndSet(
            StorageService.saveLeaveRequests.bind(StorageService),
            setLeaveRequests,
            leaveRequests.map((r) => (r.id === requestId ? { ...r, status } : r)),
        );
    }, [leaveRequests, persistAndSet]);

    const approveLeaveRequest = useCallback(async (requestId) => {
        const req = leaveRequests.find((r) => r.id === requestId);
        if (!req) return false;
        const bookingSuccess = await updateBooking(req.bookingId, { status: 'Completed' });
        if (!bookingSuccess) return false;
        return updateLeaveRequestStatus(requestId, 'approved');
    }, [leaveRequests, updateBooking, updateLeaveRequestStatus]);

    const rejectLeaveRequest = useCallback(async (requestId) => {
        return updateLeaveRequestStatus(requestId, 'rejected');
    }, [updateLeaveRequestStatus]);

    const contextValue = useMemo(() => ({
        pgs,
        bookings,
        reviews,
        communityPosts,
        pendingPgs,
        users,
        disputes,
        settings,
        payments,
        messMenus,
        leaveRequests,
        isLoading,
        favoritesByUser,
        getFavoritesForUser,
        addPg,
        updatePg,
        deletePg,
        addBooking,
        updateBooking,
        clearBookings,
        toggleFavorite,
        addReview,
        addCommunityPost,
        updateCommunityPost,
        deleteCommunityPost,
        addPendingPg,
        approvePendingPg,
        rejectPendingPg,
        toggleUserStatus,
        addDispute,
        updateDisputeStatus,
        updateSettings,
        addPayment,
        getMessMenuForPg,
        updateMessMenu,
        addLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
    }), [
        pgs, bookings, reviews, communityPosts, pendingPgs, users, disputes,
        settings, payments, messMenus, leaveRequests, isLoading, favoritesByUser,
        getFavoritesForUser, addPg, updatePg, deletePg, addBooking, updateBooking,
        clearBookings, toggleFavorite, addReview, addCommunityPost, updateCommunityPost,
        deleteCommunityPost, addPendingPg, approvePendingPg, rejectPendingPg,
        toggleUserStatus, addDispute, updateDisputeStatus, updateSettings,
        addPayment, getMessMenuForPg, updateMessMenu,
        addLeaveRequest, approveLeaveRequest, rejectLeaveRequest,
    ]);

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};
