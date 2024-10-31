import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface } from '@fluentui/react-components';
import React from 'react';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';

export const Modal: React.FC = () => {
    const { dialog } = useAppSelector((state: RootState) => state.app);
    return (
        !!dialog && (
            <Dialog open>
                <DialogSurface>
                    <DialogBody>
                        <DialogContent>{dialog.text}</DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    if (dialog.reloadOnConfirm) {
                                        window.location.reload();
                                    } else if (dialog.onConfirm) {
                                        dialog.onConfirm();
                                    }
                                }}
                                appearance="primary"
                            >
                                Ok
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        )
    );
};
