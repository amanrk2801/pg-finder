import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import StorageService from '../services/StorageService';
import ApiClient from '../services/ApiClient';

export const DataContext = createContext();

const DEFAULT_SETTINGS = { platformFee: 5 };

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
    const [ownerBookings, setOwnerBookings] = useState([]);
    const [ownerPayments, setOwnerPayments] = useState([]);
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

    const loadAllData = useCallback(async (passedToken = null, passedType = null) => {
        try {
            await StorageService.ensureMigrations();
            const session = await StorageService.getUserSession();
            
            const token = passedToken || session?.token;
            const userType = passedType || session?.type;

            let pgData = [];
            let postsData = [];
            let settingsData = DEFAULT_SETTINGS;
            let bookingsData = [];
            let reviewsData = [];
            let paymentsData = [];
            let disputeData = [];
            let messMenusData = [];
            let leaveRequestsData = [];
            let usersData = [];

            console.log('--- DATA FETCH: STARTING REAL API LOAD ---');
            
            const opts = token ? { token } : {};
            
            try {
                const [p, c, s, m] = await Promise.all([
                    ApiClient.get('/pgs', opts),
                    ApiClient.get('/community'),
                    ApiClient.get('/settings'),
                    ApiClient.get('/mess'),
                ]);
                pgData = p || [];
                postsData = c || [];
                settingsData = s || DEFAULT_SETTINGS;
                messMenusData = m || [];
            } catch (err) {
                console.warn('Public/PG data fetch failed:', err.message);
            }

            if (token) {
                console.log(`--- FETCHING PRIVATE DATA FOR ${userType} ---`);
                try {
                    const [b, pay, d, l] = await Promise.all([
                        ApiClient.get('/bookings/me', opts),
                        ApiClient.get('/payments/me', opts),
                        ApiClient.get('/disputes/me', opts),
                        ApiClient.get('/leaves/me', opts),
                    ]);
                    bookingsData = b || [];
                    paymentsData = pay || [];
                    disputeData = d || [];
                    leaveRequestsData = l || [];

                    if (userType === 'superadmin') {
                        usersData = await ApiClient.get('/auth/users', opts).catch(() => []);
                    }

                    if (userType === 'admin' || userType === 'superadmin') {
                        const [ob, op] = await Promise.all([
                            ApiClient.get('/bookings/owner', opts).catch(() => []),
                            ApiClient.get('/payments/owner', opts).catch(() => []),
                        ]);
                        setOwnerBookings(ob || []);
                        setOwnerPayments(op || []);
                    }
                } catch (err) {
                    console.warn('Private data fetch failed:', err.message);
                }
            }

            setPgs((pgData || []).filter(p => p.status === 'approved'));
            setPendingPgs((pgData || []).filter(p => p.status === 'pending'));
            setBookings(bookingsData);
            setFavoritesByUser(normalizeFavoritesData(await StorageService.getFavorites()));
            setReviews(reviewsData);
            setCommunityPosts(postsData);
            setUsers(usersData);
            setDisputes(disputeData);
            setSettings(settingsData);
            setPayments(paymentsData);
            setMessMenus(messMenusData);
            setLeaveRequests(leaveRequestsData);
            
            console.log('--- DATA FETCH: COMPLETE ---');
        } catch (error) {
            console.error('DataContext - Global Load Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadAllData(); }, [loadAllData]);

    const addPg = useCallback(async (pg) => {
        const result = await ApiClient.post('/pgs', pg);
        if (result) {
            if (result.status === 'approved') {
                setPgs(prev => [...(prev || []), result]);
            } else {
                setPendingPgs(prev => [...(prev || []), result]);
            }
            return true;
        }
        return false;
    }, []);

    const updatePg = useCallback(async (id, updatedData) => {
        try {
            console.log(`[DataContext] Updating PG ${id}...`);
            const updated = await ApiClient.put(`/pgs/${id}`, updatedData);
            if (updated) {
                // Remove from both first, then re-add to correct one based on status
                setPgs(prev => (prev || []).filter(p => p.id !== id && p._id !== id));
                setPendingPgs(prev => (prev || []).filter(p => p.id !== id && p._id !== id));

                if (updated.status === 'approved') {
                    setPgs(prev => [...(prev || []), updated]);
                } else {
                    setPendingPgs(prev => [...(prev || []), updated]);
                }
                return true;
            }
        } catch (err) {
            console.warn('[DataContext] updatePg Error:', err.message);
        }
        return false;
    }, []);

    const deletePg = useCallback(async (id) => {
        try {
            await ApiClient.delete(`/pgs/${id}`);
            setPgs(prev => (prev || []).filter(p => p.id !== id && p._id !== id));
            setPendingPgs(prev => (prev || []).filter(p => p.id !== id && p._id !== id));
            return true;
        } catch (err) {
            console.warn('[DataContext] deletePg Error:', err.message);
            return false;
        }
    }, []);

    const deactivatePg = useCallback(async (id) => updatePg(id, { status: 'deactivated' }), [updatePg]);
    const reactivatePg = useCallback(async (id) => updatePg(id, { status: 'approved' }), [updatePg]);

    const addBooking = useCallback(async (userId, pgId, { monthlyRent } = {}) => {
        const booking = await ApiClient.post('/bookings', { pgId, monthlyRent });
        if (booking) {
            setBookings(prev => [...(prev || []), booking]);
            return booking;
        }
        return null;
    }, []);

    const updateBooking = useCallback(async (bookingId, updates) => {
        setBookings(prev => (prev || []).map(b => (b.id === bookingId || b._id === bookingId ? { ...b, ...updates } : b)));
        return true;
    }, []);

    const clearBookings = useCallback(async (userId) => {
        setBookings(prev => (prev || []).filter(b => b.userId !== userId));
        return true;
    }, []);

    const getFavoritesForUser = useCallback((userId) => {
        if (!userId) return [];
        return favoritesByUser[userId] || [];
    }, [favoritesByUser]);

    const toggleFavorite = useCallback(async (userId, pgId) => {
        if (!userId) return false;
        const current = favoritesByUser[userId] || [];
        const updatedUserFavorites = current.includes(pgId)
            ? current.filter((id) => id !== pgId)
            : [...current, pgId];
        const updated = { ...favoritesByUser, [userId]: updatedUserFavorites };
        return persistAndSet(StorageService.saveFavorites.bind(StorageService), setFavoritesByUser, updated);
    }, [favoritesByUser, persistAndSet]);

    const addReview = useCallback(async (review) => {
        const newReview = await ApiClient.post('/reviews', review);
        if (newReview) {
            setReviews(prev => [...(prev || []), newReview]);
            return true;
        }
        return false;
    }, []);

    const addCommunityPost = useCallback(async (post) => {
        const newPost = await ApiClient.post('/community', post);
        if (newPost) {
            setCommunityPosts(prev => [newPost, ...(prev || [])]);
            return true;
        }
        return false;
    }, []);

    const updateCommunityPost = useCallback(async (id, updatedData) => {
        setCommunityPosts(prev => (prev || []).map(p => (p.id === id || p._id === id ? { ...p, ...updatedData } : p)));
        return true;
    }, []);

    const deleteCommunityPost = useCallback(async (id) => {
        setCommunityPosts(prev => (prev || []).filter(p => p.id !== id && p._id !== id));
        return true;
    }, []);

    const addPendingPg = useCallback(async (pgData) => {
        return addPg({ ...pgData, status: 'pending' });
    }, [addPg]);

    const approvePendingPg = useCallback(async (requestId) => {
        return updatePg(requestId, { status: 'approved' });
    }, [updatePg]);

    const rejectPendingPg = useCallback(async (requestId) => {
        return updatePg(requestId, { status: 'rejected' });
    }, [updatePg]);

    const toggleUserStatus = useCallback(async (userId) => {
        const updated = await ApiClient.put(`/auth/status/${userId}`, {}); 
        if (updated) {
            setUsers(prev => (prev || []).map(u => (u.id === userId || u._id === userId ? updated : u)));
            return true;
        }
        return false;
    }, []);

    const approveAdmin = useCallback(async (userId) => {
        const updated = await ApiClient.put(`/auth/approve-admin/${userId}`, {});
        if (updated) {
            setUsers(prev => (prev || []).map(u => (u.id === userId || u._id === userId ? updated : u)));
            return true;
        }
        return false;
    }, []);

    const rejectAdmin = useCallback(async (userId) => {
        setUsers(prev => (prev || []).filter(u => u.id !== userId && u._id !== userId));
        return true;
    }, []);

    const addDispute = useCallback(async (userId, pgId, title, description) => {
        const dispute = await ApiClient.post('/disputes', { pgId, title, description });
        if (dispute) {
            setDisputes(prev => [dispute, ...(prev || [])]);
            return true;
        }
        return false;
    }, []);

    const updateDisputeStatus = useCallback(async (disputeId, newStatus) => {
        const updated = await ApiClient.put(`/disputes/${disputeId}`, { status: newStatus });
        if (updated) {
            setDisputes(prev => (prev || []).map(d => (d.id === disputeId || d._id === disputeId ? updated : d)));
            return true;
        }
        return false;
    }, []);

    const updateSettings = useCallback(async (newSettings) => {
        const updated = await ApiClient.put('/settings', newSettings);
        if (updated) {
            setSettings(updated);
            return true;
        }
        return false;
    }, []);

    const addPayment = useCallback(async (paymentData) => {
        const newPayment = await ApiClient.post('/payments', paymentData);
        if (newPayment) {
            setPayments(prev => [newPayment, ...(prev || [])]);
            return true;
        }
        return false;
    }, []);

    const getMessMenuForPg = useCallback((pgId) => {
        return (messMenus || []).find((m) => m.pgId === pgId) || null;
    }, [messMenus]);

    const updateMessMenu = useCallback(async (pgId, menuData) => {
        const updated = await ApiClient.put('/mess', { pgId, menu: menuData });
        if (updated) {
            setMessMenus(prev => {
                const existing = (prev || []).find(m => m.pgId === pgId);
                return existing ? (prev || []).map(m => (m.pgId === pgId ? updated : m)) : [...(prev || []), updated];
            });
            return true;
        }
        return false;
    }, []);

    const addLeaveRequest = useCallback(async ({ userId, pgId, bookingId }) => {
        const leave = await ApiClient.post('/leaves', { pgId, bookingId });
        if (leave) {
            setLeaveRequests(prev => [...(prev || []), leave]);
            return true;
        }
        return false;
    }, []);

    const updateLeaveRequestStatus = useCallback(async (requestId, status) => {
        const updated = await ApiClient.put(`/leaves/${requestId}`, { status });
        if (updated) {
            setLeaveRequests(prev => (prev || []).map(r => (r.id === requestId || r._id === requestId ? updated : r)));
            return true;
        }
        return false;
    }, []);

    const approveLeaveRequest = useCallback(async (requestId) => {
        return updateLeaveRequestStatus(requestId, 'approved');
    }, [updateLeaveRequestStatus]);

    const rejectLeaveRequest = useCallback(async (requestId) => {
        return updateLeaveRequestStatus(requestId, 'rejected');
    }, [updateLeaveRequestStatus]);

    const contextValue = useMemo(() => ({
        pgs, bookings, reviews, communityPosts, pendingPgs, users, disputes,
        settings, payments, messMenus, leaveRequests, isLoading, favoritesByUser,
        ownerBookings, ownerPayments,
        getFavoritesForUser, addPg, updatePg, deletePg, deactivatePg, reactivatePg, addBooking, updateBooking,
        clearBookings, toggleFavorite, addReview, addCommunityPost, updateCommunityPost,
        deleteCommunityPost, addPendingPg, approvePendingPg, rejectPendingPg,
        toggleUserStatus, approveAdmin, rejectAdmin, addDispute, updateDisputeStatus, updateSettings,
        addPayment, getMessMenuForPg, updateMessMenu,
        addLeaveRequest, approveLeaveRequest, rejectLeaveRequest,
        loadAllData,
    }), [
        pgs, bookings, reviews, communityPosts, pendingPgs, users, disputes,
        settings, payments, messMenus, leaveRequests, isLoading, favoritesByUser,
        ownerBookings, ownerPayments,
        getFavoritesForUser, addPg, updatePg, deletePg, deactivatePg, reactivatePg, addBooking, updateBooking,
        clearBookings, toggleFavorite, addReview, addCommunityPost, updateCommunityPost,
        deleteCommunityPost, addPendingPg, approvePendingPg, rejectPendingPg,
        toggleUserStatus, approveAdmin, rejectAdmin, addDispute, updateDisputeStatus, updateSettings,
        addPayment, getMessMenuForPg, updateMessMenu,
        addLeaveRequest, approveLeaveRequest, rejectLeaveRequest, loadAllData
    ]);

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};
