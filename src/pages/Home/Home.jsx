import React, { useContext, useEffect, useState } from "react";
import './Home.css';
import { CoinContext } from '../../context/CoinContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { allCoin, currency, cryptoPrices } = useContext(CoinContext);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState('');

  // 输入处理函数
  const inputHandler = (event) => {
    setInput(event.target.value);
    if (event.target.value === "") {
      setDisplayCoin(allCoin);
    }
  };

  // 搜索处理函数
  const searchHandler = async (event) => {
    event.preventDefault();
    const coins = allCoin.filter((coin) => 
      coin.name.toLowerCase().includes(input.toLowerCase())
    );
    console.log('Filtered Coins:', coins); // 添加日志输出检查过滤后的数据
    setDisplayCoin(coins);
  };

  // 数据初始化和更新
  useEffect(() => {
    if (allCoin.length > 0 && cryptoPrices.length > 0) { // 确保 allCoin 和 cryptoPrices 非空
      console.log('All Coin Data:', allCoin); // 检查 allCoin 数据是否正确
      console.log('Currency:', currency); // 检查 currency 数据是否正确
      console.log('Crypto Prices:', cryptoPrices); // 检查 cryptoPrices 数据是否正确
      setDisplayCoin(allCoin);
    }
  }, [allCoin, cryptoPrices]);

  // 获取加密货币价格的函数
  const getPrice = (id) => {
    const coin = cryptoPrices.find((crypto) => crypto.id === id);
    if (!coin || !coin.quote || !coin.quote[currency.name.toUpperCase()]) {
      return 'N/A'; // 确保返回一个默认值
    }
    const price = coin.quote[currency.name.toUpperCase()].price;
    console.log(`Price for ${id}:`, price); // 添加日志输出检查价格
    return price;
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>Largest <br />Crypto Marketplace</h1>
        <p>Welcome to the world's largest cryptocurrency marketplace. Sign up to explore more about cryptos</p>
        <form onSubmit={searchHandler}>
          <input 
            onChange={inputHandler} 
            list='coinlist' 
            value={input} 
            type="text" 
            placeholder='Search crypto..' 
            required 
          />
          <datalist id='coinlist'>
            {allCoin.map((coin, index) => (<option key={index} value={coin.name} />))}
          </datalist>
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
        </div>
        {displayCoin.slice(0, 10).map((coin, index) => {
          console.log('Rendering coin:', coin); // 确保 coin 变量存在
          return (
            <Link to={`/coin/${coin.id}`} className="table-layout" key={index}>
              <p>{coin.market_cap_rank}</p>
              <div>
                <p>{coin.name} - {coin.symbol}</p>
              </div>
              <p>{currency.symbol} {getPrice(coin.id) !== 'N/A' ? getPrice(coin.id).toLocaleString() : 'N/A'}</p>
              </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
