import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    makeStyles,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { SearchValueExtended } from '../../redux/features/search/SearchState';
import { Breakpoints } from '../../styles';
import { SearchListItem } from './search-list/SearchListItem';

const useClasses = makeStyles({
    root: {
        display: 'flex',
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

interface ISearchListSectionProps {
    value: SearchValueExtended;
    index: number;
}

export const SearchListSection: React.FC<ISearchListSectionProps> = ({ value, index }) => {
    const classes = useClasses();
    const { selectedSearchItem } = useAppSelector((state: RootState) => state.search);
    //const matches = value.matches;
    const entryPoints = value.entryPointList;
    const accordionPanelId = useId();
    //const searchListItemId = useId();
    return entryPoints.length > 0 ? (
        <div className={classes.root}>
            <Accordion collapsible={true} multiple={true}>
                <AccordionItem value={index}>
                    <AccordionHeader>{value.filename}</AccordionHeader>
                    {entryPoints.map((match, idx) => {
                        const label = match;
                        const id = idx;
                        const selectedItem =
                            selectedSearchItem.id == idx && value.filename == selectedSearchItem.filename;

                        return (
                            <AccordionPanel key={'acc' + accordionPanelId + String(id)}>
                                <SearchListItem
                                    key={id}
                                    filename={value.filename}
                                    label={label}
                                    id={id}
                                    isSelected={selectedItem}
                                />
                            </AccordionPanel>
                        );
                    })}
                </AccordionItem>
            </Accordion>
        </div>
    ) : null;
};
