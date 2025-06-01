// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Event to record feedback submission details
event FeedbackSubmitted(string ipfsCid, string category, uint256 timestamp);

contract FeedbackPayment {
    error NotOwner();
    error IncorrectAmount();

    mapping(address => bool) public hasPaid;
    address immutable owner;

    constructor(){
        owner = msg.sender; 
    }
 
    function pay() external payable {
        if (msg.value < 0.0003935 ether){
            revert IncorrectAmount();
        }
        hasPaid[msg.sender] = true;
    }

    function withdraw() public {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success);
    }

    /**
     * @notice Records feedback details on-chain by emitting an event.
     * This function is intended to be called by the backend after successfully
     * uploading feedback to IPFS via Pinata.
     * @param ipfsCid The IPFS Content Identifier (CID) of the feedback data.
     * @param category The category of the feedback.
     */
    function recordFeedback(string memory ipfsCid, string memory category) external {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        emit FeedbackSubmitted(ipfsCid, category, block.timestamp);
    }

    fallback() external payable {}
    receive() external payable {}
}
