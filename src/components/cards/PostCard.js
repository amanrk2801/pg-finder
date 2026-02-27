import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    SPACING,
    FONT_SIZES,
    FONT_WEIGHTS,
    BORDER_RADIUS,
    SHADOWS,
    TYPOGRAPHY,
} from "../../constants/theme";

export default function PostCard({ post, currentUserId, onDelete }) {
    const isOwner = post.userId === currentUserId;

    const handleContact = () => {
        Alert.alert(
            "Contact",
            `Reach out to ${post.authorName} at:\n${post.contactInfo}`,
            [
                { text: "Copy Email", onPress: () => { /* In a real app, copy to clipboard */ Alert.alert("Copied!"); } },
                { text: "Close", style: "cancel" }
            ]
        );
    };

    const formattedDate = new Date(post.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Sale': return 'pricetag-outline';
            case 'Job': return 'briefcase-outline';
            case 'Service': return 'build-outline';
            default: return 'help-circle-outline';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Sale': return '#E8F5E9'; // Green
            case 'Job': return '#E3F2FD'; // Blue
            case 'Service': return '#FFF5F8'; // Pink
            default: return COLORS.backgroundGray;
        }
    };

    const getCategoryTextColor = (category) => {
        switch (category) {
            case 'Sale': return '#4CAF50';
            case 'Job': return '#2196F3';
            case 'Service': return COLORS.primary;
            default: return COLORS.gray;
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{post.authorName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.authorName}>{post.authorName}</Text>
                        <Text style={styles.date}>{formattedDate}</Text>
                    </View>
                </View>

                {isOwner && onDelete && (
                    <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.title}>{post.title}</Text>

            <View style={[styles.badge, { backgroundColor: getCategoryColor(post.category) }]}>
                <Ionicons name={getCategoryIcon(post.category)} size={12} color={getCategoryTextColor(post.category)} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: getCategoryTextColor(post.category) }]}>{post.category}</Text>
            </View>

            <Text style={styles.description}>{post.description}</Text>

            <View style={styles.footer}>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Status: </Text>
                    <Text style={[styles.statusValue, { color: post.status === 'Active' ? '#4CAF50' : COLORS.gray }]}>
                        {post.status}
                    </Text>
                </View>

                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.md,
    },
    authorName: {
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.black,
    },
    date: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    deleteButton: {
        padding: SPACING.xs,
    },
    title: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.xs,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.md,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.bold,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: FONT_SIZES.base,
        color: COLORS.gray,
        lineHeight: 22,
        marginBottom: SPACING.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    statusValue: {
        fontSize: FONT_SIZES.sm,
        fontWeight: FONT_WEIGHTS.bold,
    },
    contactButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    contactButtonText: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.sm,
    }
});
