import { Button } from '@fluentui/react-button';
import { Tooltip, makeStyles } from '@fluentui/react-components';
import {
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-dialog';
import { Delete16 } from '../../../../shared/BundledIcons';
import { useSpecialization } from '../../../../../libs/hooks';

const useClasses = makeStyles({
    root: {
        width: '450px',
    },
    actions: {
        paddingTop: '10%',
    },
});

interface IDeleteSpecializationProps {
    specializationId: string;
    name: string;
}

export const DeleteSpecializationDialog: React.FC<IDeleteSpecializationProps> = ({ specializationId, name }) => {
    const classes = useClasses();
    const specialization = useSpecialization();

    const onDeleteChat = () => {
        void specialization.deleteSpecialization(specializationId);
    };

    return (
        <Dialog modalType="alert">
            <DialogTrigger>
                <Tooltip content={'Delete specialization'} relationship="label">
                    <Button icon={<Delete16 />} appearance="transparent" aria-label="Edit" />
                </Tooltip>
            </DialogTrigger>
            <DialogSurface className={classes.root}>
                <DialogBody>
                    <DialogTitle>Are you sure you want to delete specialization: {name}?</DialogTitle>
                    <DialogContent>
                        This action will delete the specialization, and it cannot be used in chats.
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <DialogTrigger action="close" disableButtonEnhancement>
                            <Button appearance="secondary">Cancel</Button>
                        </DialogTrigger>
                        <DialogTrigger action="close" disableButtonEnhancement>
                            <Button appearance="primary" onClick={onDeleteChat}>
                                Delete
                            </Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
