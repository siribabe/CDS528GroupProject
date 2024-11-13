// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.28;

// Import Chainlink's Price Feed interface
interface AggregatorV3Interface {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

// Import Chainlink's Keeper interface
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

// Import OpenZeppelin's Ownable contract for ownership management
abstract contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// Contract Name: CryptoPriceTracker
contract CryptoPriceTracker is Ownable, KeeperCompatibleInterface {
    // Price data structure that stores price and timestamp
    struct PriceData {
        uint256 price;      // Price
        uint256 timestamp;  // Timestamp
    }

    PriceData[] public priceRecords;                             // Stores all price records
    mapping(address => uint256) public userPriceAlerts;         // Stores user price alert thresholds
    AggregatorV3Interface internal priceFeed;                   // Chainlink price feed contract instance

    // Events for price updates and triggered price alerts
    event PriceUpdated(uint256 price, uint256 timestamp);      // Event: Price updated
    event PriceAlertTriggered(address indexed user, uint256 price, uint256 timestamp); // Event: Price alert triggered

    uint256 public lastUpdateTime;                              // Timestamp of the last price update
    uint256 public updateInterval = 600;                        // Update interval (10 minutes)

    constructor(address _priceFeedAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);   // Initialize the price feed contract address
        lastUpdateTime = block.timestamp;                        // Set the initial update timestamp
    }

    // Fetches the latest price and stores it
    function getLatestPriceAndStore() public returns (uint256 price, uint256 timestamp) {
        (, int priceFromFeed, , uint256 timeStampFromFeed, ) = priceFeed.latestRoundData(); // Get latest price from the feed
        require(priceFromFeed >= 0, "Price must be non-negative"); // Ensure the price is non-negative

        // Store price record
        priceRecords.push(PriceData(uint256(priceFromFeed), timeStampFromFeed)); // Store price and timestamp in the records array

        // Trigger event to log the price update
        emit PriceUpdated(uint256(priceFromFeed), timeStampFromFeed); // Emit price updated event

        return (uint256(priceFromFeed), timeStampFromFeed); // Return price and timestamp
    }

    // Updates the price data and triggers an event
    function updatePrice() public {
        (uint256 price, uint256 timestamp) = getLatestPriceAndStore(); // Fetch the latest price and store it

        require(price > 0, "Price must be greater than zero"); // Ensure the price is greater than zero

        uint256 userAlertPrice = userPriceAlerts[msg.sender]; // Get the user's price alert threshold
        if (userAlertPrice > 0 && price >= userAlertPrice) {
            emit PriceAlertTriggered(msg.sender, price, timestamp); // Trigger price alert event if threshold is reached
        }
    }

    // Sets a price alert for the user
    function setPriceAlert(uint256 alertPrice) public {
        require(alertPrice > 0, "Alert price must be greater than zero"); // Ensure alert price is greater than zero
        userPriceAlerts[msg.sender] = alertPrice; // Set user's price alert threshold
    }

    // Returns the price history
    function getPriceHistory() public view returns (PriceData[] memory) {
        return priceRecords; // Return the array of price records
    }

    // Retrieves the price at a specific timestamp
    function getPriceAtTimestamp(uint256 timestamp) public view returns (uint256 price, uint256 foundTimestamp) {
        for (uint256 i = 0; i < priceRecords.length; i++) {
            if (priceRecords[i].timestamp == timestamp) {
                return (priceRecords[i].price, priceRecords[i].timestamp); // Return the price and timestamp if found
            }
        }
        revert("Price not found at the specified timestamp"); // Revert if no price is found for the given timestamp
    }

    // Retrieves the timestamp at a specific price value
    function getTimestampAtValue(uint256 price) public view returns (uint256 timestamp) {
        for (uint256 i = 0; i < priceRecords.length; i++) {
            if (priceRecords[i].price == price) {
                return priceRecords[i].timestamp; // Return the timestamp if the price matches
            }
        }
        revert("Timestamp not found for the specified value"); // Revert if no timestamp is found for the given price
    }

    // Checks if upkeep (price update) is needed
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool, bytes memory) {
        bool upkeepNeeded = (block.timestamp - lastUpdateTime) > updateInterval; // Check if the update interval has passed
        return (upkeepNeeded, ""); // Return whether upkeep is needed
    }

    // Performs the price update if needed
    function performUpkeep(bytes calldata /* performData */) external override {
        require((block.timestamp - lastUpdateTime) > updateInterval, "Upkeep not needed"); // Ensure upkeep is needed
        lastUpdateTime = block.timestamp; // Update the last update timestamp

        updatePrice(); // Perform the price update
    }
}
