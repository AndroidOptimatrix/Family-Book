import React, { useEffect, useState } from 'react'
import { makeApiCall } from '../utils/http-helper';
import { MedicalHelpRequest, MedicalHelpResponse } from '../types/medical_help.types';
import { ApiResponse } from '../types/api.types';

// Base URL from your config
const API_BASE_URL = 'https://www.demo.optiinfo.com/project/saraswatshakti/WebServices/WS.php';

// Form Data Creator Function
export function createMedicalHelpFormData(data: MedicalHelpRequest): FormData {
    const formData = new FormData();

    // Add case parameter
    formData.append('case', 'medical_help_need');

    // Personal Information
    if (data.patient_full_name) formData.append('patient_full_name', data.patient_full_name);
    if (data.patient_nukh) formData.append('patient_nukh', data.patient_nukh);
    if (data.patient_age) formData.append('patient_age', String(data.patient_age));
    if (data.paternal_side) formData.append('paternal_side', data.paternal_side);
    if (data.maternal_side) formData.append('maternal_side', data.maternal_side);
    if (data.inlaws_side) formData.append('inlaws_side', data.inlaws_side);
    if (data.native_place) formData.append('native_place', data.native_place);
    if (data.current_city) formData.append('current_city', data.current_city);
    if (data.occupation) formData.append('occupation', data.occupation);

    // Medical Information
    if (data.disease_name) formData.append('disease_name', data.disease_name);
    if (data.sickness_duration) formData.append('sickness_duration', data.sickness_duration);
    if (data.hospital_name) formData.append('hospital_name', data.hospital_name);
    if (data.hospital_address) formData.append('hospital_address', data.hospital_address);
    if (data.estimated_cost) formData.append('estimated_cost', String(data.estimated_cost));
    if (data.financial_arrangements) formData.append('financial_arrangements', data.financial_arrangements);

    // Insurance Information
    if (data.has_mediclaim !== undefined) formData.append('has_mediclaim', String(data.has_mediclaim ? 1 : 0));
    if (data.mediclaim_details) formData.append('mediclaim_details', data.mediclaim_details);
    if (data.has_ayushman_card !== undefined) formData.append('has_ayushman_card', String(data.has_ayushman_card ? 1 : 0));
    if (data.ayushman_card_number) formData.append('ayushman_card_number', data.ayushman_card_number);

    // Bank Details
    if (data.hospital_bank_name) formData.append('hospital_bank_name', data.hospital_bank_name);
    if (data.hospital_account_number) formData.append('hospital_account_number', data.hospital_account_number);
    if (data.hospital_ifsc_code) formData.append('hospital_ifsc_code', data.hospital_ifsc_code);
    if (data.hospital_branch) formData.append('hospital_branch', data.hospital_branch);

    // Social Reference
    if (data.social_leader_name) formData.append('social_leader_name', data.social_leader_name);
    if (data.social_leader_contact) formData.append('social_leader_contact', data.social_leader_contact);
    if (data.social_leader_relationship) formData.append('social_leader_relationship', data.social_leader_relationship);

    // Informant Details
    if (data.informant_name) formData.append('informant_name', data.informant_name);
    if (data.informant_relationship) formData.append('informant_relationship', data.informant_relationship);
    if (data.informant_mobile) formData.append('informant_mobile', data.informant_mobile);
    if (data.informant_alternate_mobile) formData.append('informant_alternate_mobile', data.informant_alternate_mobile);

    // System Fields
    if (data.admin_notes) formData.append('admin_notes', data.admin_notes);
    if (data.created_by) formData.append('created_by', data.created_by);

    // File Uploads
    if (data.patient_photo) formData.append('patient_photo', data.patient_photo);
    if (data.quotation_letter) formData.append('quotation_letter', data.quotation_letter);

    return formData;
}

const useMedicalHelp = () => {
    const [medicalHelpList, setMedicalHelpList] = useState<MedicalHelpResponse[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionResult, setSubmissionResult] = useState<MedicalHelpResponse | null>(null);

    // Function to fetch all medical help requests (GET) - USING makeApiCall
    // async function fetchMedicalHelpRequests() {
    //     setLoading(true);
    //     setError(null);
        
    //     try {
    //         const params = {
    //             type: 'medical_help_list' // Adjust this based on your API
    //         };

    //         const response = await makeApiCall('', params);
            
    //         if (response && response.DATA) {
    //             setMedicalHelpList(response.DATA);
    //         } else {
    //             setMedicalHelpList([]);
    //         }

    //     } catch (error) {
    //         console.log("Something went wrong while fetching medical help requests", error);
    //         setError(error instanceof Error ? error.message : 'Failed to fetch medical help requests');
    //         throw error;
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    // Function to submit a new medical help request (POST with FormData) - USING FETCH DIRECTLY
    async function submitMedicalHelpRequest(
        data: MedicalHelpRequest
    ): Promise<MedicalHelpResponse> {
        setLoading(true);
        setError(null);
        
        try {
            const formData = createMedicalHelpFormData(data);

            // USING FETCH DIRECTLY FOR POST REQUEST WITH FORMDATA
            console.log('📤 Submitting medical help request with FormData');
            
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            
            // Parse JSON response
            let result: ApiResponse<MedicalHelpResponse>;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('Response text:', responseText);
                throw new Error('Invalid JSON response from server');
            }
            
            console.log('✅ Submission response:', result);
            
            if (result && result.DATA) {
                setSubmissionResult(result.DATA[0]); // Assuming DATA is an array
                // Optionally refresh the list after successful submission
                await fetchMedicalHelpRequests();
                return result.DATA[0];
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            console.error('Error submitting medical help request:', error);
            setError(error instanceof Error ? error.message : 'Failed to submit medical help request');
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // Function to get a single medical help request by ID - USING makeApiCall
    // async function fetchMedicalHelpById(id: number | string) {
    //     setLoading(true);
    //     setError(null);
        
    //     try {
    //         const params = {
    //             type: 'medical_help_details',
    //             id: String(id)
    //         };

    //         const response = await makeApiCall('', params);
            
    //         if (response && response.DATA && response.DATA.length > 0) {
    //             return response.DATA[0];
    //         } else {
    //             return null;
    //         }

    //     } catch (error) {
    //         console.log("Something went wrong while fetching medical help details", error);
    //         setError(error instanceof Error ? error.message : 'Failed to fetch medical help details');
    //         throw error;
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    // Fetch medical help requests on component mount
    useEffect(() => {
        fetchMedicalHelpRequests();
    }, []);

    return {
        medicalHelpList,
        loading,
        error,
        submissionResult,
        submitMedicalHelpRequest,
        // fetchMedicalHelpRequests,
        // fetchMedicalHelpById,
        // refetch: fetchMedicalHelpRequests
    };
}

export default useMedicalHelp;