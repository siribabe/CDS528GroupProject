import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import fetchCryptoPrices from '../../fetchCryptoPrices'; // 确保路径正确

const CoinDetail = () => {
  const { id } = useParams();
  const [coinDetail, setCoinDetail] = useState(null);

  useEffect(() => {
    const apiKey = '5d015bee-a30f-489d-a1ca-6d77f642a9d8';

    const getCoinDetail = async () => {
      try {
        const prices = await fetchCryptoPrices(apiKey);
        const coin = prices.find(crypto => crypto.id === id);
        setCoinDetail(coin);
      } catch (error) {
        console.error('Error fetching coin detail:', error);
      }
    };

    getCoinDetail();
  }, [id]);

  if (!coinDetail) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{coinDetail.name} ({coinDetail.symbol.toUpperCase()})</h1>
      <p>Current Price: {coinDetail.quote.USD.price.toLocaleString()}</p>
      {/* 添加更多细节和趋势图表 */}
    </div>
  );
};

export default CoinDetail;
