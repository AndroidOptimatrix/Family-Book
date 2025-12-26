import React, { useCallback, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Animated,
} from 'react-native';
import LinearHeader from '../components/common/header';
import useNotifications from '../hooks/useNotifications';
import { Notification } from '../types/notification.types';
import ImageViewerModal from '../components/common/image-viewer-modal';
import { Bell, Calendar, Heart, Maximize2 } from 'react-native-feather';

const NotificationScreen: React.FC = () => {
    const {
        loading,
        loadingMore,
        notifications,
        error,
        hasMore,
        refreshing,
        loadMore,
        refresh
    } = useNotifications();

    // State for image viewer
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    // Animation values
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    // Track current scale separately
    const currentScale = useRef(1);

    const onRefresh = React.useCallback(async () => {
        await refresh();
    }, [refresh]);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = parseInt(parts[1]) - 1;
            return `${parts[0]} ${months[monthIndex]}, ${parts[2]}`;
        }
        return dateString;
    };

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loadingMore && !loading) {
            loadMore();
        }
    }, [hasMore, loadingMore, loading, loadMore]);

    // Handle image press
    const handleImagePress = (imageUri: string) => {
        setSelectedImage(imageUri);
        setIsImageViewerVisible(true);
        resetImageTransforms();
    };

    // Reset all transforms
    const resetImageTransforms = () => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
            }),
        ]).start();
        currentScale.current = 1;
    };

    // Close image viewer
    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
        setSelectedImage(null);
        resetImageTransforms();
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const hasReaction = item.user_reacted === 'Yes';
        const reactionCount = parseInt(item.total_reaction) || 0;

        return (
            <TouchableOpacity style={styles.notificationCard} activeOpacity={0.9}>
                {/* Image Section - Center Top */}
                {item.photo ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleImagePress(item.photo)}
                        style={styles.imageTouchable}
                    >
                        <Image
                            source={{ uri: item.photo }}
                            style={styles.notificationImage}
                            resizeMode="contain"
                        />
                        <View style={styles.imageOverlay}>
                            <Maximize2 stroke="#FFFFFF" width={24} height={24} />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholderImage}>
                        <Bell stroke="#9CA3AF" width={48} height={48} />
                    </View>
                )}

                <View style={styles.contentContainer}>
                    <Text style={styles.notificationTitle}>
                        {item.title}
                    </Text>

                    {item.description ? (
                        <Text style={styles.notificationDescription}>
                            {item.description}
                        </Text>
                    ) : null}

                    <View style={styles.dateRow}>
                        <Calendar stroke="#6B7280" width={14} height={14} />
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                        {item.deathnote === 'Yes' && (
                            <View style={styles.deathBadge}>
                                <Text style={styles.deathBadgeText}>Memorial</Text>
                            </View>
                        )}
                    </View>

                    {/* Big Like Button with Count */}
                    <TouchableOpacity
                        style={[
                            styles.likeButton,
                            hasReaction && styles.likeButtonActive,
                        ]}
                        activeOpacity={0.8}
                    >
                        <Heart
                            stroke={hasReaction ? '#FFFFFF' : '#EF4444'}
                            width={24}
                            height={24}
                            fill={hasReaction ? '#FFFFFF' : 'none'}
                        />
                        <Text
                            style={[
                                styles.likeButtonText,
                                hasReaction && styles.likeButtonTextActive,
                            ]}
                        >
                            {reactionCount > 0 ? `${reactionCount} Likes` : 'Like'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingMoreText}>Loading more notifications...</Text>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Bell stroke="#9CA3AF" width={64} height={64} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
                You're all caught up! Check back later for updates.
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Bell stroke="#EF4444" width={64} height={64} />
            </View>
            <Text style={styles.emptyTitle}>Error Loading Notifications</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={refresh}
                disabled={loading}
            >
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearHeader title='Notifications' subtitle={`${notifications.length} new notifications`} />

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item, index) => item.id || `notification-${index}`}
                    contentContainerStyle={
                        notifications.length === 0 ? styles.emptyListContainer : styles.listContainer
                    }
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3B82F6']}
                            tintColor="#3B82F6"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                />
            )}

            <ImageViewerModal imageUri={selectedImage} isVisible={isImageViewerVisible} onClose={closeImageViewer} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientHeader: {
        paddingTop: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(51, 50, 50, 0.95)',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    listContainer: {
        padding: 16,
    },
    emptyListContainer: {
        flex: 1,
    },
    notificationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    imageTouchable: {
        position: 'relative',
    },
    notificationImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
        alignItems: 'center',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    notificationDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 20,
        textAlign: 'center',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 6,
        marginRight: 12,
    },
    deathBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    deathBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#DC2626',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32, 
        minWidth: 140, 
        alignSelf: 'center', 
    },
    likeButtonActive: {
    },
    likeButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#EF4444',
        marginLeft: 8,
    },
    likeButtonTextActive: {
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footerLoader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingMoreText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#6B7280',
    },
});

export default NotificationScreen;