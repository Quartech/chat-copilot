import { makeStyles, mergeClasses, shorthands, Text, tokens } from '@fluentui/react-components';

import { FC, useId } from 'react';
import { useDrag } from 'react-dnd';
import { ISpecializationIndex } from '../../../../libs/models/SpecializationIndex';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { setSelectedIndexKey } from '../../../../redux/features/admin/adminSlice';
import { Breakpoints, SharedStyles } from '../../../../styles';

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

interface ISpecializationIndexListItemProps {
    item: ISpecializationIndex;
    editMode: boolean;
    isSelected: boolean;
}

export const SpecializationIndexListItem: FC<ISpecializationIndexListItemProps> = ({ item, isSelected }) => {
    const classes = useClasses();
    const dispatch = useAppDispatch();
    const friendlyTitle = item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name;
    const onEditSpecializationClick = (specializationId: string) => {
        dispatch(setSelectedIndexKey(specializationId));
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [{ isDragging }, drag] = useDrag({
        type: 'Specialization',
        item: { id: item.id },
        collect: (monitor) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            data-id={item.id}
            ref={drag}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
            className={mergeClasses(classes.root, isSelected && classes.selected)}
            onClick={() => {
                onEditSpecializationClick(item.id);
            }}
            title={`Chat: ${friendlyTitle}`}
            aria-label={`Chat list item: ${friendlyTitle}`}
        >
            <>
                <div key={useId()} className={classes.body}>
                    <div className={classes.header}>
                        <Text className={classes.title} title={friendlyTitle}>
                            {friendlyTitle}
                        </Text>
                    </div>
                    <Text className={classes.specialization} title={item.name}>
                        {item.name}
                    </Text>
                </div>
                {/* <SpecializationListItemActions
                    specializationId={specializationId}
                    specializationMode={specializationMode}
                /> */}
            </>
        </div>
    );
};
