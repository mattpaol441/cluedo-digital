// HamburgerWithNotifications: wrapper che integra automaticamente il conteggio notifiche

import React from 'react';
import HamburgerSidebar from './HamburgerSidebar';
import { useNotificationCount } from '../../hooks/useNotificationCount';

interface HamburgerWithNotificationsProps {
    user: { displayName: string; avatar?: string; isOnline: boolean };
}

const HamburgerWithNotifications: React.FC<HamburgerWithNotificationsProps> = ({ user }) => {
    const { totalCount } = useNotificationCount();

    return (
        <HamburgerSidebar
            user={user}
            notificationCount={totalCount}
        />
    );
};

export default HamburgerWithNotifications;
