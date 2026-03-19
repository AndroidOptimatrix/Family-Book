import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Text,
    Alert,
    Linking,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import LinearHeader from '../components/common/header';
import { 
    CheckCircle, 
    FileText, 
    Info,
    Phone,
    PlusCircle,
    AlertCircle
} from 'react-native-feather';
import useMedicalRules from '../hooks/useMedicalRules';

const MedicalHelpScreen = () => {
    const { loading, rules, error } = useMedicalRules(true);

    const openFormInBrowser = async () => {
        const url = 'https://www.project.optiinfo.com/familybook/medical-help.html';

        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Failed to open URL:', error);
            Alert.alert('Error', 'Unable to open the form. Please try again later.');
        }
    };

    const renderRules = () => {
        if (loading) {
            return (
                <View style={styles.rulesLoadingContainer}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                    <Text style={styles.rulesLoadingText}>Loading guidelines...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.rulesErrorContainer}>
                    <AlertCircle width={20} height={20} stroke="#EF4444" strokeWidth={1.5} />
                    <Text style={styles.rulesErrorText}>Unable to load guidelines</Text>
                </View>
            );
        }

        if (rules.length === 0) {
            return null;
        }

        return (
            <View style={styles.rulesContainer}>
                <Text style={styles.rulesTitle}>માર્ગદર્શિકા / Guidelines:</Text>
                {rules.map((rule, index) => (
                    <View key={rule.id} style={styles.ruleItem}>
                        <View style={styles.ruleBullet}>
                            <Text style={styles.ruleNumber}>{index + 1}</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleGujarati}>{rule.rule_gujarati}</Text>
                            <Text style={styles.ruleEnglish}>{rule.rule_english}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearHeader 
                    title='તબીબી સહાય ફોર્મ' 
                    subtitle='Medical Request Form' 
                />

                {/* Info Cards Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <PlusCircle width={32} height={32} stroke="#4F46E5" strokeWidth={1.5} />
                        <Text style={styles.infoCardTitle}>Medical Assistance</Text>
                        <Text style={styles.infoCardText}>
                            Apply for financial help with medical treatments
                        </Text>
                    </View>

                    <View style={styles.infoCard}>
                        <CheckCircle width={32} height={32} stroke="#10B981" strokeWidth={1.5} />
                        <Text style={styles.infoCardTitle}>Quick Processing</Text>
                        <Text style={styles.infoCardText}>
                            Your request will be reviewed by our team
                        </Text>
                    </View>
                </View>

                {/* Rules Section */}
                {renderRules()}

                {/* Main Content */}
                <View style={styles.content}>

                    {/* Action Button */}
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={openFormInBrowser}
                        activeOpacity={0.8}
                    >
                        <FileText width={24} height={24} stroke="#FFFFFF" strokeWidth={1.5} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Apply for Medical Help</Text>
                    </TouchableOpacity>

                    {/* Note */}
                    <View style={styles.noteContainer}>
                        <Info width={20} height={20} stroke="#6B7280" strokeWidth={1.5} />
                        <Text style={styles.note}>
                            The form will open in your browser with complete validation
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    infoSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    infoCardText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 16,
    },
    // Rules styles
    rulesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    rulesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    ruleItem: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    ruleBullet: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ruleNumber: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    ruleContent: {
        flex: 1,
    },
    ruleGujarati: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    ruleEnglish: {
        fontSize: 13,
        color: '#6B7280',
    },
    rulesLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    rulesLoadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    rulesErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        padding: 12,
    },
    rulesErrorText: {
        fontSize: 14,
        color: '#EF4444',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    button: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    note: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        flex: 1,
    },
});

export default MedicalHelpScreen;