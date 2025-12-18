import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface HeaderProps {
    otpSent: boolean;
}

const Header: React.FC<HeaderProps> = ({ otpSent }) => {
    return (
        <View style={styles.headerContainer}>
            <Image
                source={require('../../vertical-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
            />

            <Text style={styles.subtitle}>
                {otpSent ? 'Enter 4-digit OTP to continue' : 'Login with your WhatsApp number'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    logoImage: {
        width: 190,
        height: 180,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        maxWidth: '80%',
        lineHeight: 22,
    },
});

export default Header;