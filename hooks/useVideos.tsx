import { useEffect, useState } from 'react'
import { makeApiCall } from '../utils/http-helper';
import { Video, VideoResponse } from '../types/video.types';

const useVideos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('')
    const [videos, setVideos] = useState<Video[]>([]);

    async function fetchVideos() {
        setLoading(true)
        try {
            const payload = {
                type: 'videos'
            }

            const response = await makeApiCall('', payload);

            console.log('Video API Response:', response); 

            if (!response.DATA || !Array.isArray(response.DATA)) {
                console.log("Invalid response format");
                setVideos([]);
                return;
            }

            const videoResponse = response as VideoResponse;
            if (videoResponse.DATA.length > 0 && videoResponse.DATA[0].videos) {
                setVideos(videoResponse.DATA[0].videos);
            } else {
                console.log("No videos found in response");
                setVideos([]);
            }

        } catch (error: any) {
            console.log("something went wrong in fetching videos", error);
            setError(error.message || 'Failed to fetch videos');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchVideos();
    }

    useEffect(() => {
        fetchVideos()
    }, [])

    return {
        videos,
        error,
        loading,
        refetch
    }
}

export default useVideos