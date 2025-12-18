import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/auth-context';
import { makeApiCall } from '../utils/http-helper';
import { Notification } from '../types/notification.types';

const useNotifications = () => {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const { userInfo } = useAuth();
    const LIMIT = 5; // Number of notifications per page

    const fetchNotifications = useCallback(async (pageNum: number = 1, isRefreshing: boolean = false) => {
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

            // Set loading states
            if (pageNum === 1) {
                if (isRefreshing) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }
            } else {
                setLoadingMore(true);
            }

            setError(null);
            
            const params = {
                type: 'notification_list',
                user_id: userId.toString(),
                page: pageNum.toString(),
                limit: LIMIT.toString(),
            };

            const response = await makeApiCall('', params);
            console.log("📬 Notifications fetched:", response);

            // Check if response has DATA array
            if (!response.DATA || !Array.isArray(response.DATA) || response.DATA.length === 0) {
                console.log('⚠️ No notifications found or invalid response');
                
                if (pageNum === 1) {
                    setNotifications([]);
                }
                setHasMore(false);
                
                // Reset loading states
                setLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
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

                // Check if we got less than limit, meaning no more data
                if (notificationItems.length < LIMIT) {
                    setHasMore(false);
                }

                // Update total count if available from API
                if (firstItem.total_count) {
                    setTotalNotifications(parseInt(firstItem.total_count));
                }

                if (pageNum === 1) {
                    // First page - replace all notifications
                    setNotifications(notificationItems);
                    console.log(`✅ Loaded ${notificationItems.length} notifications`);
                } else {
                    // Subsequent pages - append to existing notifications
                    setNotifications(prev => [...prev, ...notificationItems]);
                    console.log(`➕ Loaded ${notificationItems.length} more notifications`);
                }

                // Increment page for next load
                if (hasMore && notificationItems.length === LIMIT) {
                    setPage(prev => prev + 1);
                }
            } else {
                throw new Error(firstItem.msg || 'Failed to fetch notifications');
            }

            // Reset loading states
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        } catch (err: any) {
            console.error("❌ Error in fetching notifications:", err);
            setError(err.message || 'Failed to fetch notifications');
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [userInfo?.user_id, userInfo?.id, LIMIT, hasMore]);

    // Initial fetch on mount
    useEffect(() => {
        if (userInfo?.user_id || userInfo?.id) {
            setPage(1); // Reset to first page
            setHasMore(true); // Reset hasMore flag
            fetchNotifications(1);
        }
    }, [userInfo?.user_id, userInfo?.id]);

    // Load more notifications
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            fetchNotifications(page);
        }
    }, [loading, loadingMore, hasMore, page, fetchNotifications]);

    // Refresh notifications
    const refresh = useCallback(async () => {
        setPage(1);
        setHasMore(true);
        setError(null);
        await fetchNotifications(1, true);
    }, [fetchNotifications]);

    // Reset pagination
    const resetPagination = useCallback(() => {
        setPage(1);
        setHasMore(true);
        setNotifications([]);
    }, []);

    return {
        loading,
        loadingMore,
        notifications,
        error,
        hasMore,
        totalNotifications,
        refreshing,
        refetch: refresh, // For backward compatibility
        loadMore,
        refresh,
        resetPagination,
        currentPage: page,
    }
}

export default useNotifications