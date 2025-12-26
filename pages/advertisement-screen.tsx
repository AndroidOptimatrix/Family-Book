import React, { useState } from 'react';
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
    Dimensions,
    Linking,
    Platform,
} from 'react-native';
import { Image as ImageIcon, ExternalLink, Maximize2 } from 'react-native-feather';
import LinearHeader from '../components/common/header';
import ImageViewerModal from '../components/common/image-viewer-modal'; // Import your reusable component
import useAdvertisement from '../hooks/useAdvertisement';
import { Advertisement } from '../types/dashboard.types';

const { width } = Dimensions.get('window');

const AdvertisementScreen: React.FC = () => {
    const { loading, advertisements, error, refetch } = useAdvertisement();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    // Handle image press (opens image viewer)
    const handleImagePress = (imageUri: string) => {
        setSelectedImage(imageUri);
        setIsImageViewerVisible(true);
    };

    // Handle ad card press (opens website)
    const handleAdPress = async (ad: Advertisement) => {
        if (ad.website) {
            try {
                const url = ad.website.startsWith('http') ? ad.website : `https://${ad.website}`;
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                    await Linking.openURL(url);
                }
            } catch (err) {
                console.error('Error opening URL:', err);
            }
        }
    };

    // Close image viewer
    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
        setSelectedImage(null);
    };

    const renderAdvertisementItem = ({ item }: { item: Advertisement }) => (
        <TouchableOpacity
            style={styles.adCard}
            activeOpacity={0.9}
            onPress={() => handleAdPress(item)}
        >
            {/* Image with separate press handler */}
            <TouchableOpacity
                style={styles.imageTouchable}
                activeOpacity={0.9}
                onPress={() => handleImagePress(item.image)}
            >
                <Image
                    source={{ uri: item.image }}
                    style={styles.adImage}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <ImageIcon stroke="#9CA3AF" width={64} height={64} />
            </View>
            <Text style={styles.emptyTitle}>No Advertisements</Text>
            <Text style={styles.emptySubtitle}>
                Check back later for new advertisements.
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <ImageIcon stroke="#EF4444" width={64} height={64} />
            </View>
            <Text style={styles.emptyTitle}>Error Loading Advertisements</Text>
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
            <LinearHeader title='Advertisement' subtitle={`${advertisements.length} new advertisements`} />

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading advertisements...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={advertisements}
                    renderItem={renderAdvertisementItem}
                    keyExtractor={(item, index) => item.image || index.toString()}
                    contentContainerStyle={
                        advertisements.length === 0 ? styles.emptyListContainer : styles.listContainer
                    }
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3B82F6']}
                            tintColor="#3B82F6"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                />
            )}

            <ImageViewerModal
                isVisible={isImageViewerVisible}
                imageUri={selectedImage}
                onClose={closeImageViewer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingBottom: Platform.OS == 'android' ? 30 : 0
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
        padding: 12,
    },
    emptyListContainer: {
        flex: 1,
    },
    row: {
        justifyContent: 'space-between',
    },
    adCard: {
        width: (width - 36) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
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
    adImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F3F4F6',
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adContent: {
        padding: 12,
    },
    adDescription: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    websiteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    websiteText: {
        fontSize: 12,
        color: '#3B82F6',
        marginLeft: 4,
        fontWeight: '600',
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

export default AdvertisementScreen;