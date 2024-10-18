/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/jsx-key */
import { makeStyles, shorthands, Text, tokens } from '@fluentui/react-components';
import React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { useSpecialization } from '../../../../libs/hooks';
import { useAppSelector } from '../../../../redux/app/hooks';
import { RootState } from '../../../../redux/app/store';
import { Breakpoints } from '../../../../styles';
import { SpecializationListItem } from './SpecializationListItem';

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
export const SpecializationListSection: React.FC<IChatListSectionProps> = ({ header }) => {
    const classes = useClasses();
    const specialization = useSpecialization();
    const { specializations, selectedId } = useAppSelector((state: RootState) => state.admin);

    const dropRef = React.useRef<HTMLDivElement | null>(null);

    const [, drop] = useDrop({
        accept: 'Specialization',
        drop: (item: { id: string }, monitor: DropTargetMonitor) => {
            const fromId = item.id;
            const toId = getHoverId(monitor, dropRef.current);
            if (fromId === toId) return;

            const fromOrder = specializations.find((s) => s.id === fromId)?.order ?? 0;
            const toOrder = specializations.find((s) => s.id === toId)?.order ?? 0;
            if (fromOrder !== toOrder) {
                void specialization.swapSpecializationOrder({ fromId, fromOrder, toId, toOrder });
            }
        },
    });

    /**
     * Determines the ID of the hovered specialization based on mouse position.
     * @param {DropTargetMonitor} monitor - The monitor object from react-dnd to get client offset.
     * @param {HTMLDivElement|null} dropRef - Reference to the container div of specializations.
     * @returns {string} The data-id of the hovered child or an empty string if not found.
     */
    const getHoverId = (monitor: DropTargetMonitor, dropRef: HTMLDivElement | null): string => {
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset || !dropRef) return '';

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

    return specializations.length > 0 ? (
        <div className={classes.root}>
            <Text className={classes.header}>{header}</Text>
            <div
                ref={(element) => {
                    dropRef.current = element;
                    drop(element);
                }}
            >
                {specializations
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((specialization) => {
                        if (specialization.id === 'general') return null;
                        const isSelected = specialization.id === selectedId;
                        return (
                            <SpecializationListItem
                                key={specialization.id}
                                specializationId={specialization.id}
                                label={specialization.label}
                                name={specialization.name}
                                specializationMode={specialization.isActive}
                                isSelected={isSelected}
                            />
                        );
                    })}
            </div>
        </div>
    ) : null;
};
