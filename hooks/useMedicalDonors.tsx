import React, { useEffect, useState } from 'react'
import { makeApiCall } from '../utils/http-helper';
import { MedicalDonor } from '../types/medicaldonor.types';

const useMedicalDonors = () => {

    const [donors, setDonors] = useState<MedicalDonor[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchMedicalDonors() {
        setLoading(true)
        try {
            const params = {
                type: 'medical_donor'
            }

            const response = await makeApiCall('', params);

            setDonors(response.DATA);

        } catch (error) {
            console.log("Something went wrong", error);
            throw error;
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedicalDonors();
    }, [])

    return {
        donors,
        loading,
        error
    }
}

export default useMedicalDonors