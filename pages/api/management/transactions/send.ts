// This is an example of to protect an API route
import { getSession } from 'next-auth/react';
import prisma from '../../../../lib/prisma';
import {
    Currency,
    sendCeloOffchainTransaction,
    sendEthOffchainTransaction,
    sendPolygonOffchainTransaction,
} from '@tatumio/tatum';
import { NextApiRequest, NextApiResponse } from 'next';

const send = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }

    const session = await getSession({ req });
    if (session) {
        const body = JSON.parse(req.body);
        const { currency, recipient, amount } = body;
        let account = await prisma.addresses.findMany({
            where: {
                userId: session?.user?.email as string,
                currency: currency,
            },
            select: {
                accountId: true,
                address: true,
                privateKey: true,
            },
        });

        const { accountId: senderAccountId, privateKey } = account[0];

        const data = {
            senderAccountId,
            privateKey,
            address: recipient,
            amount,
        };
        let transaction: any;

        try {
            switch (currency) {
                case Currency.ETH:
                    transaction = await sendEthOffchainTransaction(true, data);
                    break;
                case Currency.CELO:
                    transaction = await sendCeloOffchainTransaction(true, {
                        ...data,
                        feeCurrency: Currency.CELO,
                    });
                    break;
                case Currency.MATIC:
                    transaction = await sendPolygonOffchainTransaction(
                        true,
                        data
                    );
                    break;
            }
        } catch (e) {
            console.error(e);
            res.status(500).send({
                message:
                    'The server encountered an unexpected condition that prevented it from fulfilling the request',
            });
        }

        res.send(transaction);
    }
};

export default send;
