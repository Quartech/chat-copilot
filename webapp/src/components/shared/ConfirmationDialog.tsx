import React from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    makeStyles,
} from '@fluentui/react-components';

const useStyles = makeStyles({
    dialogSurface: {
        padding: '20px',
    },
    dialogTitle: {
        marginBottom: '16px',
    },
    dialogContent: {
        marginBottom: '20px',
        fontSize: '16px',
    },
    dialogActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    },
});

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    content: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    title,
    content,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}) => {
    const classes = useStyles();
    return (
        <Dialog open={open}>
            <DialogSurface className={classes.dialogSurface}>
                <DialogTitle className={classes.dialogTitle}>{title}</DialogTitle>
                <DialogContent className={classes.dialogContent}>{content}</DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <Button onClick={onConfirm} appearance="primary">
                        {confirmLabel}
                    </Button>
                    <Button onClick={onCancel}>{cancelLabel}</Button>
                </DialogActions>
            </DialogSurface>
        </Dialog>
    );
};
