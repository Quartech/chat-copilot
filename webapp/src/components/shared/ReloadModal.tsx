import React from 'react';
import { Modal } from './Modal';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';

/** ReloadModal component - will reload page when user confirms. Triggered by reducer that is populated on SignalR events. */
export const ReloadModal: React.FC = () => {
    const { reloadDialog } = useAppSelector((state: RootState) => state.app);

    return (
        !!reloadDialog && (
            <Modal
                open={!!reloadDialog}
                onConfirm={() => {
                    window.location.reload();
                }}
                text={reloadDialog.text}
            />
        )
    );
};
