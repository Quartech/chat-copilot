import { useMsal } from '@azure/msal-react';
import {
    Button,
    Dropdown,
    Field,
    makeStyles,
    Option,
    shorthands,
    Table,
    TableBody,
    TableCell,
    TableCellLayout,
    TableHeader,
    TableHeaderCell,
    TableRow,
    tokens,
    useId,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import React, { useEffect, useRef, useState } from 'react';
import { AuthHelper } from '../../../libs/auth/AuthHelper';
import { CopilotChatMessageSortOption } from '../../../libs/models/ChatMessage';
import { IUserFeedbackFilterRequest, IUserFeedbackResult } from '../../../libs/models/UserFeedback';
import { UserFeedbackService } from '../../../libs/services/UserFeedbackService';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '400px',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
        ...shorthands.padding('80px'),
        ...shorthands.overflow('auto'),
    },
});

/**
 * UserFeedback Manager component.
 *
 * @returns {*}
 */
export const UserFeedbackManager: React.FC = () => {
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
        try {
            const data = await userFeedbackService.fetchFeedback(
                filter,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
            setUserFeedbackData(data);
        } catch (err) {}
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

    const columns = [
        { columnKey: 'feedback', label: 'Feedback' },
        { columnKey: 'specialization', label: 'Specialization' },
        { columnKey: 'prompt', label: 'User Prompt' },
        { columnKey: 'content', label: 'Bot Response' },
        { columnKey: 'date', label: 'Date' },
    ];

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

    return (
        <div className={classes.root}>
            {/* Filter UI */}
            <div style={{ marginBottom: '20px' }}>
                <Field label="Feedback:">
                    <Dropdown
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
                </Field>
                <Field label="Start Date:">
                    <DatePicker
                        value={filter.startDate}
                        onSelectDate={(date) => {
                            handleFilterChange('startDate', date);
                        }}
                    />
                </Field>
                <Field label="End Date:">
                    <DatePicker
                        value={filter.endDate}
                        onSelectDate={(date) => {
                            handleFilterChange('endDate', date);
                        }}
                    />
                </Field>
                <Field label="Sort By Date:">
                    <Dropdown
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
                    <Field label="Sort By Feedback:">
                        <Dropdown
                            aria-labelledby={sortFeedbackDropdownId}
                            defaultSelectedOptions={[sortFeedbackOptions[0].value]}
                            defaultValue={sortFeedbackOptions[0].text}
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
                    </Field>
                </Field>
                <div style={{ marginTop: '20px' }}>
                    <Button
                        onClick={() => {
                            void fetchData();
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userFeedbackData?.items.map((item) => (
                        <TableRow key={item.messageId}>
                            <TableCell>
                                <TableCellLayout>{item.userFeedback}</TableCellLayout>
                            </TableCell>
                            <TableCell>
                                <TableCellLayout>{item.specializationId}</TableCellLayout>
                            </TableCell>
                            <TableCell>
                                <TableCellLayout>{item.prompt}</TableCellLayout>
                            </TableCell>
                            <TableCell>
                                <TableCellLayout>
                                    <div
                                        style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '200px',
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                </TableCellLayout>
                            </TableCell>
                            <TableCell>
                                <TableCellLayout>{item.timestamp}</TableCellLayout>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
