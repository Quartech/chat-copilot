import { useMsal } from '@azure/msal-react';
import {
    Button,
    createTableColumn,
    DataGrid,
    DataGridBody,
    DataGridCell,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridRow,
    Dropdown,
    makeStyles,
    Option,
    shorthands,
    TableCellLayout,
    TableColumnDefinition,
    useId,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AuthHelper } from '../../../libs/auth/AuthHelper';
import { AlertType } from '../../../libs/models/AlertType';
import { CopilotChatMessageSortOption } from '../../../libs/models/ChatMessage';
import { IUserFeedbackFilterRequest, IUserFeedbackItem, IUserFeedbackResult } from '../../../libs/models/UserFeedback';
import { UserFeedbackService } from '../../../libs/services/UserFeedbackService';
import { addAlert, hideSpinner, showSpinner } from '../../../redux/features/app/appSlice';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: '80px',
        overflowY: 'auto',
    },
    filterContainer: {
        display: 'flex',
        marginBottom: '20px',
    },
    filter: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.padding('5px'),
    },
    label: {
        margin: '0 0 2px 2px',
    },
    dropdown: {
        minWidth: '100px',
    },
    apply: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '5px',
    },
    tableContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
    },
});

/**
 * UserFeedback Manager component.
 *
 * @returns {*}
 */
