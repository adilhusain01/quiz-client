// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFT {
    string public name = "VIBE";
    string public symbol = "VIBE";
    string public imageURL = "https://ipfs.io/ipfs/QmZXq9UQpY4VzTHyFrwEwPRiiMHiGmZrMjjvTr7jrdXkpe/"; 
    uint256 public nextTokenId;

    struct Token {
        string participantName;
        string quizCreatorName;
        string quizName;
    }

    mapping(uint256 => Token) public tokens;
    mapping(uint256 => address) public tokenOwners; // Mapping token ID to owner address

    event Mint(address indexed to, uint256 tokenId, string participantName, string quizCreatorName, string quizName);
    event TransferAttempt(address indexed from, address indexed to, uint256 tokenId);

    // Mint a new Soulbound NFT by anyone
    function mint(address to, string memory participantName, string memory quizCreatorName, string memory quizName) external {
        uint256 tokenId = nextTokenId;
        tokens[tokenId] = Token(participantName, quizCreatorName, quizName);
        tokenOwners[tokenId] = to; // Set the owner of the token

        emit Mint(to, tokenId, participantName, quizCreatorName, quizName);
        nextTokenId++;
    }

    // Get token details
    function getTokenDetails(uint256 tokenId) external view returns (string memory participantName, string memory quizCreatorName, string memory quizName, string memory imageUrl) {
        Token memory token = tokens[tokenId];
        return (token.participantName, token.quizCreatorName, token.quizName, imageURL);
    }

    // Overriding the transfer function to make the NFT Soulbound (non-transferable)
    function transferFrom(address from, address to, uint256 tokenId) external {
        emit TransferAttempt(from, to, tokenId);
        revert("This NFT is soulbound and cannot be transferred.");
    }

    // Prevent approval of the NFT
    function approve(address to, uint256 tokenId) external {
        revert("This NFT is soulbound and cannot be approved for transfer.");
    }

    // Prevent approval for all
    function setApprovalForAll(address operator, bool approved) external {
        revert("This NFT is soulbound and cannot be approved for transfer.");
    }

    // Get the owner of a token
    function ownerOf(uint256 tokenId) external view returns (address) {
        return tokenOwners[tokenId]; // Return the owner from the tokenOwners mapping
    }
}
