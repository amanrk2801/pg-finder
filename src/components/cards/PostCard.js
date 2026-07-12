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

function timeAgo(dateInput) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PostCard({ post, currentUserId, onDelete, onToggleStatus }) {
    const isOwner = post.userId === currentUserId;
    const isClosed = post.status === 'Closed';
    const postId = post.id || post._id;

    const handleContact = () => {
        const digits = (post.contactInfo || '').replace(/\D/g, '');
        if (digits.length < 10) {
            Alert.alert("Contact", `Reach out to ${post.authorName || 'the poster'} at:\n${post.contactInfo}`);
            return;
        }
        const phone = digits.length > 10 ? digits : `91${digits}`;
        const message = `Hi, I saw your post "${post.title}" on PG Finder Community and I'm interested. Could you share more details?`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() =>
            Alert.alert("Error", "Could not open WhatsApp. Please make sure it's installed.")
        );
    };

    const handleDelete = () => {
        Alert.alert('Delete Post', 'Remove this post permanently?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(postId) },
        ]);
    };

    const formattedDate = timeAgo(post.date || post.createdAt);

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
        <View style={[styles.card, isClosed && styles.cardClosed]}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: getCategoryTextColor(post.category) }]}>
                        <Text style={styles.avatarText}>{(post.authorName || 'U').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.authorName}>{post.authorName || 'Unknown User'}</Text>
                            {isOwner && (
                                <View style={styles.youBadge}>
                                    <Text style={styles.youBadgeText}>YOU</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.date}>{formattedDate}</Text>
                    </View>
                </View>

                {isOwner && onDelete && (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.title}>{post.title}</Text>

            <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={[styles.badge, { backgroundColor: getCategoryColor(post.category) }]}>
                    <Ionicons name={getCategoryIcon(post.category)} size={12} color={getCategoryTextColor(post.category)} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: getCategoryTextColor(post.category) }]}>{post.category}</Text>
                </View>
                {isClosed && (
                    <View style={[styles.badge, { backgroundColor: COLORS.backgroundGray }]}>
                        <Ionicons name="lock-closed" size={11} color={COLORS.gray} style={{ marginRight: 4 }} />
                        <Text style={[styles.badgeText, { color: COLORS.gray }]}>{post.category === 'Sale' ? 'SOLD' : 'CLOSED'}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.description}>{post.description}</Text>

            <View style={styles.footer}>
                {isOwner && onToggleStatus ? (
                    <TouchableOpacity
                        style={styles.toggleStatusBtn}
                        onPress={() => onToggleStatus(postId, isClosed ? 'Active' : 'Closed')}
                    >
                        <Ionicons name={isClosed ? 'refresh-outline' : 'checkmark-done-outline'} size={14} color={COLORS.gray} />
                        <Text style={styles.toggleStatusText}>
                            {isClosed ? 'Reopen' : (post.category === 'Sale' ? 'Mark as Sold' : 'Mark as Closed')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}

                {!isClosed && !isOwner && (
                    <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                        <Ionicons name="logo-whatsapp" size={14} color={COLORS.white} style={{ marginRight: 4 }} />
                        <Text style={styles.contactButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                )}
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
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#25D366',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    cardClosed: { opacity: 0.65 },
    youBadge: {
        backgroundColor: COLORS.backgroundPink, paddingHorizontal: 6, paddingVertical: 1,
        borderRadius: BORDER_RADIUS.sm,
    },
    youBadgeText: { fontSize: 9, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
    toggleStatusBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    },
    toggleStatusText: { fontSize: FONT_SIZES.xs, color: COLORS.gray, fontWeight: FONT_WEIGHTS.semibold },
    contactButtonText: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.sm,
    }
});
