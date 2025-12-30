import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Modal
} from 'react-native';
import { useAuth } from '../context/auth-context';
import LinearHeader from '../components/common/header';
import { User, Phone, LogOut } from 'react-native-feather';
import EditProfileModal from '../components/overlays/edit-profile.modal';

const ProfileScreen: React.FC = () => {
    const { userInfo, logout } = useAuth();
    const [openModal, setOpenModal] = useState<boolean>(false)

    // Format phone number
    const formatPhoneNumber = (phone: string | null | undefined): string => {
        if (!phone) return 'Not available';

        let cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.substring(2);
        }

        if (cleanPhone.length === 10) {
            return `+91 ${cleanPhone.substring(0, 5)} ${cleanPhone.substring(5)}`;
        }

        return `+91 ${cleanPhone}`;
    };

    // Get user data
    const username = userInfo?.user_name || userInfo?.name || 'User';
    const phoneNumber = formatPhoneNumber(userInfo?.mobile);

    // Get first character for avatar
    const getFirstCharacter = (name: string): string => {
        return name.charAt(0).toUpperCase();
    };

    const avatarChar = getFirstCharacter(username);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

            <LinearHeader title='Profile' subtitle='Manage Your Profile' isProfile openProfile={() => setOpenModal(true)} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar Floating Card */}
                <View style={styles.avatarCard}>

                    {/* Avatar Content */}
                    <View style={styles.avatarContent}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{avatarChar}</Text>
                        </View>

                        <View style={styles.avatarInfo}>
                            <Text style={styles.userName}>{username}</Text>
                            <Text style={styles.userStatus}>{phoneNumber}</Text>
                        </View>
                    </View>
                </View>

                {/* Information Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    {/* Name Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <View style={styles.infoCardIcon}>
                                <User stroke="#3B82F6" width={20} height={20} />
                            </View>
                            <Text style={styles.infoCardTitle}>Full Name</Text>
                            {/* <TouchableOpacity style={styles.editInfoButton}>
                                <Edit2 stroke="#6B7280" width={16} height={16} />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={styles.infoCardValue}>{username}</Text>
                    </View>

                    {/* Phone Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <View style={styles.infoCardIcon}>
                                <Phone stroke="#3B82F6" width={20} height={20} />
                            </View>
                            <Text style={styles.infoCardTitle}>Phone Number</Text>
                            {/* <TouchableOpacity style={styles.editInfoButton}>
                                <Edit2 stroke="#6B7280" width={16} height={16} />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={styles.infoCardValue}>{phoneNumber}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => logout()}
                activeOpacity={0.8}
            >
                <LogOut stroke="#DC2626" width={20} height={20} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>


            {/* EditProfleModal */}

            <Modal
                visible={openModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setOpenModal(false)}
            >
                <EditProfileModal
                    onClose={() => setOpenModal(false)}
                    onSuccess={() => {
                        // Refresh your user info here if needed
                        console.log('Profile updated successfully');
                    }}
                />
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingBottom: Platform.OS == 'android' ? 30 : 0
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    // Avatar Card Styles
    avatarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginBottom: 24,
        elevation: 8,
        overflow: 'hidden',
        minHeight: 180,
    },
    avatarGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        borderTopRightRadius: 24,
        opacity: 0.8,
    },
    avatarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        marginRight: 16,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    avatarInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 6,
    },
    userStatus: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '500',
        flexDirection: 'row',
        alignItems: 'center',
    },
    editAvatarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    // Stats Container
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    // Information Section
    infoSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoCardIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoCardTitle: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        flex: 1,
    },
    editInfoButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoCardValue: {
        fontSize: 18,
        color: '#1F2937',
        fontWeight: '600',
    },
    // Logout Button
    logoutButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 16,

        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
        marginLeft: 8,
    },
});

export default ProfileScreen;