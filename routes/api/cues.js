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
const SportTokenAddress = process.env.SPORT_TOKEN_ADDRESS;
const EsgTokenAddress = process.env.ESG_TOKEN_ADDRESS;
const NFTcontractABI = require('../../abi/NFT.json');
const MarketcontractABI = require('../../abi/Marketplace.json');
const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.WebsocketProvider(infuraKey));
const MarketContract = new web3.eth.Contract(MarketcontractABI,MarketcontractAddress);
const TokenContract = new web3.eth.Contract(NFTcontractABI,NFTcontractAddress);
var minABI = [
  // balanceOf
  {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
  }
];
var sportContract = new web3.eth.Contract(minABI, SportTokenAddress);
var esgContract = new web3.eth.Contract(minABI, EsgTokenAddress);
router.get('/fetchNftDetails', async function(req, res) {
  let gameType = req.body.gameType;
  let NFTType = req.body.NFTType;
  var ID  = parseInt(req.body.Id);
  if(gameType == null || NFTType == null || ID == null){
    res.send("{}");
  }
  else{
    if(gameType.trim().toLowerCase() == "pool"){
      if(NFTType.trim().toLowerCase() == "cue"){
        if(ID > 0){
          try{
            let resVal =await TokenContract.methods.tokenURI(ID).call();
            let resJson = await axios.get(resVal);
            res.send(JSON.stringify(resJson.data));
          }
          catch{
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
    }
    else{
      res.send("{}");
    }
  }
  
   
});

router.get('/fetchNFTList', async function(req, res) {
  let gameType = req.body.gameType;
  let NFTType = req.body.NFTType;
  var address  = req.body.address;
  if(gameType == null || NFTType == null||address == null){
    res.send("{}");
  }
  else{
    if(gameType.trim().toLowerCase() == "pool"){
      if(NFTType.trim().toLowerCase() == "cue"){
        if(address.length == 42 && address.substring(0,2) == "0x"){
          try{
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
          catch{
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
    }
    else{
      res.send("{}");
    }
  }
  
});

router.get('/getETHBalance', async function(req, res) {
  var address  = req.body.address;
  if(address == null){
    res.send("{}");
  }
  else{
    if(address.length == 42 && address.substring(0,2) == "0x"){
      try{
        let resVal =await web3.eth.getBalance(req.body.address);
        let realETHVal = Number(resVal)/10**18;
        res.send(String(realETHVal));
      }
      catch{
        res.send("{}");
      }    
    }
    else{
      res.send("{}");
    }
  }
  
});

router.get('/getSPORTBalance', async function(req, res) {
  var address  = req.body.address;
  if(address == null){
    res.send("{}");
  }
  else{
    if(address.length == 42 && address.substring(0,2) == "0x"){
      try{
        let resVal =await sportContract.methods.balanceOf(req.body.address).call();
        let realSportVal = Number(resVal)/10**9;
        res.send(String(realSportVal));
      }
      catch{
        res.send("{}");
      }
      
    }
    else{
      res.send("{}");
    }
  }
  
});

router.get('/getESGBalance', async function(req, res) {
  var address  = req.body.address;
  if(address == null){
    res.send("{}");
  }
  else{
    if(address.length == 42 && address.substring(0,2) == "0x"){
      try{
        let resVal =await esgContract.methods.balanceOf(req.body.address).call();
        let realEsgVal = Number(resVal)/10**9;
        res.send(String(realEsgVal));
      }
      catch{
        res.send("{}");
      }      
    }
    else{
      res.send("{}");
    }
  }
  
});


module.exports = router;