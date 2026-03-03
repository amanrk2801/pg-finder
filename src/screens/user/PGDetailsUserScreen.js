import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StatusBar,
  Image,
  Dimensions,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function PGDetailsUserScreen({ route, navigation }) {
  const { pg } = route.params;
  const { user } = useAuth();
  const { getFavoritesForUser, toggleFavorite, addBooking, updatePg, reviews, addReview } = useData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Local state for optimistic update of vacancy
  const [localVacantBeds, setLocalVacantBeds] = useState(pg.vacantBeds);

  // Review state
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const pgReviews = reviews.filter(r => r.pgId === pg.id);
  const isFavorite = getFavoritesForUser(user?.id).includes(pg.id);

  const handleCall = () => {
    Alert.alert("Contact Owner", `Opening dialer for ${pg.name}...`);
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${pg.location.latitude},${pg.location.longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open maps."),
    );
  };

  const handleBook = () => {
    if (localVacantBeds <= 0) {
      Alert.alert("Fully Occupied", "Sorry, no beds are currently available.");
      return;
    }
    // Navigate to the mock Payment flow instead of booking instantly
    navigation.navigate(ROUTES.USER.PAYMENT, { pg });
  };

  const handleSubmitReview = async () => {
    if (!newReviewText.trim()) return;

    await addReview({
      pgId: pg.id,
      userId: user?.id,
      rating: newReviewRating,
      comment: newReviewText,
    });

    setNewReviewText('');
    setShowReviewInput(false);
    Alert.alert("Success", "Thanks for your review!");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const images = pg.images && pg.images.length > 0 ? pg.images : [];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {images.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={COLORS.grayLight} />
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            activeOpacity={0.8}
            onPress={() => toggleFavorite(user?.id, pg.id)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? COLORS.primary : COLORS.black}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.pgName}>{pg.name}</Text>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={COLORS.primary} style={styles.addressIcon} />
            <Text style={styles.pgAddress}>{pg.address}</Text>
          </View>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Ionicons name="people" size={14} color={COLORS.black} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{pg.gender} Only</Text>
            </View>
            <View
              style={[
                styles.badge,
                localVacantBeds > 0 ? styles.badgeAvailable : styles.badgeFull,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  localVacantBeds > 0
                    ? { color: COLORS.secondary }
                    : { color: COLORS.white },
                ]}
              >
                {localVacantBeds > 0
                  ? `${localVacantBeds} Beds Available`
                  : "Currently Full"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>What this place offers</Text>
          <View style={styles.facilitiesGrid}>
            {pg.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.secondary} style={styles.listIcon} />
                <Text style={styles.facilityName}>{facility}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Safety & Security</Text>
          <View style={styles.safetyGrid}>
            {pg.safetyMeasures.map((measure, index) => (
              <View key={index} style={styles.safetyItem}>
                <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.primary} style={styles.listIcon} />
                <Text style={styles.safetyName}>{measure}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Reviews ({pgReviews.length})</Text>

          {pgReviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
          ) : (
            pgReviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>User</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}

          {!showReviewInput ? (
            <TouchableOpacity
              style={styles.addReviewBtn}
              onPress={() => setShowReviewInput(true)}
            >
              <Text style={styles.addReviewBtnText}>Write a Review</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.reviewInputContainer}>
              <View style={styles.ratingSelector}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setNewReviewRating(star)}>
                    <Ionicons
                      name={star <= newReviewRating ? "star" : "star-outline"}
                      size={24}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience..."
                value={newReviewText}
                onChangeText={setNewReviewText}
                multiline
              />
              <View style={styles.reviewActions}>
                <TouchableOpacity onPress={() => setShowReviewInput(false)} style={styles.cancelReviewBtn}>
                  <Text style={styles.cancelReviewBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmitReview} style={styles.submitReviewBtn}>
                  <Text style={styles.submitReviewBtnText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}


          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Upgraded Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Monthly Rent</Text>
          <Text style={styles.priceAmount}>₹{pg.rent.toLocaleString()}</Text>
        </View>
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={22} color={COLORS.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.callButton,
              localVacantBeds <= 0 && { backgroundColor: COLORS.gray }
            ]}
            onPress={handleBook}
            activeOpacity={0.8}
          >
            <Text style={styles.callButtonText}>
              {localVacantBeds > 0 ? "Book Bed" : "Full"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollView: { flex: 1 },
  imageSection: { position: "relative", width: width, height: 350 },
  carouselImage: { width: width, height: 350 },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    position: "absolute",
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.overlayDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  content: { padding: SPACING.xxl },
  pgName: { ...TYPOGRAPHY.h2, marginBottom: 8 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  addressIcon: {
    marginRight: 4,
  },
  pgAddress: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    flex: 1,
  },
  badges: { flexDirection: "row", gap: SPACING.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  badgeAvailable: { backgroundColor: "#E0F2F1" },
  badgeFull: { backgroundColor: COLORS.primary },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.black,
    fontWeight: FONT_WEIGHTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  sectionTitle: { ...TYPOGRAPHY.h4, marginBottom: SPACING.lg },
  facilitiesGrid: { gap: SPACING.md },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  listIcon: {
    width: 32,
  },
  facilityName: { fontSize: FONT_SIZES.base, color: COLORS.black },
  safetyGrid: { gap: SPACING.md },
  safetyItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  safetyName: { fontSize: FONT_SIZES.base, color: COLORS.black },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
  priceContainer: { flex: 1 },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.black,
  },
  footerActions: { flexDirection: "row", gap: SPACING.md },
  directionsButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.primary,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  noReviewsText: {
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: SPACING.md
  },
  reviewCard: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    marginLeft: 2,
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.grayLight,
    marginBottom: SPACING.sm,
  },
  reviewComment: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.base,
    lineHeight: 20,
  },
  addReviewBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addReviewBtnText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.md,
  },
  reviewInputContainer: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 4
  },
  ratingLabel: {
    fontWeight: FONT_WEIGHTS.bold,
    marginRight: SPACING.sm,
  },
  reviewInput: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  cancelReviewBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  cancelReviewBtnText: {
    color: COLORS.gray,
    fontWeight: FONT_WEIGHTS.bold,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
  },
  submitReviewBtnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  }
});