export const UserFeedbackManager: React.FC = () => {
    const dispatch = useDispatch();
    const classes = useClasses();
    const { instance, inProgress } = useMsal();
    const userFeedbackService = new UserFeedbackService();

    const thirtyDaysAgoDate = new Date(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0));
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));

    const [userFeedbackData, setUserFeedbackData] = useState<IUserFeedbackResult | null>(null);
    const [filter, setFilter] = useState<IUserFeedbackFilterRequest>({
        startDate: thirtyDaysAgoDate,
        endDate: todayDate,
        isPositive: undefined,
        sortBy: [CopilotChatMessageSortOption.dateDesc],
    });

    const initalFetch = useRef(false);

    const fetchData = async () => {
        dispatch(showSpinner());
        try {
            const data = await userFeedbackService.fetchFeedback(
                filter,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
            setUserFeedbackData(data);
        } catch (err) {
            dispatch(
                addAlert({
                    message: `Error retrieving user feedback data. ${err}`,
                    type: AlertType.Error,
                }),
            );
        } finally {
            dispatch(hideSpinner());
        }
    };

    useEffect(() => {
        if (!initalFetch.current) {
            initalFetch.current = true;
            void fetchData();
        }
    });

    const handleFilterChange = (field: keyof IUserFeedbackFilterRequest, value: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setFilter((prev) => ({ ...prev, [field]: value }));
    };

    const handleSortChange = (group: string, value: CopilotChatMessageSortOption) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setFilter((prevFilter) => ({
            ...prevFilter,
            sortBy: [...(prevFilter.sortBy ?? []).filter((item) => !item.startsWith(group)), value],
        }));
    };

    const feedbackDropdownId = useId('feedback');
    const feedbackOptions = [
        { value: 'all', text: 'All' },
        { value: 'positive', text: 'Positive' },
        { value: 'negative', text: 'Negative' },
    ];

    const sortDateDropdownId = useId('sortDate');
    const sortDateOptions = [
        { value: 'dateDesc', text: 'Date (Newest first)' },
        { value: 'dateAsc', text: 'Date (Oldest first)' },
    ];

    const sortFeedbackDropdownId = useId('sortFeedback');
    const sortFeedbackOptions = [
        { value: 'feedbackPos', text: 'Feedback (Positive first)' },
        { value: 'feedbackNeg', text: 'Feedback (Negative first)' },
    ];

    const columns: Array<TableColumnDefinition<IUserFeedbackItem>> = [
        createTableColumn<IUserFeedbackItem>({
            columnId: 'userFeedback',
            renderHeaderCell: () => {
                return 'Feedback';
            },
            renderCell: (item) => {
                return <TableCellLayout truncate>{item.userFeedback}</TableCellLayout>;
            },
        }),
        createTableColumn<IUserFeedbackItem>({
            columnId: 'specialization',
            renderHeaderCell: () => {
                return 'Specialization';
            },
            renderCell: (item) => {
                return <TableCellLayout truncate>{item.specializationId}</TableCellLayout>;
            },
        }),
        createTableColumn<IUserFeedbackItem>({
            columnId: 'prompt',
            renderHeaderCell: () => {
                return 'User Prompt';
            },

            renderCell: (item) => {
                return <TableCellLayout truncate>{item.prompt}</TableCellLayout>;
            },
        }),
        createTableColumn<IUserFeedbackItem>({
            columnId: 'content',
            renderHeaderCell: () => {
                return 'Bot Response';
            },
            renderCell: (item) => {
                return <TableCellLayout truncate>{item.content}</TableCellLayout>;
            },
        }),
        createTableColumn<IUserFeedbackItem>({
            columnId: 'timestamp',
            renderHeaderCell: () => {
                return 'Date';
            },
            renderCell: (item) => {
                return <TableCellLayout truncate>{item.timestamp}</TableCellLayout>;
            },
        }),
    ];

    const columnSizingOptions = {
        userFeedback: {
            defaultWidth: 80,
        },
        specialization: {
            defaultWidth: 200,
        },
        prompt: {
            defaultWidth: 420,
        },
        content: {
            defaultWidth: 420,
        },
        timestamp: {
            defaultWidth: 100,
        },
    };

    //const refMap = React.useRef<Record<string, HTMLElement | null>>({});

    return (
        <div className={classes.root}>
            {/* Filter UI */}
            <div className={classes.filterContainer}>
                <div className={classes.filter}>
                    <label className={classes.label} id={feedbackDropdownId}>
                        Feedback:
                    </label>
                    <Dropdown
                        className={classes.dropdown}
                        aria-labelledby={feedbackDropdownId}
                        defaultSelectedOptions={[feedbackOptions[0].value]}
                        defaultValue={feedbackOptions[0].text}
                        onOptionSelect={(_ev, option) => {
                            handleFilterChange(
                                'isPositive',
                                option.optionValue === 'all' ? null : option.optionValue === 'positive',
                            );
                        }}
                    >
                        {feedbackOptions.map((option, index) => (
                            <Option key={index} value={option.value}>
                                {option.text}
                            </Option>
                        ))}
                    </Dropdown>
                </div>
                <div className={classes.filter}>
                    <label className={classes.label} id="startDatePicker">
                        Start Date:
                    </label>
                    <DatePicker
                        className={classes.dropdown}
                        aria-labelledby="startDatePicker"
                        value={filter.startDate}
                        onSelectDate={(date) => {
                            handleFilterChange('startDate', date);
                        }}
                    />
                </div>
                <div className={classes.filter}>
                    <label className={classes.label} id="endDatePicker">
                        End Date:
                    </label>
                    <DatePicker
                        className={classes.dropdown}
                        aria-labelledby="endDatePicker"
                        value={filter.endDate}
                        onSelectDate={(date) => {
                            handleFilterChange('endDate', date);
                        }}
                    />
                </div>
                <div className={classes.filter}>
                    <label className={classes.label} id={sortDateDropdownId}>
                        Sort By:
                    </label>
                    <Dropdown
                        className={classes.dropdown}
                        aria-labelledby={sortDateDropdownId}
                        defaultSelectedOptions={[sortDateOptions[0].value]}
                        defaultValue={sortDateOptions[0].text}
                        onOptionSelect={(_ev, option) => {
                            handleSortChange('date', option.optionValue as CopilotChatMessageSortOption);
                        }}
                    >
                        {sortDateOptions.map((option, index) => (
                            <Option key={index} value={option.value}>
                                {option.text}
                            </Option>
                        ))}
                    </Dropdown>
                </div>
                <div className={classes.filter}>
                    <label className={classes.label} id={sortFeedbackDropdownId}>
                        Sort By:
                    </label>
                    <Dropdown
                        className={classes.dropdown}
                        aria-labelledby={sortFeedbackDropdownId}
                        defaultSelectedOptions={undefined}
                        defaultValue={undefined}
                        onOptionSelect={(_ev, option) => {
                            handleSortChange('feedback', option.optionValue as CopilotChatMessageSortOption);
                        }}
                    >
                        {sortFeedbackOptions.map((option, index) => (
                            <Option key={index} value={option.value}>
                                {option.text}
                            </Option>
                        ))}
                    </Dropdown>
                </div>
                <div className={classes.apply}>
                    <Button
                        onClick={() => {
                            void fetchData();
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </div>
            {/* Table UI */}
            <div className={classes.tableContainer}>
                <DataGrid
                    items={userFeedbackData?.items ?? []}
                    columns={columns}
                    columnSizingOptions={columnSizingOptions}
                    resizableColumns
                    style={{
                        width: '100%',
                        flexGrow: 1,
                        minWidth: '500px',
                    }}
                >
                    <DataGridHeader>
                        <DataGridRow>
                            {({ renderHeaderCell }) => (
                                <DataGridHeaderCell>
                                    <strong>{renderHeaderCell()}</strong>
                                </DataGridHeaderCell>
                            )}
                        </DataGridRow>
                    </DataGridHeader>
                    <DataGridBody<IUserFeedbackItem>>
                        {({ item, rowId }) => (
                            <DataGridRow<IUserFeedbackItem> key={rowId}>
                                {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                            </DataGridRow>
                        )}
                    </DataGridBody>
                </DataGrid>
            </div>
        </div>
    );
};
