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
import { IChatMessage } from '../../../libs/models/ChatMessage';
import { IUserFeedbackFilterRequest } from '../../../libs/models/UserFeedback';
import { UserFeedbackService } from '../../../libs/services/UserFeedbackService';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
        ...shorthands.padding('80px'),
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

    const [userFeedbackData, setUserFeedbackData] = useState<IChatMessage[] | null>(null);

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
        { columnKey: 'date', label: 'Date' },
        { columnKey: 'feedback', label: 'Feedback' },
        { columnKey: 'content', label: 'Content' },
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
                    {userFeedbackData?.map((data) => (
                        <TableRow key={data.id}>
                            <TableCell>
                                <TableCellLayout>{data.timestamp}</TableCellLayout>
                            </TableCell>
                            <TableCell>
                                <TableCellLayout>{data.userFeedback}</TableCellLayout>
                            </TableCell>
                            <TableCell>
                                <TableCellLayout>{data.content}</TableCellLayout>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
