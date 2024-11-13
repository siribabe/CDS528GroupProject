import React, { useEffect, useState } from 'react';
import fetchCryptoPrices from './fetchCryptoPrices'; // 确保路径正确

const CryptoPrices = () => {
  const [cryptoPrices, setCryptoPrices] = useState([]);

  useEffect(() => {
    const apiKey = '5d015bee-a30f-489d-a1ca-6d77f642a9d8';

    const getCryptoPrices = async () => {
      try {
        const prices = await fetchCryptoPrices(apiKey);
        console.log('Fetched Crypto Prices:', prices); // 添加日志输出检查获取到的数据
        setCryptoPrices(prices);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
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

  return (
    <div>
      <h1>实时货币价格</h1>
      <div id="crypto-prices">
        {cryptoPrices.length > 0 ? (
          cryptoPrices.map(crypto => (
            <p key={crypto.id}>{crypto.name} price: {crypto.quote.USD.price}</p>
          ))
        ) : (
          <p>正在加载...</p>
        )}
      </div>
    </div>
  );
};

export default CryptoPrices;
