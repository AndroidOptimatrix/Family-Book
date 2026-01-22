import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import useMedicalDonors from '../hooks/useMedicalDonors';
import LinearHeader from '../components/common/header';
import ImageViewerModal from '../components/common/image-viewer-modal';

const MedicalDonorScreen: React.FC = () => {
    const { donors, loading, error } = useMedicalDonors();
    const [refreshing, setRefreshing] = useState(false);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Calculate total donations
    const totalDonations = donors
        ? donors.reduce((sum, donor) => sum + parseInt(donor.amount), 0)
        : 0;

    // Format currency
    const formatCurrency = (amount: string) => {
        return `₹${parseInt(amount).toLocaleString('en-IN')}`;
    };

    // Format date to "dd MMM, yyyy" format (e.g., "20 Jan, 2026")
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return dateString;
            }

            const day = date.getDate().toString().padStart(2, '0'); // 01, 02, ..., 31
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            return `${day} ${month}, ${year}`; // "20 Jan, 2026"

        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    // Handle image press to open modal
    const handleImagePress = (imageUri: string) => {
        setSelectedImage(imageUri);
        setIsImageViewerVisible(true);
    };

    // Close image viewer modal
    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
        setSelectedImage(null);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading donors...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading data</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <LinearHeader title='Kaymi Medical Donor' subtitle='મેડિકલ ફંડના દાતા' />

                {/* Total Section */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalTitle}>Total Fund</Text>
                    <Text style={styles.totalAmount}>
                        {formatCurrency(totalDonations.toString())}
                    </Text>
                    <Text style={styles.donorCount}>
                        From {donors?.length || 0} generous donors
                    </Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Donors List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Recent Donors</Text>
                </View>

                {/* Donors List */}
                <View style={styles.donorsList}>
                    {donors?.map((donor) => (
                        <View key={donor.id} style={styles.donorCard}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => donor.photo && handleImagePress(donor.photo)}
                            >
                                <Image
                                    source={{ uri: donor.photo }}
                                    style={styles.donorAvatar}
                                />
                            </TouchableOpacity>

                            <View style={styles.donorInfo}>
                                <View style={styles.donorHeader}>
                                    <Text style={styles.donorName}>{donor.name}</Text>
                                </View>

                                <View style={styles.donationDetails}>
                                    <View style={styles.amountContainer}>
                                        <Text style={styles.amountText}>
                                            {formatCurrency(donor.amount)}
                                        </Text>
                                    </View>
                                    <Text style={styles.dateText}>{formatDate(donor.date)}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <ImageViewerModal
                imageUri={selectedImage}
                isVisible={isImageViewerVisible}
                onClose={closeImageViewer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: 16,
        color: '#FF0000',
    },
    totalContainer: {
        backgroundColor: '#4F46E5',
        padding: 20,
        alignItems: 'center',
    },
    totalTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 10,
        opacity: 0.9,
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 5,
    },
    donorCount: {
        fontSize: 14,
        color: '#FFFFFF',
        marginTop: 5,
        opacity: 0.8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 20,
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    donorsList: {
        paddingHorizontal: 20,
    },
    donorCard: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    donorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
    },
    donorInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    donorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    donorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#D1FAE5',
    },
    inactiveBadge: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    activeText: {
        color: '#065F46',
    },
    inactiveText: {
        color: '#991B1B',
    },
    donationDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
        marginLeft: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
    },
});

export default MedicalDonorScreen;