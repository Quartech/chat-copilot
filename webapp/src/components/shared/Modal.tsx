import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface } from '@fluentui/react-components';
import React from 'react';

export interface IModalProps {
    open: boolean;
    text: string;
    onConfirm?: () => void;
    onClose?: () => void;
}

/**
 * Base Modal component
 * @param {boolean} open - Boolean value to show/hide modal.
 * @param {string} text - Text to be displayed in modal.
 * @param {function} onConfirm - Callback function to be called on confirm button click.
 * @param {function} onClose - Callback function to be called on close button click.
 * @returns {JSX.Element} Modal component.
 */
export const Modal: React.FC<IModalProps> = ({ open, text, onConfirm, onClose }) => {
    return (
        <Dialog open={open}>
            <DialogSurface>
                <DialogBody>
                    <DialogContent>{text}</DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                onConfirm && onConfirm();
                            }}
                            appearance="primary"
                        >
                            Ok
                        </Button>
                        {!!onClose && (
                            <Button
                                onClick={() => {
                                    onClose();
                                }}
                                appearance="secondary"
                            >
                                Close
                            </Button>
                        )}
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
