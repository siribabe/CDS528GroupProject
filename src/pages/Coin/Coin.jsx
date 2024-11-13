import React, { useContext, useEffect, useState } from "react";
import './Coin.css';
import { useParams } from "react-router-dom";
import { CoinContext } from "../../context/CoinContext";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const { currency, cryptoPrices } = useContext(CoinContext); // 获取上下文中的实时价格数据

  const fetchCoinData = async () => {
    const apiUrl = `/api/v1/cryptocurrency/info?id=${coinId}`; // 使用相对路径

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
      console.log('Coin Data:', data); // 添加日志输出
      setCoinData(data.data[coinId]);
    } catch (error) {
      console.error('Error fetching coin data:', error);
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, [currency, coinId]);

  const getPrice = (id) => {
    const coin = cryptoPrices.find((crypto) => crypto.id === id);
    if (!coin || !coin.quote || !coin.quote[currency.name.toUpperCase()]) {
      return 'N/A'; // 确保返回一个默认值
    }
    const price = coin.quote[currency.name.toUpperCase()].price;
    console.log(`Price for ${id}:`, price); // 添加日志输出检查价格
    return price;
  };

  const safeGet = (obj, path, defaultValue = 'N/A') => {
    return path.reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  };

  if (coinData) {
    return (
      <div className="coin">
        <div className="coin-name">
          <img src={coinData.logo} alt={`${coinData.name} logo`} />
          <p><b>{coinData.name} ({coinData.symbol.toUpperCase()})</b></p>
        </div>
        <div className="coin-info">
          <ul>
            <li>Crypto Market Rank</li>
            <li>{coinData.cmc_rank}</li>
          </ul>
          <ul>
            <li>Crypto Price</li>
            <li>{currency.symbol}{getPrice(coinId)}</li>
          </ul>
          <ul>
            <li>Market cap</li>
            <li>{currency.symbol}{safeGet(coinData, ['market_data', 'market_cap'])}</li>
          </ul>
          <ul>
            <li>24 Hour high</li>
            <li>{currency.symbol}{safeGet(coinData, ['market_data', 'high_24h'])}</li>
          </ul>
          <ul>
            <li>24 Hour low</li>
            <li>{currency.symbol}{safeGet(coinData, ['market_data', 'low_24h'])}</li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    );
  }
};

export default Coin;
