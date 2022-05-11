// This is an example of to protect an API route
import { getSession } from 'next-auth/react';
import { getTransactionsByAccount, Transaction } from '@tatumio/tatum';
import prisma from '../../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const getTransactions = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });

    if (session && req?.query?.currency) {
        let accounts = await prisma.addresses.findMany({
            where: {
                userId: session?.user?.email as string,
            },
            select: {
                accountId: true,
                currency: true,
            },
        });

        let transactions: Transaction[] = [];
        try {
            accounts
                .filter(account => account.currency === req.query.currency)
                .map(async ({ accountId }) => {
                    transactions.push(
                        ...(await getTransactionsByAccount({ id: accountId }))
                    );
                });
            res.send(transactions);
        } catch (ex) {
            res.status(500).send({
                message:
                    'The server encountered an unexpected condition that prevented it from fulfilling the request',
            });
        }
    } else {
        res.send({
            message:
                'You must be signed in to view the protected content on this page.',
        });
    }
};

export default getTransactions;
