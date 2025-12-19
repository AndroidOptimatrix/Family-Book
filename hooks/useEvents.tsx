import { useEffect, useState } from 'react'
import { makeApiCall } from '../utils/http-helper';
import { Event, EventData } from '../types/event.types';

const useEvents = () => {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState('');

    async function fetchEvents() {
        setLoading(true);
        try {
            const params = {
                type: "event_list"
            }

            const response = await makeApiCall('', params) as EventData;

            if (!response.DATA || !Array.isArray(response.DATA)) {
                console.log("no events found or invalid data format");
                setEvents([]);
                return;
            }

            setEvents(response.DATA);
        } catch (error: any) {
            console.log('something went wrong in fetching events', error);
            setError(error.message || 'Failed to fetch events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvents();
    }, [])

    const refetch = () => {
        fetchEvents();
    }

    return {
        loading,
        events,
        error,
        refetch
    }
}

export default useEvents