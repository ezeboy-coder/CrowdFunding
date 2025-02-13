// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Crowdfunding {
    struct Campaign {
        address creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalFunds;
        bool fundsReleased;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public backerContributions;
    uint256 public campaignCount;

    IERC20 public token;

    event CampaignCreated(uint256 campaignId, address creator, uint256 goal, uint256 deadline);
    event Funded(uint256 campaignId, address backer, uint256 amount);
    event FundsReleased(uint256 campaignId, uint256 amount);
    event Refunded(uint256 campaignId, address backer, uint256 amount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function createCampaign(uint256 _goal, uint256 _duration) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        uint256 deadline = block.timestamp + _duration;
        campaigns[campaignCount] = Campaign({
            creator: msg.sender,
            goal: _goal,
            deadline: deadline,
            totalFunds: 0,
            fundsReleased: false
        });
        emit CampaignCreated(campaignCount, msg.sender, _goal, deadline);
        campaignCount++;
    }

    function fundCampaign(uint256 _campaignId, uint256 _amount) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp <= campaign.deadline, "Campaign has ended");
        require(!campaign.fundsReleased, "Funds already released");

        token.transferFrom(msg.sender, address(this), _amount);
        campaign.totalFunds += _amount;
        backerContributions[_campaignId][msg.sender] += _amount;

        emit Funded(_campaignId, msg.sender, _amount);
    }

    function releaseFunds(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign is still active");
        require(campaign.totalFunds >= campaign.goal, "Goal not reached");
        require(!campaign.fundsReleased, "Funds already released");
        require(msg.sender == campaign.creator, "Only creator can release funds");

        campaign.fundsReleased = true;
        token.transfer(campaign.creator, campaign.totalFunds);

        emit FundsReleased(_campaignId, campaign.totalFunds);
    }

    function refund(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign is still active");
        require(campaign.totalFunds < campaign.goal, "Goal reached, no refunds");
        require(backerContributions[_campaignId][msg.sender] > 0, "No contribution to refund");

        uint256 refundAmount = backerContributions[_campaignId][msg.sender];
        backerContributions[_campaignId][msg.sender] = 0;
        token.transfer(msg.sender, refundAmount);

        emit Refunded(_campaignId, msg.sender, refundAmount);
    }
}