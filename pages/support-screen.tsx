// screens/SupportScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Mail,
  Phone,
  MessageCircle,
  Globe,
  HelpCircle,
  Headphones,
  Clock,
  Info,
} from 'react-native-feather';
import { AppThemeGradient } from '../config/config';
import LinearHeader from '../components/common/header';

const { width } = Dimensions.get('window');

interface SupportItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: () => void;
  actionText?: string;
}

const SupportItem: React.FC<SupportItemProps> = ({
  icon,
  title,
  subtitle,
  action,
  actionText = 'Contact',
}) => {
  return (
    <View style={styles.supportItem}>
      <View style={styles.supportIconContainer}>
        {icon}
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportSubtitle}>{subtitle}</Text>
      </View>
      {action && (
        <TouchableOpacity
          style={styles.supportButton}
          onPress={action}
          activeOpacity={0.7}
        >
          <Text style={styles.supportButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SupportScreen: React.FC = () => {
  const supportEmail = 'support@familybook.com';
  const supportPhone = '+91 1800 123 4567';
  const websiteUrl = 'https://familybook.com';
  const faqUrl = 'https://familybook.com/faq';
  const whatsappNumber = '+919876543210';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}?subject=Family Book Support`).catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${supportPhone.replace(/\s/g, '')}`).catch(() => {
      Alert.alert('Error', 'Unable to make a phone call');
    });
  };

  const handleWhatsAppPress = () => {
    const message = 'Hello, I need help with Family Book app.';
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'WhatsApp Not Installed',
        'Please install WhatsApp to contact us via WhatsApp.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleWebsitePress = () => {
    Linking.openURL(websiteUrl).catch(() => {
      Alert.alert('Error', 'Unable to open website');
    });
  };

  const handleFAQsPress = () => {
    Linking.openURL(faqUrl).catch(() => {
      Alert.alert('Error', 'Unable to open FAQs');
    });
  };

  const handleLiveChatPress = () => {
    Alert.alert(
      'Live Chat',
      'Our live chat support hours are 9 AM to 6 PM, Monday to Saturday.',
      [
        {
          text: 'Start Chat',
          onPress: () => Alert.alert('Info', 'Connecting to chat agent...')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const supportItems: SupportItemProps[] = [
    {
      icon: <Mail width={28} height={28} color="#4F46E5" />,
      title: 'Email Support',
      subtitle: 'Get detailed assistance via email',
      action: handleEmailPress,
      actionText: 'Send Email',
    },
    {
      icon: <Phone width={28} height={28} color="#10B981" />,
      title: 'Phone Support',
      subtitle: 'Call us for immediate assistance',
      action: handlePhonePress,
      actionText: 'Call Now',
    },
    {
      icon: <MessageCircle width={28} height={28} color="#25D366" />,
      title: 'WhatsApp',
      subtitle: 'Quick chat support via WhatsApp',
      action: handleWhatsAppPress,
      actionText: 'Message',
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearHeader title='Support Center' subtitle='Were here to help you 24/7' />

          {/* Contact Cards */}
          <View style={styles.cardsContainer}>
            {supportItems.map((item, index) => (
              <SupportItem
                key={index}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                action={item.action}
                actionText={item.actionText}
              />
            ))}
          </View>

          {/* Contact Info Section */}
          <View style={styles.contactInfoContainer}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.contactInfoCard}>
              <View style={styles.contactInfoRow}>
                <Mail width={20} height={20} color="#6B7280" />
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Email Address</Text>
                  <Text style={styles.contactInfoValue}>{supportEmail}</Text>
                </View>
              </View>

              <View style={styles.contactInfoRow}>
                <Phone width={20} height={20} color="#6B7280" />
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Phone Number</Text>
                  <Text style={styles.contactInfoValue}>{supportPhone}</Text>
                </View>
              </View>

              <View style={styles.contactInfoRow}>
                <Clock width={20} height={20} color="#6B7280" />
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Support Hours</Text>
                  <Text style={styles.contactInfoValue}>
                    24/7 Email Support{'\n'}
                    Phone: 9 AM - 6 PM (Mon-Sat)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Info width={20} height={20} color="#6B7280" />
            <Text style={styles.footerNoteText}>
              We typically respond within 24 hours. For urgent matters, please call us.
            </Text>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(22, 22, 22, 0.8)',
    textAlign: 'center',
  },
  cardsContainer: {
    marginBlock: 30,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  supportButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactInfoContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#080808ff',
    marginBottom: 16,
  },
  contactInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  contactInfoContent: {
    flex: 1,
    marginLeft: 16,
  },
  contactInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactInfoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(46, 46, 46, 0.8)',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default SupportScreen;