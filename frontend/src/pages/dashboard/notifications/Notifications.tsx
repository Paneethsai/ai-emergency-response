import { useEffect, useState } from 'react';
import { Bell, Check, Loader2, AlertTriangle, ShieldCheck, BellOff, RefreshCw } from 'lucide-react';
import api from '../../../services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch {
      setError('Failed to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => api.put(`/notifications/${n._id}/read`)));
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch {
      console.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-gray-400 text-sm font-semibold">Fetching notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.35)]">
              <Bell size={24} className="text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
              Notifications
            </h1>
            <p className="text-gray-400 text-sm">{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="px-4 py-2 text-xs font-black text-blue-400 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl transition-all flex items-center gap-1.5"
            >
              {markingAll ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Mark all read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2.5 text-gray-400 border border-white/5 bg-white/2 hover:bg-white/5 rounded-xl transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-semibold">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border border-white/5 text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-green-400" size={32} />
          </div>
          <p className="text-white font-bold text-lg">All Clear!</p>
          <p className="text-gray-400 text-sm mt-1">You have no notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                notification.isRead
                  ? 'glass-card border-white/5 opacity-60'
                  : 'glass-card border-blue-500/25 shadow-[0_0_20px_rgba(59,130,246,0.08)]'
              }`}
            >
              <div className={`p-3 rounded-xl mt-0.5 shrink-0 ${
                notification.isRead ? 'bg-white/5 text-gray-500' : 'bg-blue-500/15 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
              }`}>
                {notification.isRead ? <BellOff size={18} /> : <Bell size={18} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className={`font-extrabold text-base leading-snug ${notification.isRead ? 'text-gray-400' : 'text-white'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold shrink-0">
                    {new Date(notification.createdAt).toLocaleDateString()} · {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className={`text-sm leading-relaxed font-medium ${notification.isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                  {notification.message}
                </p>

                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-black flex items-center gap-1.5 transition-colors"
                  >
                    <Check size={12} />
                    Mark as read
                  </button>
                )}
              </div>

              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
