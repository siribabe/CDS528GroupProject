import React, { useEffect, useState } from "react";
import { CoinContext } from "./CoinContext";
import fetchCryptoPrices from "../fetchCryptoPrices"; // 确保路径正确

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$"
  });
  const [cryptoPrices, setCryptoPrices] = useState([]);

  const fetchAllCoin = async () => {
    const apiUrl = '/api/v1/cryptocurrency/listings/latest'; // 使用相对路径

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('All Coin Data:', data); // 添加日志输出
      setAllCoin(data.data);
    } catch (error) {
      console.error('Error fetching all coin data:', error);
    }
  };

  useEffect(() => {
    fetchAllCoin();
  }, [currency]);

  useEffect(() => {
    const getCryptoPrices = async () => {
      const prices = await fetchCryptoPrices();
      console.log('Crypto Prices:', prices); // 添加日志输出
      setCryptoPrices(prices);
    };

    // 获取初始数据
    getCryptoPrices();

    // 设置定时器，每30秒刷新一次数据
    const intervalId = setInterval(() => {
      getCryptoPrices();
    }, 30000); // 每30秒刷新一次数据

    // 清除定时器
    return () => clearInterval(intervalId);
  }, []);

  const contextValue = {
    allCoin,
    currency,
    setCurrency,
    cryptoPrices
  };

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
}

export default CoinContextProvider;
