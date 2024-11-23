import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSpecializationIndex } from '../../../../libs/hooks/useSpecializationIndex';
import { useAppDispatch, useAppSelector } from '../../../../redux/app/hooks';
import { RootState } from '../../../../redux/app/store';
import { setSelectedIndexKey } from '../../../../redux/features/admin/adminSlice';
import { Breakpoints } from '../../../../styles';
import { Add20 } from '../../../shared/BundledIcons';
import { AdminItemListSection } from '../../shared/list/AdminListItemSection';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexShrink: 0,
        width: '320px',
        backgroundColor: tokens.colorNeutralBackground4,
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 0.2rem 0.4rem -0.075rem',
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
    const indexes = useSpecializationIndex();
    const { specializationIndexes, selectedIndexId } = useAppSelector((state: RootState) => state.admin);
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
                            appearance="primary"
                            onClick={() => {
                                onAddSpecializationClick();
                            }}
                        >
                            New Index
                        </Button>
                    </div>
                    <div aria-label={'specialization index list'} className={classes.list}>
                        <AdminItemListSection
                            header="All"
                            items={specializationIndexes}
                            onItemCollectionReorder={(items) => {
                                void indexes.setSpecializationIndexOrder(items);
                            }}
                            onItemSelected={(id: string) => {
                                dispatch(setSelectedIndexKey(id));
                            }}
                            selectedId={selectedIndexId}
                        />
                    </div>
                </div>
            </DndProvider>
        </>
    );
};
