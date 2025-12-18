import React from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Calendar, User, MapPin, Phone, Gift } from 'react-native-feather';
import { AppThemeGradient } from '../config/config';
import { useNavigation } from '@react-navigation/native';
import useBirthdayOrAnnivarsary from '../hooks/useBirthdayOrAnivarsary';

const { width } = Dimensions.get('window');


const BirthdayScreen = () => {
    const { loading, data } = useBirthdayOrAnnivarsary();
    const navigation = useNavigation();

    const formatDate = (dateString: string) => {
        const [day, month, year] = dateString.split('-');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    };

    const calculateAge = (dob: string): string => {
        const [day, month, year] = dob.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age.toString();
    };

    const handleCallPress = (mobile: string) => {
        Alert.alert(
            'Call Contact',
            `Would you like to call ${mobile}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => { } } // You can implement actual calling here
            ]
        );
    };

    const handleWishPress = (name: string) => {
        Alert.alert(
            'Send Birthday Wishes',
            `Send birthday wishes to ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send', onPress: () => { } }
            ]
        );
    };

    if (loading) {
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
                            <ArrowLeft stroke="#FFFFFF" width={24} height={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Birthdays</Text>
                        <View style={styles.headerRight} />
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading birthdays...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const todayBirthdays = data.filter(person => {
        const today = new Date();
        const [day, month] = person.dob.split('-');
        return parseInt(day) === today.getDate() && parseInt(month) === today.getMonth() + 1;
    });

    const upcomingBirthdays = data.filter(person => {
        const today = new Date();
        const [day, month] = person.dob.split('-');
        const birthday = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
        return birthday > today && !(parseInt(day) === today.getDate() && parseInt(month) === today.getMonth() + 1);
    });

    const sortedUpcoming = upcomingBirthdays.sort((a, b) => {
        const [dayA, monthA] = a.dob.split('-');
        const [dayB, monthB] = b.dob.split('-');
        const dateA = new Date(new Date().getFullYear(), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(new Date().getFullYear(), parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Gradient */}
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
                        <Text style={styles.headerTitle}>Birthdays</Text>
                        <Text style={styles.headerSubtitle}>
                            {data.length} birthdays to celebrate
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Today's Birthdays Section */}
                {todayBirthdays.length > 0 && (
                    <View style={styles.section}>

                        {todayBirthdays.map((person) => (
                            <View key={person.id} style={[styles.birthdayCard, styles.todayCard]}>
                                <View style={styles.cardHeader}>
                                    <Image
                                        source={{ uri: person.image || 'https://via.placeholder.com/150' }}
                                        style={styles.profileImage}
                                    />
                                    <View style={styles.nameContainer}>
                                        <Text style={styles.fullName}>{person.full_name.trim()}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardDetails}>
                                    <View style={styles.detailRow}>
                                        <Calendar stroke="#6B7280" width={16} height={16} />
                                        <Text style={styles.detailText}>{formatDate(person.dob)}</Text>
                                    </View>
                                    {person.city && (
                                        <View style={styles.detailRow}>
                                            <MapPin stroke="#6B7280" width={16} height={16} />
                                            <Text style={styles.detailText}>{person.city}</Text>
                                        </View>
                                    )}
                                    {person.mobile && (
                                        <View style={styles.detailRow}>
                                            <Phone stroke="#6B7280" width={16} height={16} />
                                            <Text style={styles.detailText}>{person.mobile}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.wishButton]}
                                        onPress={() => handleWishPress(person.full_name)}
                                    >
                                        <Text style={styles.wishButtonText}>Send Wishes</Text>
                                    </TouchableOpacity>
                                    {person.mobile && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.callButton]}
                                            onPress={() => handleCallPress(person.mobile)}
                                        >
                                            <Text style={styles.callButtonText}>Call</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Upcoming Birthdays Section */}
                {sortedUpcoming.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <Calendar stroke="#6366F1" width={20} height={20} />
                                <Text style={styles.sectionTitle}>Upcoming Birthdays</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>
                                Next {Math.min(5, sortedUpcoming.length)} of {sortedUpcoming.length}
                            </Text>
                        </View>

                        {sortedUpcoming.slice(0, 5).map((person) => {
                            const age = calculateAge(person.dob);
                            const upcomingAge = parseInt(age) + 1;

                            return (
                                <View key={person.id} style={styles.birthdayCard}>
                                    <View style={styles.cardHeader}>
                                        <Image
                                            source={{ uri: person.image || 'https://via.placeholder.com/150' }}
                                            style={styles.profileImage}
                                        />
                                        <View style={styles.nameContainer}>
                                            <Text style={styles.fullName}>{person.full_name.trim()}</Text>
                                            <Text style={styles.upcomingText}>
                                                Turns {upcomingAge} on {formatDate(person.dob)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardDetails}>
                                        <View style={styles.detailRow}>
                                            <Calendar stroke="#6B7280" width={16} height={16} />
                                            <Text style={styles.detailText}>{formatDate(person.dob)}</Text>
                                            <Text style={styles.ageText}>• {upcomingAge} years</Text>
                                        </View>
                                        {person.city && (
                                            <View style={styles.detailRow}>
                                                <MapPin stroke="#6B7280" width={16} height={16} />
                                                <Text style={styles.detailText}>{person.city}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.reminderButton}
                                        onPress={() => handleWishPress(person.full_name)}
                                    >
                                        <Text style={styles.reminderButtonText}>Set Reminder</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}

                        {sortedUpcoming.length > 5 && (
                            <TouchableOpacity style={styles.viewAllButton}>
                                <Text style={styles.viewAllText}>View All Upcoming ({sortedUpcoming.length})</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Empty State */}
                {data.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Calendar stroke="#9CA3AF" width={80} height={80} />
                        </View>
                        <Text style={styles.emptyTitle}>No Birthdays Found</Text>
                        <Text style={styles.emptySubtitle}>
                            There are no birthdays to display.
                            {'\n'}Add family members to see their birthdays.
                        </Text>
                    </View>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>
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
        // paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    headerRight: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statCard: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 28,
    },
    birthdayCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    todayCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    nameContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    birthdayText: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
    },
    upcomingText: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '500',
    },
    cardDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
        flex: 1,
    },
    ageText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
        marginLeft: 8,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    wishButton: {
        backgroundColor: '#10B981',
    },
    wishButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    callButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    callButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    reminderButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    reminderButtonText: {
        color: '#6366F1',
        fontWeight: '600',
        fontSize: 14,
    },
    viewAllButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
    },
    viewAllText: {
        color: '#6366F1',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default BirthdayScreen;