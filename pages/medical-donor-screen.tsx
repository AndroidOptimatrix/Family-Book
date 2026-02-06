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
import { BASEURL } from '../config/config';

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

    // DEBUG LOGS FOR IMAGES
    // donors?.map((don => {
    //     console.log("Donor image", `${BASEURL}/uploads/medical_donor/${don.image}`);
    // }))

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <LinearHeader title='કાયમી મેડિકલ ફંડના દાતા' subtitle='Medical Fund Donor' />

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

                {/* Donors List */}
                <View style={styles.donorsList}>
                    {donors?.map((donor) => (
                        <View key={donor.id} style={styles.donorCard}>
                            {/* Profile Image */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => donor.image && handleImagePress(`${BASEURL}/uploads/medical_donor/${donor.image}`)}
                            >
                                <Image
                                    source={{ uri: `${BASEURL}/uploads/medical_donor/${donor.image}` }}
                                    style={styles.donorAvatar}
                                />
                            </TouchableOpacity>

                            {/* Center: Donor Name */}
                            <View style={styles.donorInfo}>
                                <View style={styles.donorNameContainer}>
                                    <Text style={styles.donorName} numberOfLines={2}>
                                        {donor.name}
                                    </Text>
                                </View>
                            </View>

                            {/* Right: Amount & Date */}
                            <View style={styles.rightContainer}>
                                <Text style={styles.amountText}>
                                    {formatCurrency(donor.amount)}
                                </Text>
                                <Text style={styles.dateText}>
                                    {formatDate(donor.date)}
                                </Text>
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
    donorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
    },
    donorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    donorCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        minHeight: 60,
    },
    donorNameContainer: {
        flex: 2,
        justifyContent: 'center',
        minHeight: 40,
    },
    donorName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        lineHeight: 20,
    },
    rightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: 8,
        flex: 1,
    },
    amountText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginBottom: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
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
});

export default MedicalDonorScreen;