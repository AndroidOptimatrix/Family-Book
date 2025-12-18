import React from 'react';
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
} from 'react-native';
import { Image as ImageIcon, ExternalLink, ArrowLeft } from 'react-native-feather';
import LinearGradient from 'react-native-linear-gradient';
import { AppThemeGradient } from '../config/config';
import useAdvertisement from '../hooks/useAdvertisement';
import { Advertisement } from '../types/dashboard.types';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AdvertisementScreen: React.FC = () => {
    const { loading, advertisements, error, refetch } = useAdvertisement();
    const [refreshing, setRefreshing] = React.useState(false);
    const navigation = useNavigation();

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

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

    const renderAdvertisementItem = ({ item }: { item: Advertisement }) => (
        <TouchableOpacity
            style={styles.adCard}
            activeOpacity={0.9}
            onPress={() => handleAdPress(item)}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.adImage}
                resizeMode="contain"
            />
            {item.description && (
                <View style={styles.adContent}>
                    <Text style={styles.adDescription}>{item.description}</Text>
                    {item.website && (
                        <View style={styles.websiteRow}>
                            <ExternalLink stroke="#3B82F6" width={16} height={16} />
                            <Text style={styles.websiteText}>Visit Website</Text>
                        </View>
                    )}
                </View>
            )}
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
            <LinearGradient
                colors={AppThemeGradient}
                style={styles.gradientHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft stroke="#000" width={24} height={24} />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Advertisements</Text>
                        <Text style={styles.headerSubtitle}>
                            {advertisements.length} {advertisements.length === 1 ? 'advertisement' : 'advertisements'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    gradientHeader: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginBottom: 20,
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
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        // marginBottom: 4,
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
    adImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F3F4F6',
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
