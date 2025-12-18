import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight, LogOut, Edit2 } from 'react-native-feather';
import { MenuItem } from '../../types/dashboard.types';
import LinearGradient from 'react-native-linear-gradient';
import { AppThemeGradient } from '../../config/config';
import { useAuth } from '../../context/auth-context';

interface SidebarProps {
  sidebarAnim: Animated.Value;
  onClose: () => void;
  onMenuItemPress: (item: MenuItem) => void;
  onLogout: () => void;
  menuItems: MenuItem[];
  onEditProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarAnim,
  onClose,
  onMenuItemPress,
  onLogout,
  menuItems,
  onEditProfile,
}) => {
  const { userInfo, userPhone } = useAuth();

  // Format phone number for display
  const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return 'N/A';
    
    // Remove any non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Remove country code if present (e.g., "918141561118" -> "8141561118")
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2);
    }
    
    // Format the phone number (e.g., "8141561118" -> "81415 61118")
    if (cleanPhone.length === 10) {
      return `+91 ${cleanPhone.substring(0, 5)} ${cleanPhone.substring(5)}`;
    }
    
    return `+91 ${cleanPhone}`;
  };

  // Get user name from userInfo
  const userName = userInfo?.user_name || userInfo?.name || 'User';
  const phoneNumber = formatPhoneNumber(userInfo?.mobile || userPhone);

  return (
    <Animated.View
      style={[
        styles.sidebarContainer,
        { transform: [{ translateX: sidebarAnim }] }
      ]}
    >
      <LinearGradient colors={AppThemeGradient} style={[styles.sidebarHeader, { backgroundColor: 'rgb(239, 246, 255)' }]}>
        <View style={styles.sidebarHeaderTop}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ChevronLeft stroke="#1F2937" width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.sidebarTitle}>Menu</Text>
        </View>

        <View style={styles.profileSection}>
          {/* <View style={[styles.profileImage, { backgroundColor: 'rgb(240, 253, 244)' }]}>
            <Text style={styles.profileInitial}>JD</Text>
          </View> */}

          {/* Add this container for name and edit button */}
          <View style={styles.nameAndEditContainer}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
                {userName.trim() || 'User'}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {phoneNumber}
              </Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditProfile}
            >
              <Edit2 stroke="#000000ff" width={16} height={16} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Rest of the component remains the same */}
      <ScrollView
        style={styles.menuItems}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: item.gradient }]}
              onPress={() => onMenuItemPress(item)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
                <Icon stroke="#1F2937" width={20} height={20} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <ChevronRight stroke="#4B5563" width={16} height={16} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
          onPress={onLogout}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <LogOut stroke="#EF4444" width={20} height={20} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Family Book v1.0.0</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  sidebarHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  sidebarHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1919ff',
  },
  profileSection: {
    alignItems: 'center',
  },
  nameAndEditContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileInfo: {
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 15,
  },
  // Edit button styles
  editButton: {
    padding: 8,
    marginTop: 2,
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 15,
  },
  versionContainer: {
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});

export default Sidebar;