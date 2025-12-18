import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth-context';
import { makeApiCall } from '../utils/http-helper';
import { Notification } from '../types/notification.types';

const useNotifications = () => {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { userInfo } = useAuth();

    async function fetchNotifications() {
        try {
            if (!userInfo?.id && !userInfo?.user_id) {
                console.log('⚠️ No user ID available for fetching notifications');
                return;
            }

            const userId = userInfo?.user_id || userInfo?.id;
            if (!userId) {
                console.log('⚠️ No user ID available for fetching notifications');
                return;
            }

            const params = {
                type: 'notification_list',
                user_id: userId.toString(),
            };

            setLoading(true);
            setError(null);
            const response = await makeApiCall('', params);
            console.log("📬 Notifications fetched:", response);

            // Check if response has DATA array
            if (!response.DATA || !Array.isArray(response.DATA) || response.DATA.length === 0) {
                console.log('⚠️ No notifications found or invalid response');
                setNotifications([]);
                setLoading(false);
                return;
            }

            // Check if first item has success result
            const firstItem = response.DATA[0];
            if (firstItem.result === 'success') {
                // Filter out the first item if it's just a status message
                // Otherwise, use all items as notifications
                const notificationItems = response.DATA.filter(
                    (item: Notification) => item.id && item.title
                );
                setNotifications(notificationItems);
                console.log(`✅ Loaded ${notificationItems.length} notifications`);
            } else {
                throw new Error(firstItem.msg || 'Failed to fetch notifications');
            }

            setLoading(false);
        } catch (err: any) {
            console.error("❌ Error in fetching notifications:", err);
            setError(err.message || 'Failed to fetch notifications');
            setLoading(false);
        }
    }

    useEffect(() => {
        const userId = userInfo?.user_id || userInfo?.id;
        if (userId) {
            fetchNotifications();
        }
    }, [userInfo?.user_id, userInfo?.id])

    return {
        loading,
        notifications,
        error,
        refetch: fetchNotifications,
    }
}

export default useNotifications