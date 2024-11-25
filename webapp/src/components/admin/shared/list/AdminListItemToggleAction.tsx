import { makeStyles, Switch } from '@fluentui/react-components';
import React, { useState } from 'react';
import { AlertType } from '../../../../libs/models/AlertType';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { addAlert } from '../../../../redux/features/app/appSlice';
import { Breakpoints } from '../../../../styles';

const useClasses = makeStyles({
    root: {
        display: 'contents',
        ...Breakpoints.small({
            display: 'none',
        }),
    },
});

interface IAdminListItemToggleActionProps {
    toggleStatus: boolean;
    id: string;
    onItemToggled: (id: string, checked: boolean) => Promise<boolean>;
}

export const AdminListItemToggleAction: React.FC<IAdminListItemToggleActionProps> = ({
    id,
    toggleStatus,
    onItemToggled,
}) => {
    const classes = useClasses();
    const dispatch = useAppDispatch();
    // This piece of state is technically NOT necessary but a nice to have for immediate feedback.
    const [internalToggle, setInternalToggle] = useState(toggleStatus);

    return (
        <div className={classes.root}>
            <Switch
                color="#0000"
                width={40}
                height={20}
                checked={internalToggle}
                onChange={(_event, { checked }) => {
                    onItemToggled(id, checked)
                        .then((success) => {
                            if (success) {
                                setInternalToggle(checked);
                            }
                        })
                        .catch(() => {
                            dispatch(
                                addAlert({
                                    message: 'Could not toggle the selected specialization.',
                                    type: AlertType.Error,
                                }),
                            );
                        });
                }}
                className="react-switch"
            />
        </div>
    );
};
