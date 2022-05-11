import React, { useEffect, useState } from "react";
import type { NextPageContext } from "next";
import Layout from "../components/Layout";
import prisma from "../lib/prisma";
import { useSession, getSession } from "next-auth/react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Snackbar } from "@mui/material";

type Props = {
  accounts: [];
};

const Dashboard: React.FC<Props> = (props) => {
  const [accounts, setaccounts] = useState(props.accounts);
  const [loading, setLoading] = useState(!!props.accounts);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  
  const handleAlert= (message: string) => {
    setMessage(message);
    setOpen(true);
  };

  const handleOpen= () => {
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const { data: session, status } = useSession();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (session && accounts.length === 0) {
        const res = await fetch(
          "http://localhost:3000/api/management/createAccounts"
        );
        const data = await res.json();
        setaccounts(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      if (session && selectedAccount) {
        const res = await fetch(
          `http://localhost:3000/api/management/transactions/${selectedAccount}`
        );
        const data = await res.json();
        setTransactions(data);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, [selectedAccount]);

  const sendTransaction = async () => {
    if (session && selectedAccount && amount && recipient) {
      const data = {
        currency: selectedAccount,
        amount: amount,
        recipient: recipient,
      };
      // setAmount('')
      // setSelectedAccount('')
      // setRecipient('')
      const response = await fetch(
        `http://localhost:3000/api/management/transactions/send`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return response.json();
    } else
      alert(
        JSON.stringify(amount) +
          JSON.stringify(selectedAccount) +
          JSON.stringify(recipient)
      );
  };
  return (
    <Layout>
      {!session ? (
        <Box sx={{margin: '10% auto', textAlign: 'center'}}>
            You must be signed in to view the protected content on this page
        </Box>
      ) : (
        <div>
          <h1>My Accounts</h1>
          <main>
            {loading || !Array.isArray(accounts) ? (
              <CircularProgress />
            ) : (
              accounts?.map((wallet: any) => (
                <Button
                  key={wallet.currency}
                  style={{ marginRight: 10 }}
                  variant={
                    selectedAccount !== wallet.currency
                      ? "outlined"
                      : "contained"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    const button = e.target as HTMLElement;
                    setSelectedAccount(button.innerText);
                  }}
                >
                  {wallet.currency}
                </Button>
              ))
            )}
            <hr />

            <div>
              <h2>
                {`Send Transaction ${selectedAccount ? `from: ${selectedAccount} account` : ""}`}
              </h2>
              <TextField
                id="amount"
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <br />
              <br />
              <TextField
                id="recipient"
                label="Recipient Address"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                }}
              />
              <br />
              <br />
              <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={handleClose}
                message={message}
              />
              <Button
                onClick={async (e) => {
                  e.preventDefault();

                  if (!selectedAccount) {
                    handleAlert("Select your Currency!");
                    return;
                  }
                  if (!amount) {
                    handleAlert("Set the amount!");
                    return;
                  }
                  if (!recipient) {
                    handleAlert("Set Recipient address!");
                    return;
                  }
                  await sendTransaction();
                }}
              >
                Send
              </Button>
            </div>
            <hr />

            {loading && !!Array.isArray(transactions) ? (
              <CircularProgress />
            ) : (
              transactions?.map((transaction: any) => (
                <div>{JSON.stringify(transaction)}</div>
              ))
            )}
          </main>
        </div>
      )}
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (session !== null && !session?.user?.email) {
    return {
      props: { accounts: [] },
    };
  }
try{
  let accounts = await prisma.addresses.findMany({
    where: {
      userId: session?.user?.email as string,
    },
  });

  const nonSensitiveData = accounts?.map((d) => {
    return { id: d.id, currency: d.currency, address: d.address };
  });

  return {
    props: { accounts: nonSensitiveData },
  };}
  catch(ex){
    return {
      props: { accounts: [] },
    };
  }
}

export default Dashboard;
