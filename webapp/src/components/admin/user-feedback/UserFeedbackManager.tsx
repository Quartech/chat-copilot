import { useMsal } from '@azure/msal-react';
import {
    makeStyles,
    shorthands,
    Table,
    TableBody,
    TableCell,
    TableCellLayout,
    TableHeader,
    TableHeaderCell,
    TableRow,
    tokens,
} from '@fluentui/react-components';
import React, { useEffect, useRef, useState } from 'react';
import { AuthHelper } from '../../../libs/auth/AuthHelper';
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

    const [userFeedbackData, setUserFeedbackData] = useState<IUserFeedbackResult | null>(null);

    const initalFetch = useRef(false);

    const filter: IUserFeedbackFilterRequest = {};

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

    const columns = [
        { columnKey: 'feedback', label: 'Feedback' },
        { columnKey: 'specialization', label: 'Specialization' },
        { columnKey: 'prompt', label: 'User Prompt' },
        { columnKey: 'content', label: 'Bot Response' },
        { columnKey: 'date', label: 'Date' },
    ];

    return (
        <div className={classes.root}>
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
                                <TableCellLayout>{item.content}</TableCellLayout>
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
