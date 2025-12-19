import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  RefreshControl,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Bell,
  Calendar,
  Heart,
  Video as VideoIcon,
  Users,
  Facebook,
  Instagram,
  Youtube,
  Gift,
  HelpCircle,
  Video,
  User,
  BookOpen
} from 'react-native-feather';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import Sidebar from '../components/dashboard/sidebar';
import Header from '../components/dashboard/header';
import GridItem from '../components/dashboard/grid-items';
import AdCarousel from '../components/dashboard/ad-carousel';
import PlatformCard from '../components/dashboard/plateform-card';
import EventCard from '../components/dashboard/event-card';

import { MenuItem, GridItem as GridItemType, Advertisement, Platform, Event } from '../types/dashboard.types';
import { useAuth } from '../context/auth-context';
import useAdvertisement from '../hooks/useAdvertisement';

type DashboardStackParamList = {
  DashboardMain: undefined;
  Notifications: undefined;
  Birthdays: undefined;
  Anniversaries: undefined;
  Videos: undefined;
  Events: undefined;
  Profile: undefined;
  Advertisements: undefined;
  Help: undefined;
};

const { width } = Dimensions.get('window');

const GREEN_50 = 'rgb(240, 253, 244)';
const BLUE_50 = 'rgb(239, 246, 255)';
const PURPLE_50 = 'rgb(250, 245, 255)';

const DashboardScreen: React.FC = () => {
  const { logout } = useAuth();
  const { advertisements } = useAdvertisement();
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const sidebarAnim = useRef(new Animated.Value(-width)).current;

  // Data
  const sidebarMenuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Birthdays',
      icon: Calendar,
      gradient: GREEN_50,
      screen: '',
    },
    {
      id: '2',
      title: 'Anniversaries',
      icon: Heart,
      gradient: BLUE_50,
      screen: '',
    },
    {
      id: '3',
      title: 'Events',
      icon: Calendar,
      gradient: PURPLE_50,
      screen: 'Events',
    },
    {
      id: '4',
      title: 'Notifications',
      icon: Bell,
      gradient: GREEN_50,
      screen: 'Notifications',
    },
    {
      id: '5',
      title: 'Videos',
      icon: Video,
      gradient: BLUE_50,
      screen: 'Videos',
    },
    {
      id: '6',
      title: 'Advertisements',
      icon: BookOpen,
      gradient: PURPLE_50,
      screen: 'Advertisements',
    },
    {
      id: '7',
      title: 'Help & Support',
      icon: HelpCircle,
      gradient: GREEN_50,
      screen: '',
    },
  ];

  const gridItems: GridItemType[] = [
    {
      id: '1',
      title: 'Notification',
      icon: Bell,
      gradient: BLUE_50,
      screen: 'Notifications',
      icon_bg: ['#accdffff', '#0048e4ff']
    },
    {
      id: '2',
      title: 'Birthday',
      icon: Calendar,
      gradient: BLUE_50,
      screen: '',
      icon_bg: ['#accdffff', '#0048e4ff']
    },
    {
      id: '3',
      title: 'Anniversary',
      icon: Heart,
      gradient: BLUE_50,
      screen: '',
      icon_bg: ['#accdffff', '#0048e4ff']
    },
    {
      id: '4',
      title: 'Video',
      icon: VideoIcon,
      gradient: PURPLE_50,
      screen: 'Videos',
      icon_bg: ['#eaccffff', '#5300acff']
    },
    {
      id: '5',
      title: 'Events',
      icon: Users,
      gradient: PURPLE_50,
      screen: 'Events',
      icon_bg: ['#eaccffff', '#5300acff']
    },
    {
      id: '6',
      title: 'My Profile',
      icon: User,
      gradient: PURPLE_50,
      screen: 'Profile',
      icon_bg: ['#eaccffff', '#5300acff']
    },
  ];

  const followPlatforms: Platform[] = [
    {
      id: '3',
      name: 'YouTube',
      icon: Youtube,
      handle: 'Family Book',
      followers: '9K+ subscribers',
      url: 'https://youtube.com/c/FamilyBookChannel',
      gradient: ['#FF0000', '#CC0000'],
    },
    {
      id: '1',
      name: 'Facebook',
      icon: Facebook,
      handle: '@FamilyBook',
      followers: '50K+ followers',
      url: 'https://facebook.com/FamilyBookOfficial',
      gradient: ['#1877F2', '#0A5BC4'],
    },
    {
      id: '2',
      name: 'Instagram',
      icon: Instagram,
      handle: '@familybook',
      followers: '25K+ followers',
      url: 'https://instagram.com/familybook',
      gradient: ['#E4405F', '#C13584'],
    },

  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Rajesh Birthday',
      date: 'Tomorrow • Dec 15, 2023',
      type: 'birthday',
      icon: Gift,
      gradient: ['#10B981', '#059669'],
    },
    {
      id: '2',
      title: 'Parents Anniversary',
      date: 'Next Week • Dec 25, 2023',
      type: 'anniversary',
      icon: Gift,
      gradient: ['#EC4899', '#BE185D'],
    },
  ];

  // Functions
  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  const handleMenuItemPress = (item: MenuItem) => {
    closeSidebar();
    // Navigate to the screen
    navigation.navigate(item.screen as keyof DashboardStackParamList);
  };

  const handleLogout = async () => {
    closeSidebar();
    try {
      await logout();
      // Navigation back to login will be handled by App.tsx based on auth state
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const handleGridItemPress = (item: GridItemType) => {
    // Navigate to the screen
    navigation.navigate(item.screen as keyof DashboardStackParamList);
  };

  const Backdrop = () => (
    <TouchableWithoutFeedback onPress={closeSidebar}>
      <Animated.View style={styles.backdrop} />
    </TouchableWithoutFeedback>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Split grid items into rows of 3
  const gridRows = [];
  for (let i = 0; i < gridItems.length; i += 3) {
    gridRows.push(gridItems.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Sidebar Backdrop */}
      {sidebarVisible && <Backdrop />}

      {/* Sidebar Component */}
      <Sidebar
        sidebarAnim={sidebarAnim}
        onClose={closeSidebar}
        onMenuItemPress={handleMenuItemPress}
        onLogout={handleLogout}
        menuItems={sidebarMenuItems}
        onEditProfile={() => {
          closeSidebar();
          navigation.navigate('Profile');
        }}
      />

      {/* Main Content */}
      <View style={[styles.mainContent, sidebarVisible && styles.mainContentBlur]}>
        {/* Header Component */}
        <Header
          onMenuPress={openSidebar}
          logoSource={require('../horizontal-logo.png')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >

          {/* Main Grid Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <Text style={styles.sectionSubtitle}>Everything in one place</Text>
            </View>
            <View style={styles.gridContainer}>
              {gridRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((item) => (
                    <GridItem
                      key={item.id}
                      item={item}
                      onPress={() => handleGridItemPress(item)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Advertisement Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Advertisement</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Advertisements')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <AdCarousel advertisements={advertisements} />
          </View>

          {/* Follow Us Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Follow Us</Text>
              <Text style={styles.sectionSubtitle}>Stay connected with our community</Text>
            </View>
            <View style={styles.platformsRow}>
              {followPlatforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </View>
          </View>

          {/* Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Celebration</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                <Text style={styles.seeAllText}>View Calendar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.eventsList}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
  },
  mainContentBlur: {
    opacity: 0.7,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 15,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  platformsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  eventsList: {
    gap: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DashboardScreen;