import React from 'react'
import { AppThemeGradient } from '../../config/config'
import { ArrowLeft, Edit2 } from 'react-native-feather'
import LinearGradient from 'react-native-linear-gradient'
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const LinearHeader = ({ title, subtitle, isProfile }: { title: string, subtitle: string, isProfile?: boolean }) => {
    const navigation = useNavigation();
    return (
        <LinearGradient
            colors={AppThemeGradient}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }
            }
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft stroke="#303030ff" width={24} height={24} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>{subtitle}</Text>
                </View>

                {/* {isProfile && <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => console.log('Edit profile')}
                >
                    <Edit2 stroke="#222222" width={20} height={20} />
                </TouchableOpacity>} */}
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    gradientHeader: {
        paddingTop: Platform.OS === 'ios' ? 20 : 24,
        paddingHorizontal: 20,
        paddingBottom: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000ff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(36, 36, 36, 0.9)',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Space for logout button
    }
});


export default LinearHeader