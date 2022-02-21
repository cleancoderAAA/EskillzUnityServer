const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const { ethers } = require('ethers');
const { useState } = require('react');
require('dotenv').config();
const infuraKey = process.env.REACT_INFURA_KEY;
const NFTcontractAddress = process.env.NFT_CONTRACT_ADDRESS;
const MarketcontractAddress = process.env.MARKET_CONTRACT_ADDRESS;
const NFTcontractABI = require('../../abi/NFT.json');
const MarketcontractABI = require('../../abi/Marketplace.json');
const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.WebsocketProvider(infuraKey));
const MarketContract = new web3.eth.Contract(MarketcontractABI,MarketcontractAddress);
const TokenContract = new web3.eth.Contract(NFTcontractABI,NFTcontractAddress);

router.get('/getTokenURI', async function(req, res) {
  let resVal =await TokenContract.methods.tokenURI(req.body.Id).call();
  res.send(resVal);
});

router.get('/fetchOfOwner', async function(req, res) {
  let resVal =await MarketContract.methods.fetchAllItemsOfOwner(req.body.address).call();
  const items = await Promise.all(resVal.map(async i => {
    let item = {
      // itemId: i.itemId,
      lastPrice: i.lastPrice,
      lastSeller: i.lastSeller,
      // nftContract: i.nftContract,
      onSale: i.onSale,
      owner: i.owner,
      prevOwners: i.prevOwners,
      price: i.price,
      tokenId: i.tokenId      
    }
    return item
  })) 
  res.send(items);
});

router.get('/getBalance', async function(req, res) {
  let resVal =await web3.eth.getBalance(req.body.address);
  res.send(resVal);
});


module.exports = router;