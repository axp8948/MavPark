import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';

const NotificationContext = createContext(null);

const MAX_NOTIFICATIONS = 20;
const STORAGE_KEY = 'mavpark-notificationsEnabled';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unavailable';
    return Notification.permission;
  });

  const prevSpotsRef = useRef(null);

  const { parkingData } = useWebSocket({ autoConnect: true, autoSubscribe: true });

  const setNotificationsEnabled = useCallback((enabled) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setBrowserPermission('unavailable');
      return 'unavailable';
    }
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
    return result;
  }, []);

  const addNotification = useCallback((message, lotName, spotsFreed) => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      lotName,
      spotsFreed,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    return notification;
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!parkingData?.spots || !notificationsEnabled) {
      if (parkingData?.spots) {
        prevSpotsRef.current = parkingData.spots;
      }
      return;
    }

    const prevSpots = prevSpotsRef.current;
    prevSpotsRef.current = parkingData.spots;

    if (!prevSpots) return;

    const prevMap = new Map(prevSpots.map((s) => [s.spotId, s.status]));
    const newlyFreed = parkingData.spots.filter(
      (s) => s.status === 'free' && prevMap.get(s.spotId) !== 'free'
    );

    if (newlyFreed.length === 0) return;

    const lotName = parkingData.parkingLotName || 'Parking Lot';
    const count = newlyFreed.length;
    const message = count === 1
      ? `1 spot just opened in ${lotName}`
      : `${count} spots just opened in ${lotName}`;

    addNotification(message, lotName, count);

    toast.success(message, {
      duration: 4000,
      position: 'top-left',
      icon: '🅿️',
      style: { fontWeight: 500 },
    });

    if (
      browserPermission === 'granted' &&
      document.hidden
    ) {
      try {
        new Notification('MavPark', {
          body: message,
          icon: '/mavpark-icon.png',
          tag: 'mavpark-spot-update',
        });
      } catch {
        // Notification API may fail in some environments
      }
    }
  }, [parkingData, notificationsEnabled, browserPermission, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    notificationsEnabled,
    setNotificationsEnabled,
    browserPermission,
    requestBrowserPermission,
    markRead,
    markAllRead,
    clearAll,
  }), [
    notifications,
    unreadCount,
    notificationsEnabled,
    setNotificationsEnabled,
    browserPermission,
    requestBrowserPermission,
    markRead,
    markAllRead,
    clearAll,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
