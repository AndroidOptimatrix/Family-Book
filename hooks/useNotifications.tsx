// hooks/useNotifications.ts
import { useEffect, useState, useCallback, useRef } from 'react'
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
    const LIMIT = 3; // Fetch 3 notifications at a time
    const isMounted = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchNotifications = useCallback(async (pageNum: number = 1, isRefreshing: boolean = false) => {
        // Prevent multiple calls if already loading
        if ((loading || loadingMore || refreshing) && pageNum === page) {
            return;
        }

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
                type: 'notification_list_pagination',
                user_id: userId.toString(),
                page: pageNum.toString(),
                limit: LIMIT.toString(),
            };

            const response = await makeApiCall('', params);
            console.log(`📬 Notifications fetched - Page: ${pageNum}, Count: ${response.DATA?.length || 0}`);

            if (!isMounted.current) return;

            // Check if response has DATA array
            if (!response.DATA || !Array.isArray(response.DATA)) {
                if (pageNum === 1) {
                    setNotifications([]);
                }
                setHasMore(false);
                return;
            }

            // The entire DATA array contains notifications
            const notificationItems = response.DATA;

            // Check if we got any notifications
            if (notificationItems.length === 0) {
                if (pageNum === 1) {
                    setNotifications([]);
                }
                setHasMore(false);
            } else {
                // Check if we got less than limit, meaning no more data
                if (notificationItems.length < LIMIT) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (pageNum === 1) {
                    // First page - replace all notifications
                    setNotifications(notificationItems);
                    setPage(2); // Set next page to 2
                } else {
                    // Append to existing notifications (avoid duplicates)
                    setNotifications(prev => {
                        // Create a map of existing notification IDs for quick lookup
                        const existingIds = new Set(prev.map(n => n.id.toString()));
                        // Filter out duplicates from new items
                        const newItems = notificationItems.filter(item => 
                            !existingIds.has(item.id.toString())
                        );
                        return [...prev, ...newItems];
                    });
                    setPage(prev => prev + 1); // Increment page for next load
                }

                // Update total count if available from API
                if (notificationItems[0]?.total_count) {
                    setTotalNotifications(parseInt(notificationItems[0].total_count));
                }
            }

        } catch (err: any) {
            console.error("❌ Error in fetching notifications:", err);
            if (isMounted.current) {
                setError(err.message || 'Failed to fetch notifications');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        }
    }, [userInfo?.user_id, userInfo?.id]);

    // Initial fetch on mount
    useEffect(() => {
        if (userInfo?.user_id || userInfo?.id) {
            setPage(1);
            setHasMore(true);
            setNotifications([]);
            fetchNotifications(1);
        }
    }, [userInfo?.user_id, userInfo?.id]);

    // Load more notifications
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchNotifications(page);
        }
    }, [loadingMore, hasMore, loading, page, fetchNotifications]);

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

    // --- Notification Action ---
    const toggleLike = async (notificationId: string) => {
        const userId = userInfo?.user_id || userInfo?.id;

        if (!userId) {
            console.log('⚠️ No user ID available for toggling like');
            return;
        }

        try {
            const params = {
                'type': 'notification_like',
                'user_id': userId.toString(),
                'id': notificationId,
            }
            const response = await makeApiCall('', params);
            console.log("Like toggled:", response);

            // Update local state after successful like toggle
            if (response.DATA && response.DATA[0]?.result === 'success') {
                setNotifications(prev => prev.map(notification => {
                    if (notification.id.toString() === notificationId) {
                        const newLiked = notification.user_reacted === 'Yes' ? 'No' : 'Yes';
                        const currentCount = parseInt(notification.total_reaction) || 0;
                        const newCount = newLiked === 'Yes' ? currentCount + 1 : Math.max(0, currentCount - 1);
                        
                        return {
                            ...notification,
                            user_reacted: newLiked,
                            total_reaction: newCount.toString()
                        };
                    }
                    return notification;
                }));
            }

        } catch (err) {
            console.error("Error toggling like:", err);
        }
    }

    return {
        loading,
        loadingMore,
        notifications,
        error,
        hasMore,
        totalNotifications,
        refreshing,
        refetch: refresh,
        loadMore,
        refresh,
        resetPagination,
        currentPage: page,
        toggleLike
    }
}

export default useNotifications