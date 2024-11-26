import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { ChatSuggestion } from './ChatSuggestion';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
});

interface ChatSuggestionListProps {
    onClickSuggestion: (message: string) => void;
}

/**
 * ChatSuggestionList - enumerate a list of suggestions loaded from the current conversation state.
 *
 * @param onClickSuggestion function that should be passed to each element so they may invoke it on click
 */
export const ChatSuggestionList: React.FC<ChatSuggestionListProps> = ({
    onClickSuggestion,
}: ChatSuggestionListProps) => {
    const { conversations, selectedId } = useAppSelector((state: RootState) => state.conversations);
    const { specializations } = useAppSelector((state: RootState) => state.admin);
    const specialization = specializations.find((a) => a.id === conversations[selectedId].specializationId);
    const classes = useClasses();
    //If there are user defied suggestions set for the specialization selected, we will show those.
    //Otherwise, we will send a request to the silent
    const suggestions =
        specialization && specialization.suggestions.length > 0
            ? specialization.suggestions
            : conversations[selectedId].generatedSuggestions;
    return (
        <div className={classes.root}>
            {suggestions.map((suggestion, idx) => (
                <ChatSuggestion
                    onClick={onClickSuggestion}
                    key={`suggestions-${idx}`}
                    suggestionMainText={suggestion}
                />
            ))}
        </div>
    );
};
