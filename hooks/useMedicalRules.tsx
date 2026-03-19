import { useEffect, useState } from 'react';
import { makeApiCall } from '../utils/http-helper';

// Define the type for a medical rule
export interface MedicalRule {
    id: string;
    rule_gujarati: string;
    rule_english: string;
    display_order: string;
    status: 'Active' | 'Inactive';
}

// Define the API response structure
export interface MedicalRulesResponse {
    DATA: [
        {
            result: 'success' | 'fail';
            msg: string;
            data: MedicalRule[];
            total_records: number;
        }
    ];
}

// Define the return type for the hook
export interface UseMedicalRulesReturn {
    loading: boolean;
    rules: MedicalRule[];
    error: string;
    refetch: () => Promise<void>;
}

const useMedicalRules = (autoFetch: boolean = true): UseMedicalRulesReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [rules, setRules] = useState<MedicalRule[]>([]);
    const [error, setError] = useState<string>('');

    async function fetchMedicalRules() {
        setLoading(true);
        setError('');
        
        try {
            const params = {
                type: "medical_rules_list" 
            };

            const response = await makeApiCall('', params) as MedicalRulesResponse;
            console.log("Fetched medical rules response:", response);

            // Check if response has the expected structure
            if (!response.DATA || !Array.isArray(response.DATA)) {
                console.log("No medical rules found or invalid data format");
                setRules([]);
                return;
            }

            const firstItem = response.DATA[0];

            // Check if the API returned success and has data array
            if (firstItem.result === 'success' && Array.isArray(firstItem.data)) {
                // Sort by display_order if needed (API might already do this)
                const sortedRules = [...firstItem.data].sort((a, b) => {
                    return parseInt(a.display_order) - parseInt(b.display_order);
                });
                setRules(sortedRules);
            } else {
                setError(firstItem.msg || 'Failed to fetch medical rules');
                setRules([]);
            }

        } catch (error: any) {
            console.log('Something went wrong in fetching medical rules', error);
            setError(error.message || 'Failed to fetch medical rules. Please check your connection.');
            setRules([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (autoFetch) {
            fetchMedicalRules();
        }
    }, [autoFetch]);

    const refetch = async (): Promise<void> => {
        await fetchMedicalRules();
    };

    return {
        loading,
        rules,
        error,
        refetch
    };
};

export default useMedicalRules;