import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Linking,
    Alert,
    Platform,
} from 'react-native';
import { ArrowLeft, Calendar, Youtube } from 'react-native-feather';
import LinearGradient from 'react-native-linear-gradient';
import { AppThemeGradient } from '../config/config';
import useVideos from '../hooks/useVideos';
import { Video } from '../types/video.types';
import { useNavigation } from '@react-navigation/native';
import LinearHeader from '../components/common/header';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - (ITEM_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

const VideoScreen: React.FC = () => {
    const { videos, error, loading, refetch } = useVideos();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    // Handle pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url: string): string | null => {
        try {
            // Handle embed URLs: https://www.youtube.com/embed/JQP91mCNXX8
            const embedMatch = url.match(/embed\/([^?&]+)/);
            if (embedMatch) return embedMatch[1];

            // Handle watch URLs: https://www.youtube.com/watch?v=JQP91mCNXX8
            const watchMatch = url.match(/v=([^&]+)/);
            if (watchMatch) return watchMatch[1];

            // Handle youtu.be URLs: https://youtu.be/JQP91mCNXX8
            const youtuBeMatch = url.match(/youtu\.be\/([^?&]+)/);
            if (youtuBeMatch) return youtuBeMatch[1];

            return null;
        } catch (error) {
            console.log('Error extracting YouTube ID:', error);
            return null;
        }
    };

    // Handle video press - Open in YouTube app or browser
    const handleVideoPress = (video: Video) => {
        const youtubeId = extractYouTubeId(video.url);

        if (!youtubeId) {
            // Fallback to opening the URL directly
            openUrl(video.url);
            return;
        }

        // Try to open in YouTube app first, then fallback to browser
        const youtubeAppUrl = `vnd.youtube://${youtubeId}`;
        const youtubeWebUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

        Linking.canOpenURL(youtubeAppUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(youtubeAppUrl);
                } else {
                    return Linking.openURL(youtubeWebUrl);
                }
            })
            .catch((err) => {
                console.error('Error opening YouTube:', err);
                Alert.alert(
                    'Error',
                    'Could not open YouTube. Please install the YouTube app or try again.',
                    [{ text: 'OK' }]
                );
            });
    };

    // Generic URL opener
    const openUrl = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert(
                    'Error',
                    `Cannot open this URL: ${url}`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error opening URL:', error);
        }
    };

    // Format date
    const formatDate = (dateString: string): string => {
        return dateString || 'Date not available';
    };

    // Truncate title
    const truncateTitle = (title: string, maxLength: number = 40): string => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    // Render grid item
    const renderVideoItem = ({ item }: { item: Video }) => {
        const youtubeId = extractYouTubeId(item.url);
        const thumbnailUrl = youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : item.image_url;

        return (
            <TouchableOpacity
                style={styles.videoCard}
                onPress={() => handleVideoPress(item)}
                activeOpacity={0.9}
            >
                {/* Video Thumbnail */}
                <View style={styles.thumbnailContainer}>
                    <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />

                    {/* YouTube-style Play Button with Backdrop */}
                    <View style={styles.youtubePlayOverlay}>
                        <View style={styles.youtubePlayBackdrop}>
                            <Youtube stroke="#ffffff" width={30} height={30} fill="#FF0000" />
                        </View>
                    </View>
                </View>

                {/* Video Info */}
                <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} >
                        {item.title}
                    </Text>

                    <View style={styles.dateRow}>
                        <Calendar stroke="#6B7280" width={12} height={12} />
                        <Text style={styles.dateText}>
                            {formatDate(item.date)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Youtube stroke="#9CA3AF" width={64} height={64} />
            </View>
            <Text style={styles.emptyTitle}>No Videos Available</Text>
            <Text style={styles.emptySubtitle}>
                {loading ? 'Loading videos...' : 'Check back later for new videos.'}
            </Text>
            {!loading && error && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refetch}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Render error state
    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Youtube stroke="#EF4444" width={64} height={64} />
            </View>
            <Text style={styles.emptyTitle}>Error Loading Videos</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={refetch}
                disabled={loading}
            >
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearHeader title='Videos' subtitle={`${videos.length} new videos`} />

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading videos...</Text>
                </View>
            ) : error && videos.length === 0 ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={videos}
                    renderItem={renderVideoItem}
                    keyExtractor={(item) => item.id}
                    numColumns={NUM_COLUMNS}
                    contentContainerStyle={styles.gridContainer}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3B82F6']}
                            tintColor="#3B82F6"
                        />
                    }
                    ListHeaderComponent={
                        videos.length > 0 ? (
                            <View style={styles.listHeader}>
                                <Text style={styles.listHeaderTitle}>
                                    Latest Videos
                                </Text>
                                <Text style={styles.listHeaderSubtitle}>
                                    Tap any video to watch on YouTube
                                </Text>
                            </View>
                        ) : null
                    }
                />
            )}
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
    },
    gridContainer: {
        paddingHorizontal: ITEM_MARGIN,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: ITEM_MARGIN,
    },
    listHeader: {
        paddingHorizontal: ITEM_MARGIN,
        paddingTop: 20,
        paddingBottom: 16,
        alignItems: 'center',
    },
    listHeaderTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    listHeaderSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    videoCard: {
        width: ITEM_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: ITEM_WIDTH * 0.75, // 4:3 aspect ratio
        backgroundColor: '#F3F4F6',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    // YouTube-style Play Button with Backdrop
    youtubePlayOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    youtubePlayBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent backdrop
        borderRadius: 50,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        lineHeight: 18,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
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
});

export default VideoScreen;