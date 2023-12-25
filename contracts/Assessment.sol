// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event LandBought(address buyer, uint256 landId, uint256 cost);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        emit Withdraw(_withdrawAmount);
    }

    function concatenateStrings(string memory _str1, string memory _str2) public pure returns (string memory) {
        // Concatenate two strings
        return string(abi.encodePacked(_str1, _str2));
    }

    function buyLand(uint256 _landId, uint256 _cost) public {
        require(_cost > 0, "Cost must be greater than zero");
        require(balance >= _cost, "Insufficient funds to buy the land");

        // Perform land purchase logic here

        // Deduct the cost from the balance
        balance -= _cost;

        // Emit the event
        emit LandBought(msg.sender, _landId, _cost);
    }
}
