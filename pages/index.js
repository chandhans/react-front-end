import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [amount, setAmount] = useState(10); // Default amount for deposit/withdraw
  const [password, setPassword] = useState("");
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [theme, setTheme] = useState("light"); // Default theme

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    const account = accounts[0];
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      const tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
      updateTransactionHistory("Deposit", amount, tx.hash);
    }
  };

  const withdraw = async () => {
    if (atm) {
      const tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
      updateTransactionHistory("Withdraw", amount, tx.hash);
    }
  };

  const updateTransactionHistory = (type, amount, hash) => {
    const newTransaction = { type, amount, hash };
    setTransactionHistory([...transactionHistory, newTransaction]);
  };

  const viewTransactionHistory = () => {
    if (transactionHistory.length === 0) {
      return <p>No transactions yet.</p>;
    }

    return (
      <div>
        <h2>Transaction History</h2>
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              Type: {transaction.type}, Amount: {transaction.amount}, Hash: {transaction.hash}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const showHistoryButtonClicked = () => {
    if (password === "1234") {
      setShowTransactionHistory(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <label>
          Amount:
          <input type="number" value={amount} onChange={handleAmountChange} />
        </label>
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
        <button onClick={showHistoryButtonClicked}>View Transaction History</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className={`container ${theme}`}>
      <button className="theme-button" onClick={toggleTheme}>
        Switch Theme
      </button>
      <header>
        <h1>Welcome to the Real World</h1>
        <h2>Chandhan S</h2>
      </header>
      {initUser()}
      {showTransactionHistory && viewTransactionHistory()}
      <style jsx>{`
        .container {
          text-align: center;
        }

        .light {
          background-color: #fff;
          color: #000;
        }

        .dark {
          background-color: #333;
          color: #fff;
        }

        .theme-button {
          position: absolute;
          top: 10px;
          right: 10px;
        }
      `}</style>
    </main>
  );
}
