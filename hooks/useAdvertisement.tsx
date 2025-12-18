import { useEffect, useState } from 'react'
import { makeApiCall } from '../utils/http-helper';
import { Advertisement } from '../types/dashboard.types';

const useAdvertisement = () => {
    const [loading, setLoading] = useState(false);
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function fetchAdvertisements() {
        try {
            const params = {
                type: 'advertise',
            }

            setLoading(true);
            setError(null);
            const response = await makeApiCall('', params);
            console.log("📢 Advertisements fetched:", response);

            // Check if response has DATA array
            if (!response.DATA || !Array.isArray(response.DATA) || response.DATA.length === 0) {
                console.log('⚠️ No advertisements found or invalid response');
                setAdvertisements([]);
                setLoading(false);
                return;
            }

            // Filter out status messages and get actual advertisements
            const adItems = response.DATA.filter(
                (item: Advertisement) => item.image
            );
            
            setAdvertisements(adItems);
            console.log(`✅ Loaded ${adItems.length} advertisements`);
            setLoading(false);
        } catch (err: any) {
            console.error("❌ Error fetching advertisements:", err);
            setError(err.message || 'Failed to fetch advertisements');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAdvertisements();
    }, [])

    return {
        loading,
        advertisements,
        error,
        refetch: fetchAdvertisements,
    }
}

export default useAdvertisement