// This is an example of to protect an API route
import { getSession } from 'next-auth/react';
import {
    generateWallet,
    Currency,
    generatePrivateKeyFromMnemonic,
    generateDepositAddress,
    createAccount,
    Account,
    Address,
    CreateSubscription,
    SubscriptionType,
    createNewSubscription,
} from '@tatumio/tatum';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const generateAccount = async (currency: Currency, customerId: string) => {
    const walletMnemonic: any = await generateWallet(currency, false);
    const account: Account = await createAccount({
        currency: currency,
        xpub: walletMnemonic.xpub,
    });
    const address: Address = await generateDepositAddress(account.id);
    const privateKey: String = await generatePrivateKeyFromMnemonic(
        currency,
        false,
        walletMnemonic.mnemonic,
        1
    );

    /** enable notification */
    const data: CreateSubscription = {
        type: SubscriptionType.ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION,
        attr: {
            id: account.id,
            url: 'https://webhook.tatum.io/account',
        },
    };

    await createNewSubscription(data);
    return {
        userId: customerId,
        accountId: account.id,
        address: address.address,
        xpub: address.xpub,
        currency: currency,
        privateKey: privateKey,
    };
};

const createAccounts = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (session && session?.user?.email) {
        let promises: any[] = [];
        const currencies = [Currency.ETH, Currency.CELO, Currency.MATIC];
        currencies.forEach(currency =>
            promises.push(
                generateAccount(currency, session.user?.email as string)
            )
        );

        const data = await Promise.all(promises);
        try {
            const nonSensitiveData = await data.map(async (address: any) => {
                await prisma.addresses.create({
                    data: address,
                });
                return { currency: address.currency };
            });

            const accounts = await Promise.all(nonSensitiveData);
            res.send(accounts);
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

export default createAccounts;
