import React from 'react';
import { Modal } from './Modal';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';

/** ReloadModal component - will reload page when user confirms. */
export const ReloadModal: React.FC = () => {
    const { dialog } = useAppSelector((state: RootState) => state.app);

    return (
        !!dialog && (
            <Modal
                open={!!dialog}
                onConfirm={() => {
                    window.location.reload();
                }}
                text={dialog.text}
            />
        )
    );
};
