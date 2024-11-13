/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/jsx-key */
import { makeStyles, shorthands, Text, tokens } from '@fluentui/react-components';
import React from 'react';
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

    const { specializationIndexes, selectedIndexId } = useAppSelector((state: RootState) => state.admin);

    return specializationIndexes.length > 0 ? (
        <div className={classes.root}>
            <Text className={classes.header}>{header}</Text>
            <div>
                {specializationIndexes.slice().map((specialization) => {
                    const isSelected = specialization.id === selectedIndexId;
                    return (
                        <SpecializationIndexListItem editMode={false} item={specialization} isSelected={isSelected} />
                    );
                })}
            </div>
        </div>
    ) : null;
};
