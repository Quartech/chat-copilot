import { ISearchValue } from '../../../libs/models/SearchResponse';

export interface SearchState {
    selected: boolean;
    searchData: SearchResponseTransform;
    selectedSearchItem: { filename: string; id: number };
    selectedSpecializationId: string;
}

export const initialState: SearchState = {
    selected: false,
    searchData: { count: 0, value: [] },
    selectedSearchItem: { filename: '', id: 0 },
    selectedSpecializationId: '',
};

export interface SearchResponse {
    count: number;
    value: ISearchValue[];
}

export type SearchValueExtended = ISearchValue & { placeholderMarkedText: string; entryPointList: string[] };

export interface SearchResponseTransform {
    count: number;
    value: SearchValueExtended[];
}
