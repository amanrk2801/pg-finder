import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import PGCard from '../../components/cards/PGCard';
import { EmptyState, ScreenHeader } from '../../components/common';

export default function FavoritesScreen({ navigation }) {
    const { pgs, favorites, toggleFavorite } = useData();
    const { user } = useAuth();

    const favoritePgs = pgs.filter(pg => favorites.includes(pg.id));

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="Favorites" subtitle="Your saved properties" onBack={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {favoritePgs.length === 0 ? (
                    <EmptyState
                        icon="heart-dislike-outline"
                        title="No favorites yet"
                        message="Tap the heart icon on properties to save them here for later."
                    />
                ) : (
                    favoritePgs.map((pg) => (
                        <PGCard
                            key={pg.id}
                            pg={pg}
                            onPress={() => navigation.navigate(ROUTES.USER.PG_DETAILS, { pg })}
                            isFavorite
                            onToggleFavorite={() => toggleFavorite(user?.id, pg.id)}
                        />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, backgroundColor: COLORS.white, paddingTop: SPACING.lg },
});
