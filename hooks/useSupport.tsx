import { useEffect, useState } from "react";
import { makeApiCall } from '../utils/http-helper';
import { SupportProps } from '../types/support.types'

const useSupport = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [supportData, setSupportData] = useState<SupportProps[]>([]);

    const fetchSupportData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                type: 'support'
            }

            const response = await makeApiCall('', params);

            setSupportData(response.DATA);
        } catch (err) {
            console.log('Error fetching support data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupportData();
    }, [])

    return {
        loading,
        error,
        supportData
    }
}

export default useSupport;