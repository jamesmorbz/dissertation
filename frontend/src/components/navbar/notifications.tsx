import { Bell } from 'lucide-react';
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Notification } from '@/types/notification';

interface NotificationsProps {
  notifications: Notification[];
}

const Notifications: React.FC<NotificationsProps> = (notifications) => {
  const unreadCount = notifications.notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    notifications.notifications = notifications.notifications.map((n) => ({
      ...n,
      read: true,
    }));
  };

  return (
    <Popover>
      <PopoverTrigger className="relative p-3">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Notifications</h4>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Mark all as read
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-2 rounded-lg ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { Notifications };
