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
  let gameType = req.body.gameType;
  let NFTType = req.body.NFTType;
  var ID  = parseInt(req.body.Id);
  if(gameType.trim().toLowerCase() == "pool"){
    if(NFTType.trim().toLowerCase() == "cue"){
      if(ID > 0){
        let resVal =await TokenContract.methods.tokenURI(ID).call();
        res.send(resVal);
      }
      else{
        res.send("{}");
      }      
    }
    else{
      res.send("{}");
    }
  }
  else{
    res.send("{}");
  }
   
});

router.get('/fetchOfOwner', async function(req, res) {
  let gameType = req.body.gameType;
  let NFTType = req.body.NFTType;
  var address  = req.body.address;
  if(gameType.trim().toLowerCase() == "pool"){
    if(NFTType.trim().toLowerCase() == "cue"){
      if(address.length == 42 && address.substring(0,2) == "0x"){
        let resVal =await MarketContract.methods.fetchAllItemsOfOwner(req.body.address).call();
        const items = await Promise.all(resVal.map(async i => {
          let item = {
            // itemId: i.itemId,
            lastPrice: i.lastPrice,
            lastSeller: i.lastSeller,
            NFTContractAddress: i.nftContract,
            onSale: i.onSale,
            owner: i.owner,
            prevOwners: i.prevOwners,
            price: i.price,
            tokenId: i.tokenId      
          }
          return item
        })) 
        res.send(items);
      }
      else{
        res.send("{}");
      }      
    }
    else{
      res.send("{}");
    }
  }
  else{
    res.send("{}");
  }
});

router.get('/getBalance', async function(req, res) {
  let resVal =await web3.eth.getBalance(req.body.address);
  res.send(resVal);
});


module.exports = router;