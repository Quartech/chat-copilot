import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { setSelectedIndexKey } from '../../../../redux/features/admin/adminSlice';
import { Breakpoints } from '../../../../styles';
import { Add20 } from '../../../shared/BundledIcons';
import { SpecializationIndexListSection } from './SpecializationIndexListSection';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexShrink: 0,
        width: '320px',
        backgroundColor: tokens.colorNeutralBackground4,
        flexDirection: 'column',
        ...shorthands.overflow('hidden'),
        ...Breakpoints.small({
            width: '64px',
        }),
    },
    list: {
        overflowY: 'auto',
        overflowX: 'hidden',
        '&:hover': {
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: tokens.colorScrollbarOverlay,
                visibility: 'visible',
            },
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: tokens.colorSubtleBackground,
        },
        alignItems: 'stretch',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: tokens.spacingVerticalM,
        marginLeft: tokens.spacingHorizontalXL,
        alignItems: 'center',
        height: '60px',
        ...Breakpoints.small({
            justifyContent: 'center',
        }),
    },
});

export const SpecializationIndexList: FC = () => {
    const classes = useClasses();
    const dispatch = useAppDispatch();

    const onAddSpecializationClick = () => {
        dispatch(setSelectedIndexKey(''));
    };

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <div className={classes.root}>
                    <div className={classes.header}>
                        <Button
                            data-testid="createNewSpecializationButton"
                            icon={<Add20 />}
                            appearance="transparent"
                            onClick={() => {
                                onAddSpecializationClick();
                            }}
                        />{' '}
                    </div>
                    <div aria-label={'specialization list'} className={classes.list}>
                        <SpecializationIndexListSection header="All" />
                    </div>
                </div>
            </DndProvider>
        </>
    );
};
