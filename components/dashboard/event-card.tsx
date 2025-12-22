// EventCard.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MessageCircle } from 'react-native-feather';
import { Event } from '../../types/dashboard.types';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const Icon = event.icon;

    const handleSendWishes = () => {
        Alert.alert(
            `Send ${event.type === 'birthday' ? 'Birthday Wishes' : 'Anniversary Greetings'}`,
            `Would you like to send ${event.type === 'birthday' ? 'birthday wishes' : 'anniversary greetings'} to ${event.title}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send', onPress: () => Alert.alert('Sent!', 'Your message has been sent.') }
            ]
        );
    };

    return (
        <LinearGradient
            colors={event.gradient}
            style={styles.eventCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.eventHeader}>
                <View style={styles.eventIconContainer}>
                    <Icon stroke="#FFFFFF" width={24} height={24} />
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                <TouchableOpacity
                    style={styles.eventIconButton}
                    onPress={handleSendWishes}
                >
                    <MessageCircle stroke="#FFFFFF" width={20} height={20} />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    eventCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    eventIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});

export default EventCard;