/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/jsx-key */
import { makeStyles, shorthands, Text, tokens } from '@fluentui/react-components';
import React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { useSpecializationIndex } from '../../../../libs/hooks/useSpecializationIndex';
import { ISpecializationIndex } from '../../../../libs/models/SpecializationIndex';
import { useAppSelector } from '../../../../redux/app/hooks';
import { RootState } from '../../../../redux/app/store';
import { Breakpoints } from '../../../../styles';
import { SpecializationIndexListItem } from './SpecializationIndexListItem';

const useClasses = makeStyles({
    root: {
        display: 'block',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalXXS),
        paddingBottom: tokens.spacingVerticalXS,
    },
    header: {
        marginTop: 0,
        paddingBottom: tokens.spacingVerticalXS,
        marginLeft: tokens.spacingHorizontalXL,
        marginRight: tokens.spacingHorizontalXL,
        fontWeight: tokens.fontWeightRegular,
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        ...Breakpoints.small({
            display: 'none',
        }),
    },
});

interface IChatListSectionProps {
    header?: string;
}

/**
 * React component for managing and displaying a list of specializations with drag-and-drop functionality.
 * @param {IChatListSectionProps} param0 - The props for this component, including the header text.
 * @returns {React.ReactElement} Returns the list section for specializations or null if no specializations are available.
 */
export const SpecializationIndexListSection: React.FC<IChatListSectionProps> = ({ header }) => {
    const classes = useClasses();
    const indexes = useSpecializationIndex();
    const { specializationIndexes, selectedIndexId } = useAppSelector((state: RootState) => state.admin);

    const dropRef = React.useRef<HTMLDivElement | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [, drop] = useDrop({
        accept: 'Specialization',
        drop: (item: { id: string }, monitor: DropTargetMonitor) => {
            const fromId = item.id;
            const toId = getHoverId(monitor, dropRef.current);
            if (fromId === toId) return;

            // Function to reorder items
            const reorder = (list: ISpecializationIndex[], startIndex: number, endIndex: number) => {
                const result = Array.from(list);
                const [removed] = result.splice(startIndex, 1);
                result.splice(endIndex, 0, removed);
                return result.map((spec, index) => ({ ...spec, order: index })); // Update order based on new index
            };

            // Assuming specializations is accessible here or can be fetched
            const updatedSpecializations: ISpecializationIndex[] = reorder(
                specializationIndexes,
                specializationIndexes.findIndex((spec) => spec.id === fromId),
                specializationIndexes.findIndex((spec) => spec.id === toId),
            );

            void indexes.setSpecializationIndexOrder(updatedSpecializations);
        },
    });

    /**
     * Determines the ID of the hovered specialization based on mouse position.
     * @param {DropTargetMonitor} monitor - The monitor object from react-dnd to get client offset.
     * @param {HTMLDivElement|null} dropRef - Reference to the container div of specializations.
     * @returns {string} The data-id of the hovered child or an empty string if not found.
     */
    const getHoverId = (monitor: DropTargetMonitor, dropRef: HTMLDivElement | null): string => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset || !dropRef) return '';

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const hoverClientY = clientOffset.y;

        const children = Array.from(dropRef.children);
        for (const child of children) {
            const rect = child.getBoundingClientRect();
            if (hoverClientY >= rect.top && hoverClientY < rect.bottom) {
                return child.getAttribute('data-id') ?? '';
            }
        }
        return '';
    };

    return specializationIndexes.length > 0 ? (
        <div className={classes.root}>
            <Text className={classes.header}>{header}</Text>
            <div
                ref={(element) => {
                    dropRef.current = element;
                    drop(element);
                }}
            >
                {specializationIndexes
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((specialization) => {
                        const isSelected = specialization.id === selectedIndexId;
                        return (
                            <SpecializationIndexListItem
                                key={specialization.id}
                                editMode={false}
                                item={specialization}
                                isSelected={isSelected}
                            />
                        );
                    })}
            </div>
        </div>
    ) : null;
};