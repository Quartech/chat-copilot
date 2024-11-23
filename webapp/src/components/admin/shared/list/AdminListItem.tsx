import { makeStyles, mergeClasses, shorthands, Text, tokens } from '@fluentui/react-components';

import { useId } from 'react';
import { useDrag } from 'react-dnd';
import { Breakpoints, SharedStyles } from '../../../../styles';
import { AdminListItemToggleAction } from './AdminListItemToggleAction';

const useClasses = makeStyles({
    root: {
        boxSizing: 'border-box',
        display: 'inline-flex',
        flexDirection: 'row',
        width: '100%',
        ...Breakpoints.small({
            justifyContent: 'center',
        }),
        cursor: 'pointer',
        ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalXL),
    },
    body: {
        minWidth: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: tokens.spacingHorizontalXS,
        ...Breakpoints.small({
            display: 'none',
        }),
        alignSelf: 'center',
    },
    header: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        ...SharedStyles.overflowEllipsis,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
    },
    previewText: {
        ...SharedStyles.overflowEllipsis,
        display: 'flex',
        lineHeight: tokens.lineHeightBase100,
        color: tokens.colorNeutralForeground2,
    },
    selected: {
        backgroundColor: tokens.colorNeutralBackground1,
    },
    l1: {
        width: '30px',
    },
    specialization: {
        fontStyle: 'italic',
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
    },
});

interface IAdminListItemProps {
    name: string;
    label: string;
    id: string;
    editMode: boolean;
    isSelected: boolean;
    onItemSelected: (id: string) => void;
    onItemToggled?: (id: string, checked: boolean) => Promise<boolean>;
}

export const AdminListItem = ({
    isSelected,
    name,
    id,
    editMode,
    onItemSelected,
    onItemToggled,
}: IAdminListItemProps) => {
    const classes = useClasses();
    const friendlyTitle = name.length > 30 ? name.substring(0, 30) + '...' : name;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [{ isDragging }, drag] = useDrag({
        type: 'Specialization',
        item: { id },
        collect: (monitor) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            data-id={id}
            ref={drag}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
            className={mergeClasses(classes.root, isSelected && classes.selected)}
            onClick={() => {
                onItemSelected(id);
            }}
            title={`Chat: ${friendlyTitle}`}
            aria-label={`Chat list item: ${friendlyTitle}`}
        >
            <div key={useId()} className={classes.body}>
                <div className={classes.header}>
                    <Text className={classes.title} title={friendlyTitle}>
                        {friendlyTitle}
                    </Text>
                </div>
                <Text className={classes.specialization} title={name}>
                    {name}
                </Text>
            </div>
            {onItemToggled && (
                <AdminListItemToggleAction toggleStatus={editMode} id={id} onItemToggled={onItemToggled} />
            )}
        </div>
    );
};
