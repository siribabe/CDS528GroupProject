import React , { useState , useEffect} from "react";
import { ethers } from 'ethers';
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Coin from './pages/Coin/Coin';
import Footer from "./components/Footer/Footer";
import WalletCard from './WalletCard';
import data from './data.json'

// Smart contract address and ABI
const contractAddress = '0xd77a8d066d709919613843d9c351c2b9c10debc7'; // Replace with your contract address
const abi =[
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_priceFeedAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "getLatestPriceAndStore",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPriceHistory",
        "outputs": [
            {
                "internalType": "struct CryptoPriceTracker.PriceData[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "getPriceAtTimestamp",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "foundTimestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "getTimestampAtValue",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "updatePrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "alertPrice",
                "type": "uint256"
            }
        ],
        "name": "setPriceAlert",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "name": "performUpkeep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "checkData",
                "type": "bytes"
            }
        ],
        "name": "checkUpkeep",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const App = () => {
    const [account, setAccount] = useState(null);
    const [data, setData] = useState(null); // 用于存储读取的 JSON 数据
    const [searchPrice, setSearchPrice] = useState('');
    const [result, setResult] = useState('');
    const [contractCode, setContractCode] = useState('');
    const [searchTimestamp, setSearchTimestamp] = useState('');
    const [priceAtTimestamp, setPriceAtTimestamp] = useState(null);
    const [priceResult, setPriceResult] = useState('No Results Yet');








    const fetchData = async () => {
    try {
        const response = await fetch('/data.json'); // 确保路径正确
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        const jsonData = await response.json();
        console.log('读取的 JSON 数据:', jsonData);
        setData(jsonData); // 存储读取到的数据
    } catch (error) {
        console.error('读取数据时出错:', error);
        setErrorMessage('读取数据时出错，请查看控制台。');
    }
};




const fetchTimestampAtValue = async () => {
    try {
        // 确保 data 存在且有 posts 属性
        if (!data || !data.posts) {
            alert("本地数据未加载或格式不正确。");
            return;
        }

        // 查找与 searchPrice 匹配的价格
        const localData = data.posts.find(entry => {
            // 直接比较 entry.price 与 searchPrice
            return entry.price.toString() === searchPrice; // 确保都是字符串进行比较
        });

        // 如果找到相应的数据
        if (localData) {
            const formattedTimestamp = new Date(localData.timestamp * 1000).toLocaleString();
            setPriceResult(`价格 $${searchPrice} 的时间是 ${formattedTimestamp}`);
        } else {
            setPriceResult("本地数据中未找到对应的价格。");
        }
    } catch (error) {
        console.error("获取价格对应的时间时出错:", error);
        setPriceResult("获取价格对应的时间时出错，请查看控制台。");
    }
};

    const fetchPriceAtTimestamp = async () => {
        try {
            // 确保 data 存在且有 posts 属性
            if (!data || !data.posts) {
                alert("本地数据未加载或格式不正确。");
                return;
            }

            // 查找与 searchTimestamp 匹配的条目
            const localData = data.posts.find(entry => entry.timestamp === parseInt(searchTimestamp));

            // 如果找到相应的数据
            if (localData) {
                setPriceAtTimestamp(localData.price); // 直接使用原始价格
            } else {
                alert("本地数据中未找到对应的时间戳。");
            }
        } catch (error) {
            console.error("获取时间戳对应的价格时出错:", error);
            alert("获取时间戳对应的价格时出错，请查看控制台。");
        }
    };
    






  
    
    const analyzeContract = () => {
        let analysisResult = "";

        // 1. 检测重入攻击
        if (/\.call\.value\s*\(/.test(contractCode)) {
            analysisResult += "可能存在重入攻击风险。建议在调用外部合约之前更新内部状态。\n";
        }

        // 2. 检测整数溢出/下溢
        if (/\b(uint|int)\d*\s+\w+\s*=\s*\w+\s*[\+\-\*\/]\s*\w+/.test(contractCode) && !/safeMath/.test(contractCode)) {
            analysisResult += "检测到可能的整数溢出或下溢风险。建议使用 SafeMath 库进行安全的数学操作。\n";
        }

        // 3. 检测权限控制
        const publicFunctions = contractCode.match(/\bfunction\s+\w+\s*\(.*\)\s+public\b/g);
        if (publicFunctions) {
            publicFunctions.forEach(func => {
                if (!/onlyOwner|require\(.*msg\.sender/.test(func)) {
                    analysisResult += `函数 ${func.match(/\bfunction\s+(\w+)/)[1]} 可能缺少权限控制，建议添加 onlyOwner 或 require 条件。\n`;
                }
            });
        }

        // 4. 检测 tx.origin 用法
        if (/\btx\.origin\b/.test(contractCode)) {
            analysisResult += "检测到 tx.origin 用法，可能存在钓鱼攻击风险。建议使用 msg.sender 代替 tx.origin。\n";
        }

        // 5. 检测未使用的返回值
        if (/\.call\(/.test(contractCode) && !/require|assert|if\s*\(/.test(contractCode)) {
            analysisResult += "检测到外部调用未检查返回值，可能存在未处理的失败情况。建议在调用后检查返回值。\n";
        }

        // 如果没有检测到问题
        if (analysisResult === "") {
            analysisResult = "未检测到明显的漏洞。";
        }

        // 更新结果
        setResult(analysisResult);
    };

    useEffect(()=> {
        fetchData();
    },[]);
    

    return (
        <div className='app'>
          <Navbar />
          <WalletCard setDefaultAccount={setAccount} />
          <div className="info-display">
            <h1>ETH Price Tracker</h1>
      
            {/* 其他输入和按钮 */}
            <h2>Query Historical Prices by Time:</h2>
            <input
              type="text"
              value={searchTimestamp}
              onChange={(e) => setSearchTimestamp(e.target.value)}
              placeholder="Enter Timestamp (seconds)"
            />
            <button onClick={fetchPriceAtTimestamp}>Get Price for Timestamp</button>
            <h3>Queried Price: {priceAtTimestamp !== null ? `$${priceAtTimestamp}` : 'Not Queried Yet'}</h3>
      
            <h2>Query Corresponding Time by Price:</h2>
            <input
              type="text"
              value={searchPrice}
              onChange={(e) => setSearchPrice(e.target.value)}
              placeholder="Enter Price"
            />
            <button onClick={fetchTimestampAtValue}>Get Time for Price</button>
            <h3>Result: {priceResult}</h3>
      
            {/* 智能合约漏洞检测部分 - 包装在白色框内 */}
            <div className="contract-audit-box">
              <h4>Smart Contract Vulnerability Detection:</h4>
              <textarea
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="Paste Smart Contract Code Here..."
              />
                  <button onClick={analyzeContract}>Detect Vulnerabilities</button>
                  <h5>Result:  {result || 'No Results Yet'}</h5>
            </div>
          </div>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/coin/:coinId' element={<Coin />} />
          </Routes>
          <Footer />
        </div>
      );
    };  
  
export default App;
