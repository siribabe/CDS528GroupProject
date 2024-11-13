import React, { useState } from 'react';
import './WalletCard.css';

const WalletCard = ({ setDefaultAccount }) => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');
    const [walletAddress, setWalletAddress] = useState(null); // 用于存储连接的钱包地址

    const connectWalletHandler = async () => {
        if (window.ethereum) {
            try {
                // 请求用户连接钱包
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];

                setWalletAddress(account);
                setDefaultAccount(account); // 更新父组件的账户状态
                setConnButtonText('Wallet Connected'); // 更新连接状态
            } catch (error) {
                console.error('Error connecting wallet:', error);
                setConnButtonText('Connect Wallet'); // 恢复按钮文本
                setErrorMessage(error.message);
            }
        } else {
            setErrorMessage('MetaMask not installed or window.ethereum not available');
        }
    };

    return (
        <div className='walletCard'>
            <h4>{"Using a Hardcoded Wallet Address"}</h4>
            <button onClick={connectWalletHandler} className='connectButton'>{connButtonText}</button>
            <div className='accountDisplay'>
                <h3>Address: {walletAddress || 'Not Connected'}</h3>
            </div>
            {errorMessage && <div className="errorMessage">{errorMessage}</div>}
        </div>
    );
};

export default WalletCard;
