import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import PGCard from '../../components/cards/PGCard';
import { EmptyState, SearchBar, FilterChips, ScreenHeader } from '../../components/common';
import MapScreen from './MapScreen';

const FILTERS = [
    { id: 'all', label: 'All Stays', icon: 'home' },
    { id: 'budget', label: 'Under ₹10k', icon: 'wallet' },
    { id: 'single', label: 'Premium (₹12k+)', icon: 'star' },
    { id: 'female', label: 'Female Only', icon: 'woman' },
    { id: 'male', label: 'Male Only', icon: 'man' },
];

export default function UserDashboard({ navigation }) {
    const { user, logout } = useAuth();
    const { pgs, favorites, toggleFavorite } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPgs, setFilteredPgs] = useState(pgs);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        Location.requestForegroundPermissionsAsync().catch(console.warn);
    }, []);

    useEffect(() => {
        let filtered = pgs;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (pg) => pg.name.toLowerCase().includes(q) || pg.address.toLowerCase().includes(q),
            );
        }

        if (selectedFilter === 'budget') {
            filtered = filtered.filter((pg) => pg.rent < 10000);
        } else if (selectedFilter === 'single') {
            filtered = filtered.filter((pg) => pg.rent >= 12000);
        } else if (selectedFilter !== 'all') {
            filtered = filtered.filter((pg) => pg.gender.toLowerCase() === selectedFilter);
        }

        setFilteredPgs(filtered);
    }, [searchQuery, pgs, selectedFilter]);

    const handleLogout = () => {
        logout();
        navigation.replace(ROUTES.LOGIN);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <ScreenHeader
                title="Explore Stays"
                subtitle="Find your perfect second home"
                style={{ borderBottomWidth: 0, paddingBottom: 0 }}
                rightComponent={
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate(ROUTES.USER.FAVORITES)}
                            style={styles.headerIconButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="heart-outline" size={22} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.headerIconButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="log-out-outline" size={22} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <View style={styles.filtersBar}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name or area..."
                    showFilterIcon
                    onSubmit={() => setViewMode('map')}
                />

                <FilterChips
                    filters={FILTERS}
                    selectedId={selectedFilter}
                    onSelect={setSelectedFilter}
                    showIcons
                />
            </View>

            {viewMode === 'list' ? (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.resultsText}>
                        {filteredPgs.length} {filteredPgs.length === 1 ? 'Property' : 'Properties'} found
                    </Text>

                    {filteredPgs.length === 0 ? (
                        <EmptyState
                            icon="search-outline"
                            title="No properties found"
                            message="Try adjusting your search filters or area"
                        />
                    ) : (
                        filteredPgs.map((pg) => (
                            <PGCard
                                key={pg.id}
                                pg={pg}
                                onPress={() => navigation.navigate(ROUTES.USER.PG_DETAILS, { pg })}
                                isFavorite={favorites.includes(pg.id)}
                                onToggleFavorite={() => toggleFavorite(user?.id, pg.id)}
                            />
                        ))
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            ) : (
                <MapScreen filteredPgs={filteredPgs} navigation={navigation} />
            )}

            <TouchableOpacity
                style={styles.floatingToggle}
                activeOpacity={0.9}
                onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            >
                <Ionicons
                    name={viewMode === 'list' ? 'map' : 'list'}
                    size={20}
                    color={COLORS.white}
                    style={{ marginRight: 6 }}
                />
                <Text style={styles.floatingToggleText}>
                    {viewMode === 'list' ? 'Map' : 'List'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    headerActions: { flexDirection: 'row', gap: SPACING.sm },
    headerIconButton: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: COLORS.backgroundPink, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255, 56, 92, 0.2)',
    },
    filtersBar: {
        backgroundColor: COLORS.white, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    },
    content: { flex: 1, backgroundColor: COLORS.white },
    resultsText: {
        paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg,
        fontSize: 13, color: COLORS.gray, fontWeight: FONT_WEIGHTS.extrabold,
        textTransform: 'uppercase', letterSpacing: 1,
    },
    floatingToggle: {
        position: 'absolute', bottom: SPACING.xl, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.black, paddingHorizontal: SPACING.xl, paddingVertical: 14,
        borderRadius: 30, ...SHADOWS.large,
    },
    floatingToggleText: {
        color: COLORS.white, fontWeight: FONT_WEIGHTS.extrabold,
        fontSize: FONT_SIZES.sm + 1, letterSpacing: 0.5,
    },
});
