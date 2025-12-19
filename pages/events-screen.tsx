import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    Animated,
} from 'react-native';
import useEvents from '../hooks/useEvents';
import { Event } from '../types/event.types';
import { Calendar, MapPin, Clock, Maximize2 } from 'react-native-feather';
import LinearHeader from '../components/common/header';
import ImageViewerModal from '../components/common/image-viewer-modal';

const stripHTML = (html: string) => {
    if (!html) return '';
    return html
        .replace(/<[^>]*>?/gm, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
};

const formatEventDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const cleanDate = stripHTML(dateString);
        return cleanDate.replace(/\\n/g, ' • ');
    } catch (error) {
        return dateString;
    }
};

const EventsScreen = () => {
    const { events, error, loading, refetch } = useEvents();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    // Animation values
    const scale = useState(new Animated.Value(1))[0];
    const currentScale = React.useRef(1);

    // Handle pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Handle image press
    const handleImagePress = (imageUri: string) => {
        setSelectedImage(imageUri);
        setIsImageViewerVisible(true);
        resetImageTransforms();
    };

    // Reset all transforms
    const resetImageTransforms = () => {
        currentScale.current = 1;
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Close image viewer
    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
        setSelectedImage(null);
        resetImageTransforms();
    };

    const renderEventItem = ({ item }: { item: Event }) => {
        return (
            <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
                {/* Event Image with Touchable */}
                {item.photo ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleImagePress(item.photo)}
                        style={styles.imageTouchable}
                    >
                        <Image
                            source={{ uri: item.photo }}
                            style={styles.eventImage}
                            resizeMode="contain"
                        />
                        <View style={styles.imageOverlay}>
                            <Maximize2 stroke="#FFFFFF" width={20} height={20} />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.eventImage, styles.noImage]}>
                        <Text style={styles.noImageText}>No Image</Text>
                    </View>
                )}

                {/* Event Content */}
                <View style={styles.eventContent}>
                    {/* Event Title */}
                    <Text style={styles.eventTitle} numberOfLines={1}>
                        {item.title || 'Untitled Event'}
                    </Text>

                    {/* Event Date */}
                    {item.date && (
                        <View style={styles.eventDetailRow}>
                            <Calendar width={16} height={16} stroke="#666" />
                            <Text style={styles.eventDetailText} numberOfLines={1}>
                                {formatEventDate(item.date)}
                            </Text>
                        </View>
                    )}

                    {/* Event Time */}
                    {item.time && (
                        <View style={styles.eventDetailRow}>
                            <Clock width={16} height={16} stroke="#666" />
                            <Text style={styles.eventDetailText} numberOfLines={1}>
                                {item.time}
                            </Text>
                        </View>
                    )}

                    {/* Event Location */}
                    {item.place && (
                        <View style={styles.eventDetailRow}>
                            <MapPin width={16} height={16} stroke="#666" />
                            <Text style={styles.eventDetailText} numberOfLines={1}>
                                {item.place}
                            </Text>
                        </View>
                    )}

                    {/* Event Description */}
                    {item.description && (
                        <Text style={styles.eventDescription} numberOfLines={3}>
                            {stripHTML(item.description)}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Calendar width={80} height={80} stroke="#ccc" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyText}>
                {loading ? 'Loading events...' : 'There are no events scheduled at the moment.'}
            </Text>
            {!loading && error && (
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading && events.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading Events...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearHeader title='Events' subtitle={`${events.length} new events`} />

            <FlatList
                data={events}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={loading || refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                    />
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {error && events.length === 0 && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ImageViewerModal imageUri={selectedImage} isVisible={isImageViewerVisible} onClose={closeImageViewer} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 32,
        flexGrow: 1,
    },
    eventCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    imageTouchable: {
        position: 'relative',
    },
    eventImage: {
        width: '100%',
        height: 200,
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
    noImage: {
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#666',
        fontSize: 14,
    },
    eventContent: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventDetailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    eventDescription: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
        marginTop: 12,
    },
    separator: {
        height: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f44336',
        alignItems: 'center',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default EventsScreen;