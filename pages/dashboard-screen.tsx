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
  Platform as DevicePlatform,
} from 'react-native';
import {
  Bell,
  Calendar,
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Gift,
  HelpCircle,
  Video,
  BookOpen,
  Globe,
  PlusCircle
} from 'react-native-feather';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import Sidebar from '../components/dashboard/sidebar';
import Header from '../components/dashboard/header';
import GridItem from '../components/dashboard/grid-items';
import AdCarousel from '../components/dashboard/ad-carousel';
import PlatformCard from '../components/dashboard/plateform-card';
import EventCard from '../components/dashboard/event-card';
import ComingSoonModal from '../components/common/coming-soon';

import { MenuItem, GridItem as GridItemType, Platform, Event } from '../types/dashboard.types';
import { useAuth } from '../context/auth-context';
import useAdvertisement from '../hooks/useAdvertisement';
import useSocialMedia from '../hooks/useSocialMedia';

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
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const sidebarAnim = useRef(new Animated.Value(-width)).current;

  const { loading, socialMedia } = useSocialMedia();

  const followPlatforms: Platform[] = socialMedia.map((item) => {
    const platformName = item.plateform.toLowerCase();

    let IconComponent = Globe;

    if (platformName.includes('facebook')) {
      IconComponent = Facebook;
    } else if (platformName.includes('instagram')) {
      IconComponent = Instagram;
    } else if (platformName.includes('youtube')) {
      IconComponent = Youtube;
    } else if (platformName.includes('twitter')) {
      IconComponent = require('react-native-vector-icons/Feather').Twitter || Globe;
    } else if (platformName.includes('linkedin')) {
      IconComponent = require('react-native-vector-icons/Feather').Linkedin || Globe;
    } else if (platformName.includes('whatsapp')) {
      IconComponent = require('react-native-vector-icons/Feather').MessageCircle || Globe;
    }

    // Determine gradient based on platform name
    let gradient = ['#3B82F6', '#1E40AF'];

    if (platformName.includes('facebook')) {
      gradient = ['#1877F2', '#0A5BC4'];
    } else if (platformName.includes('instagram')) {
      gradient = ['#E4405F', '#C13584'];
    } else if (platformName.includes('youtube')) {
      gradient = ['#FF0000', '#CC0000'];
    } else if (platformName.includes('twitter')) {
      gradient = ['#1DA1F2', '#0D8BD9'];
    } else if (platformName.includes('linkedin')) {
      gradient = ['#0077B5', '#005582'];
    } else if (platformName.includes('whatsapp')) {
      gradient = ['#25D366', '#128C7E'];
    }

    return {
      id: item.id.toString(),
      name: item.plateform,
      icon: IconComponent,
      url: item.url || '#', // Use URL from API, fallback to '#'
      gradient: gradient,
    };
  });

  // Data
  const sidebarMenuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Notifications',
      icon: Bell,
      gradient: GREEN_50,
      screen: 'Notifications',
    },
    {
      id: '5',
      title: 'Videos',
      icon: Video,
      gradient: PURPLE_50,
      screen: 'Videos',
    },
    {
      id: '2',
      title: 'Events',
      icon: Calendar,
      gradient: BLUE_50,
      screen: 'Events',
    },

    {
      id: '6',
      title: 'Advertisements',
      icon: BookOpen,
      gradient: GREEN_50,
      screen: 'Advertisements',
    },
    {
      id: '3',
      title: 'Birthdays',
      icon: Calendar,
      gradient: PURPLE_50,
      screen: '',
    },
    {
      id: '4',
      title: 'Anniversaries',
      icon: Heart,
      gradient: BLUE_50,
      screen: '',
    },
    {
      id: '7',
      title: 'Help & Support',
      icon: HelpCircle,
      gradient: GREEN_50,
      screen: 'Support',
    },
  ];

  const gridItems: GridItemType[] = [
    {
      id: '1',
      title: 'Latest Updates',
      gujTitle: 'તાજેતરની સુચનાઓ',
      icon: Bell,
      gradient: BLUE_50,
      screen: 'Notifications',
      icon_bg: ['#accdffff', '#0048e4ff']
    },
    {
      id: '4',
      title: 'Medical Fund Donor',
      gujTitle: 'મેડિકલ ફંડના દાતાર',
      icon: PlusCircle,
      gradient: BLUE_50,
      screen: '',
      icon_bg: ['#accdffff', '#0048e4ff']
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

    if (!item.screen) {
      setComingSoonFeature(item.title);
      setShowComingSoon(true);
      return;
    }

    navigation.navigate(item.screen as keyof DashboardStackParamList);
  };

  const handleGridItemPress = (item: GridItemType) => {
    if (!item.screen) {
      setComingSoonFeature(item.title);
      setShowComingSoon(true);
      return;
    }

    navigation.navigate(item.screen as keyof DashboardStackParamList);
  };

  const handleLogout = async () => {
    closeSidebar();
    try {
      await logout();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
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
          <View style={[styles.section, { marginTop: 15 }]}>
            <View style={styles.gridContainer}>
              {gridRows.map((row, rowIndex) => {
                const isLastRow = rowIndex === gridRows.length - 1;
                const isLastRowNotFull = isLastRow && row.length < 3;
                return (
                  <View key={rowIndex} style={{gap: 10}} >
                    {row.map((item) => (
                      <GridItem
                        key={item.id}
                        item={item}
                        onPress={() => handleGridItemPress(item)}
                        flex={isLastRowNotFull}
                      />
                    ))}
                  </View>
                )
              })}
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
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading social platforms...</Text>
              </View>
            ) : followPlatforms.length > 0 ? (
              <View style={styles.platformsRow}>
                {followPlatforms.slice(0, 3).map((platform) => (
                  <PlatformCard key={platform.id} platform={platform} />
                ))}
              </View>
            ) : (
              <View style={styles.platformsRow}>
                {/* Fallback to hardcoded platforms if API returns no data */}
                <PlatformCard platform={{
                  id: '1',
                  name: 'Facebook',
                  icon: Facebook,
                  url: 'https://facebook.com/FamilyBookOfficial',
                  gradient: ['#1877F2', '#0A5BC4'],
                }} />
                <PlatformCard platform={{
                  id: '2',
                  name: 'Instagram',
                  icon: Instagram,
                  url: 'https://instagram.com/familybook',
                  gradient: ['#E4405F', '#C13584'],
                }} />
                <PlatformCard platform={{
                  id: '3',
                  name: 'YouTube',
                  icon: Youtube,
                  url: 'https://youtube.com/c/FamilyBookChannel',
                  gradient: ['#FF0000', '#CC0000'],
                }} />
              </View>
            )}
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

      {/* Coming Soon Modal */}
      <ComingSoonModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        featureName={comingSoonFeature}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    paddingBottom: DevicePlatform.OS == 'android' ? 30 : 0,
    flex: 1
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  seeAllText: {
    fontSize: 12,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default DashboardScreen;