import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, X, CheckCheck, Trash2, BellOff, Smartphone, Check } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../context/ThemeContext';

function formatRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [smsNumber, setSmsNumber] = useState(() =>
    localStorage.getItem('mavpark-smsNumber') || ''
  );
  const [smsInput, setSmsInput] = useState('');
  const [smsError, setSmsError] = useState('');
  const isSmsSubscribed = smsNumber.length > 0;

  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const { isDarkMode } = useTheme();

  const {
    notifications,
    unreadCount,
    notificationsEnabled,
    setNotificationsEnabled,
    browserPermission,
    requestBrowserPermission,
    markRead,
    markAllRead,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  const handleEnableBrowser = async () => {
    await requestBrowserPermission();
  };

  const handleSmsSave = () => {
    const digits = smsInput.replace(/\D/g, '');
    if (digits.length !== 10) {
      setSmsError('Please enter a valid 10-digit phone number');
      return;
    }
    setSmsError('');
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    localStorage.setItem('mavpark-smsNumber', formatted);
    setSmsNumber(formatted);
    setSmsInput('');
  };

  const handleSmsRemove = () => {
    localStorage.removeItem('mavpark-smsNumber');
    setSmsNumber('');
    setSmsInput('');
    setSmsError('');
  };

  const BellIcon = unreadCount > 0 ? BellRing : Bell;

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        ref={buttonRef}
        onClick={handleToggle}
        className={`relative p-3 rounded-full shadow-xl backdrop-blur-md border transition-all ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700/50 text-gray-300 hover:bg-gray-700/80'
            : 'bg-white/90 border-gray-200/50 text-gray-700 hover:bg-gray-50'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 mt-2 w-96 sm:w-[28rem] rounded-xl shadow-2xl border overflow-hidden z-50 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <h3
                className={`text-base font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings Row */}
            <div
              className={`flex items-center justify-between px-5 py-3 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-blue-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Spot alerts
                </span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  notificationsEnabled
                    ? 'bg-blue-500'
                    : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                }`}
                role="switch"
                aria-checked={notificationsEnabled}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${
                    notificationsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Text alerts section */}
            <div
              className={`px-5 py-3 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Smartphone className={`w-5 h-5 ${isSmsSubscribed ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Text alerts
                </span>
              </div>
              {isSmsSubscribed ? (
                <div className="flex items-center justify-between ml-7.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {smsNumber}
                    </span>
                    <span className="text-xs text-green-500 font-medium">Subscribed</span>
                  </div>
                  <button
                    onClick={handleSmsRemove}
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="ml-7.5">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={smsInput}
                      onChange={(e) => { setSmsInput(e.target.value); setSmsError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSmsSave(); }}
                      placeholder="(555) 123-4567"
                      className={`flex-1 text-sm px-3 py-1.5 rounded-lg border outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500'
                      } ${smsError ? (isDarkMode ? 'border-red-500' : 'border-red-400') : ''}`}
                    />
                    <button
                      onClick={handleSmsSave}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                  {smsError && (
                    <p className="text-xs text-red-500 mt-1">{smsError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Browser permission banner */}
            {notificationsEnabled &&
              browserPermission !== 'granted' &&
              browserPermission !== 'unavailable' && (
                <div
                  className={`px-4 py-2.5 border-b ${
                    isDarkMode
                      ? 'border-gray-700 bg-blue-900/20'
                      : 'border-gray-100 bg-blue-50'
                  }`}
                >
                  <button
                    onClick={handleEnableBrowser}
                    className="w-full text-xs font-medium text-blue-500 hover:text-blue-600 text-left"
                  >
                    {browserPermission === 'denied'
                      ? 'Browser alerts blocked — update in browser settings'
                      : 'Enable browser alerts for background updates'}
                  </button>
                </div>
              )}

            {/* Notification List */}
            <div className="max-h-[26rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Bell
                    className={`w-10 h-10 mx-auto mb-3 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  />
                  <p
                    className={`text-base ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    No notifications yet
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    You'll be notified when spots open up
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const itemBg = notif.read
                    ? (isDarkMode ? 'bg-gray-800' : 'bg-white')
                    : (isDarkMode ? 'bg-gray-750/50' : 'bg-blue-50/40');
                  const borderColor = isDarkMode ? 'border-gray-700/50' : 'border-gray-50';
                  const hoverBg = isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
                  return (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => markRead(notif.id)}
                      className={`w-full text-left px-5 py-4 border-b last:border-b-0 cursor-pointer transition-colors ${borderColor} ${itemBg} ${hoverBg}`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-green-900/40' : 'bg-green-100'
                          }`}
                        >
                          <span className="text-base">🅿️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-base ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            } ${notif.read ? 'font-normal' : 'font-medium'}`}
                          >
                            {notif.message}
                          </p>
                          <p
                            className={`text-sm mt-1 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          >
                            {formatRelativeTime(notif.timestamp)}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="mt-2.5 flex-shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with mark all read */}
            {notifications.some((n) => !n.read) && (
              <div
                className={`px-5 py-3 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <button
                  onClick={markAllRead}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    isDarkMode
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-500 hover:text-blue-600'
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
