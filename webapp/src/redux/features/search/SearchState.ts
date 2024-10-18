import { ISearchValue } from '../../../libs/models/SearchResponse';

export interface SearchState {
    selected: boolean;
    searchData: SearchResponseFormatted;
    selectedSearchItem: { filename: string; id: number };
    selectedSpecializationId: string;
}

export const initialState: SearchState = {
    selected: false,
    searchData: { count: 0, value: [] },
    selectedSearchItem: { filename: '', id: 0 },
    selectedSpecializationId: '',
};

//Raw response data from search API
export interface SearchResponse {
    count: number;
    value: ISearchValue[];
}

//Search value, augmented with extra data that makes it easier to enumerate every match and distinguish <mark>'s
export type SearchValueFormatted = ISearchValue & { placeholderMarkedText: string; entryPointList: string[] };

//Search response, augmented with SearchValueFormatted overtop of the original ISearchValue
export interface SearchResponseFormatted {
    count: number;
    value: SearchValueFormatted[];
}
