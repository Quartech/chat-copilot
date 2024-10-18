// Copyright (c) Microsoft. All rights reserved.

import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import React, { useEffect } from 'react';
import { useSearch } from '../../libs/hooks/useSearch';
import { ISearchMetaData } from '../../libs/models/SearchResponse';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { SharedStyles } from '../../styles';
import { SearchInput } from './SearchInput';

const useClasses = makeStyles({
    root: {
        ...shorthands.overflow('hidden'),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
    },
    scroll: {
        ...shorthands.margin(tokens.spacingVerticalXS),
        ...SharedStyles.scroll,
    },
    history: {
        ...shorthands.padding(tokens.spacingVerticalM),
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        display: 'flex',
        justifyContent: 'center',
    },
    input: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingVerticalNone),
    },
});

export const SearchRoom: React.FC = () => {
    const classes = useClasses();
    const search = useSearch();

    const { searchData, selectedSearchItem, selectedSpecializationId } = useAppSelector(
        (state: RootState) => state.search,
    );
    const values = searchData.value;
    let displayContent: string[] = [];
    let metaData: ISearchMetaData = {};

    values.forEach((data) => {
        if (data.filename === selectedSearchItem.filename) {
            //The placeholder tags exist to make it easy to find the currently selected text in the string and highlight it by replacing
            //the placeholder tag with a mark tag.
            const regex = new RegExp(
                `<PLACEHOLDER_${selectedSearchItem.id + 1}>(.*?)<\/PLACEHOLDER_${selectedSearchItem.id + 1}>`,
            );
            displayContent = [
                data.placeholderMarkedText.replace(regex, (_match, p1: string) => {
                    return `<mark>${p1}</mark>`;
                }),
            ];
            metaData = data.matches[0].metadata;
        }
    });

    const scrollViewTargetRef = React.useRef<HTMLDivElement>(null);

    const handleSubmit = async (specialization: string, value: string) => {
        await search.getResponse(specialization, value);
    };

    useEffect(() => {
        //Every time the current mark tagged element changes, try to scroll that element into view, as it may be
        //off screen when the document is large.
        const elements = document.getElementsByTagName('mark');
        if (elements.length > 0) {
            const element = elements[0];
            element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [selectedSearchItem]);

    return (
        <div className={classes.root}>
            <SearchInput onSubmit={handleSubmit} defaultSpecializationId={selectedSpecializationId} />
            <div ref={scrollViewTargetRef} className={classes.scroll}>
                <div>
                    {displayContent.map((content, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: content }} />
                    ))}
                </div>
                <div id="meta-data">
                    {metaData.source?.filename && (
                        <div>
                            <span>
                                <b>Filename</b>
                            </span>
                            : <span>{metaData.source.filename}</span>
                        </div>
                    )}
                    {metaData.source?.url && (
                        <div>
                            <span>
                                <b>URL</b>
                            </span>
                            : <span>{metaData.source.url}</span>
                        </div>
                    )}
                    {/* {metaData.page_number !== undefined && (
                        <div>
                            <span>
                                <b>Page Number</b>
                            </span>
                            : <span>{metaData.page_number}</span>
                        </div>
                    )} */}
                </div>
            </div>
            <div className={classes.input}></div>
        </div>
    );
};
