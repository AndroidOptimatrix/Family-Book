import React, { useCallback, useState, useEffect } from 'react';
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
    Platform,
    Dimensions,
    ImageURISource,
} from 'react-native';
import LinearHeader from '../components/common/header';
import useNotifications from '../hooks/useNotifications';
import { Notification } from '../types/notification.types';
import ImageViewerModal from '../components/common/image-viewer-modal';
import { Bell, Calendar, Heart } from 'react-native-feather';

const {width} = Dimensions.get("window");

// Custom hook to get image dimensions
const useImageDimensions = (uri: string) => {
    const [dimensions, setDimensions] = useState<{width: number, height: number} | null>(null);

    useEffect(() => {
        if (uri) {
            Image.getSize(uri, 
                (imgWidth, imgHeight) => {
                    setDimensions({width: imgWidth, height: imgHeight});
                },
                (error) => {
                    console.error('Error getting image dimensions:', error);
                    // Fallback to square aspect ratio
                    setDimensions({width: 1, height: 1});
                }
            );
        }
    }, [uri]);

    return dimensions;
};

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
    };

    // Close image viewer
    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
        setSelectedImage(null);
    };

    // Component for image with dynamic height
    const DynamicImage = ({ uri }: { uri: string }) => {
        const dimensions = useImageDimensions(uri);
        
        if (!dimensions) {
            // Show loading state or placeholder while dimensions are being fetched
            return (
                <View style={[styles.imageContainer, {height: width}]}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                </View>
            );
        }

        const aspectRatio = dimensions.width / dimensions.height;
        // Calculate height based on aspect ratio, but cap it for very tall images
        const calculatedHeight = Math.min(width / aspectRatio, width * 1.5);
        
        return (
            <Image
                source={{ uri }}
                style={[styles.notificationImage, {height: calculatedHeight}]}
                resizeMode="cover"
            />
        );
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const hasReaction = item.user_reacted === 'Yes';
        const reactionCount = parseInt(item.total_reaction) || 0;
        const isMemorial = item.deathnote === 'Yes';

        return (
            <View style={styles.notificationCard}>
                {/* Image Section with Dynamic Height */}
                {item.photo ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleImagePress(item.photo)}
                        style={styles.imageTouchable}
                    >
                        <DynamicImage uri={item.photo} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholderImage}>
                        <Bell stroke="#9CA3AF" width={48} height={48} />
                    </View>
                )}

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationTitle}>
                            {item.title}
                        </Text>

                        {item.description ? (
                            <Text style={styles.notificationDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        ) : null}

                        <View style={styles.dateRow}>
                            <Calendar stroke="#6B7280" width={14} height={14} />
                            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                            {isMemorial && (
                                <View style={styles.deathBadge}>
                                    <Text style={styles.deathBadgeText}>Memorial</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Action Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isMemorial ? styles.prayButton : styles.likeButton,
                                hasReaction && styles.actionButtonActive,
                            ]}
                            activeOpacity={0.7}
                        >
                            <View style={styles.buttonContent}>
                                {isMemorial ? (
                                    <>
                                        <Text style={styles.prayEmoji}>🙏</Text>
                                        <Text style={[
                                            styles.buttonText,
                                            hasReaction && styles.buttonTextActive
                                        ]}>
                                            {reactionCount > 0 ? `${reactionCount} Prayers` : 'Pray'}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Heart
                                            stroke={hasReaction ? '#FFFFFF' : '#EF4444'}
                                            width={20}
                                            height={20}
                                            fill={hasReaction ? '#EF4444' : 'none'}
                                        />
                                        <Text style={[
                                            styles.buttonText,
                                            hasReaction && styles.buttonTextActive
                                        ]}>
                                            {reactionCount > 0 ? `${reactionCount} Likes` : 'Like'}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        paddingBottom: Platform.OS == 'android' ? 30 : 0
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
        textAlign: 'center',
    },
    listContainer: {
        padding: 12,
    },
    emptyListContainer: {
        flex: 1,
    },
    notificationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    imageTouchable: {
        width: '100%',
    },
    imageContainer: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationImage: {
        width: '100%',
        backgroundColor: '#F3F4F6',
    },
    placeholderImage: {
        width: '100%',
        height: width, // Square placeholder
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
    },
    textContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    notificationDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 20,
        textAlign: 'center',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
        marginRight: 12,
        textAlign: 'center',
    },
    deathBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    deathBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#DC2626',
        textAlign: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1.5,
    },
    likeButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#EF4444',
    },
    prayButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#8B5CF6',
    },
    actionButtonActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
        textAlign: 'center',
    },
    buttonTextActive: {
        color: '#FFFFFF',
    },
    prayEmoji: {
        fontSize: 18,
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
        textAlign: 'center',
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
        textAlign: 'center',
    },
});

export default NotificationScreen;