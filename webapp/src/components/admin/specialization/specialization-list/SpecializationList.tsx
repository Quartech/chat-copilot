import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { setSelectedKey } from '../../../../redux/features/admin/adminSlice';
import { Breakpoints } from '../../../../styles';
import { Add20 } from '../../../shared/BundledIcons';
import { SpecializationListSection } from './SpecializationListSection';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexShrink: 0,
        width: '320px',
        backgroundColor: tokens.colorNeutralBackground4,
        flexDirection: 'column',
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 0.2rem 0.4rem -0.075rem',
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

export const SpecializationList: FC = () => {
    const classes = useClasses();
    const dispatch = useAppDispatch();

    const onAddSpecializationClick = () => {
        dispatch(setSelectedKey(''));
    };

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <div className={classes.root}>
                    <div className={classes.header}>
                        <Button
                            data-testid="createNewSpecializationButton"
                            icon={<Add20 />}
                            appearance="primary"
                            onClick={() => {
                                onAddSpecializationClick();
                            }}
                        >
                            New Specialization
                        </Button>
                    </div>
                    <div aria-label={'specialization list'} className={classes.list}>
                        <SpecializationListSection header="All" />
                    </div>
                </div>
            </DndProvider>
        </>
    );
};
