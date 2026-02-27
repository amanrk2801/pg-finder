import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import PostCard from '../../components/cards/PostCard';
import { EmptyState, SearchBar, FilterChips, ScreenHeader } from '../../components/common';

const CATEGORIES = [
    { id: 'All', label: 'All' },
    { id: 'Sale', label: 'Sale' },
    { id: 'Job', label: 'Job' },
    { id: 'Service', label: 'Service' },
];

export default function CommunityScreen({ navigation }) {
    const { user } = useAuth();
    const { communityPosts, deleteCommunityPost } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPosts, setFilteredPosts] = useState(communityPosts);
    const [selectedFilter, setSelectedFilter] = useState('All');

    useEffect(() => {
        let filtered = communityPosts;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(q) ||
                    post.description.toLowerCase().includes(q) ||
                    post.category.toLowerCase().includes(q),
            );
        }

        if (selectedFilter !== 'All') {
            filtered = filtered.filter((post) => post.category === selectedFilter);
        }

        setFilteredPosts(filtered);
    }, [searchQuery, communityPosts, selectedFilter]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <ScreenHeader
                title="Community"
                subtitle="Helping Hands Network"
                style={{ borderBottomWidth: 0, paddingBottom: 0 }}
            />

            <View style={styles.filtersBar}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search posts, jobs, services..."
                />

                <FilterChips
                    filters={CATEGORIES}
                    selectedId={selectedFilter}
                    onSelect={setSelectedFilter}
                />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.resultsText}>
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'Post' : 'Posts'} found
                </Text>

                {filteredPosts.length === 0 ? (
                    <EmptyState
                        icon="people-outline"
                        title="No posts found"
                        message="Be the first to ask for help or offer a service!"
                    />
                ) : (
                    filteredPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user?.id}
                            onDelete={deleteCommunityPost}
                        />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate(ROUTES.USER.CREATE_POST)}
                activeOpacity={0.9}
            >
                <Ionicons name="add" size={32} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    filtersBar: {
        backgroundColor: COLORS.white, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    },
    content: { flex: 1, backgroundColor: COLORS.backgroundGray, paddingHorizontal: SPACING.lg },
    resultsText: {
        paddingVertical: SPACING.md, fontSize: 12, color: COLORS.gray,
        fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase',
    },
    fab: {
        position: 'absolute', bottom: 30, right: 20,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
        ...SHADOWS.large,
    },
});
