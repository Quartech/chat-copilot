// Copyright (c) Microsoft. All rights reserved.

import {
    Link,
    Toast,
    Toaster,
    ToastIntent,
    ToastTitle,
    ToastTrigger,
    useId,
    useToastController,
} from '@fluentui/react-components';
import { Dismiss12Regular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { AlertType } from '../../libs/models/AlertType';
import { Environment } from '../../libs/services/BaseService';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { removeAlert } from '../../redux/features/app/appSlice';

/**
 * Renders and manages alert notifications for the application.
 * This component ensures that only unique alerts are displayed,
 * filtering out error alerts in production environments and handling
 * the lifecycle of each toast notification.
 *
 * @component
 */
const Alerts = () => {
    const dispatch = useAppDispatch();
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);
    const horizontalOffset = 20;
    const verticalOffset = 48;

    const { alerts } = useAppSelector((state: RootState) => state.app);
    const [activeToasts, setActiveToasts] = useState(new Set<string | undefined>());

    useEffect(() => {
        const filteredAlerts = alerts.filter(
            (a) =>
                (a.type !== AlertType.Error || Environment !== 'production') && // Filter out production errors
                !activeToasts.has(a.id), // Only include alerts that aren't already displayed
        );

        filteredAlerts.forEach((alert) => {
            dispatchToast(
                <Toast key={alert.id}>
                    <ToastTitle
                        action={
                            <ToastTrigger>
                                <Link>
                                    <Dismiss12Regular />
                                </Link>
                            </ToastTrigger>
                        }
                    >
                        {alert.message}
                    </ToastTitle>
                </Toast>,
                {
                    position: 'top-end',
                    intent: alert.type as ToastIntent,
                    onStatusChange: (_e, { status: toastStatus }) => {
                        if (toastStatus === 'dismissed') {
                            // Dispatch action to remove this alert from the store
                            dispatch(removeAlert(alert.id));
                            // Remove this toast's ID from the active toasts set
                            setActiveToasts((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(alert.id);
                                return newSet;
                            });
                        }
                    },
                },
            );
            // Add this toast's ID to the active toasts set
            setActiveToasts((prev) => new Set([...prev, alert.id]));
        });
    }, [alerts, dispatch, dispatchToast, activeToasts]);

    return <Toaster toasterId={toasterId} offset={{ horizontal: horizontalOffset, vertical: verticalOffset }} />;
};

export default Alerts;
