import { useEffect, useState } from 'react'
import { SocialMedia } from '../types/social.types';
import { makeApiCall } from '../utils/http-helper';

const useSocialMedia = () => {
    const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    async function fetchSocailMedia() {
        try {
            const params = {
                type: 'social_platforms'
            }

            const response = await makeApiCall('', params);

            setSocialMedia(response.DATA);
        } catch (error) {
            console.log("Somethign went wrong", error);
            throw error;
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSocailMedia();
    }, [])

    return {
        socialMedia,
        loading
    }
}

export default useSocialMedia