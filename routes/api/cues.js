const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const { ethers } = require('ethers');
const { useState } = require('react');
require('dotenv').config();
const IpfsHttpClient = require("ipfs-http-client");
const ipfsC = IpfsHttpClient.create({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});
const IPFS = require('ipfs-core');

const infuraKey = process.env.REACT_INFURA_KEY;
const NFTcontractAddress = process.env.NFT_CONTRACT_ADDRESS;
const MarketcontractAddress = process.env.MARKET_CONTRACT_ADDRESS;
const CARDNFTcontractAddress = process.env.CARD_NFT_CONTRACT_ADDRESS;
const CARDMarketcontractAddress = process.env.CARD_MARKET_CONTRACT_ADDRESS;
const SportTokenAddress = process.env.SPORT_TOKEN_ADDRESS;
const EsgTokenAddress = process.env.ESG_TOKEN_ADDRESS;
const NFTcontractABI = require('../../abi/NFT.json');
const MarketcontractABI = require('../../abi/Marketplace.json');
const CardNFTcontractABI = require('../../abi/NFT_CARD.json');
const CardMarketcontractABI = require('../../abi/Marketplace_CARD.json');
const Web3 = require("web3");
if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
  console.log("undefined");
} else {
  var web3 = new Web3(new Web3.providers.HttpProvider(infuraKey));
  console.log("defined");
}
//let web3 = new Web3(new Web3.providers.WebsocketProvider(infuraKey));
const MarketContract = new web3.eth.Contract(MarketcontractABI,MarketcontractAddress);
const TokenContract = new web3.eth.Contract(NFTcontractABI,NFTcontractAddress);
const CardMarketContract = new web3.eth.Contract(CardMarketcontractABI,CARDMarketcontractAddress);
const CardTokenContract = new web3.eth.Contract(CardNFTcontractABI,CARDNFTcontractAddress);
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
router.post('/fetchNftDetails', async function(req, res) {
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
      else if(NFTType.trim().toLowerCase() == "card"){
        if(ID > 0){
          try{
            let resVal =await CardTokenContract.methods.tokenURI(ID).call();
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

router.post('/getUpdatedTokenURI', async function(req, res) {

  let gameType = req.body.gameType;
  let NFTType = req.body.NFTType;
  var ID  = parseInt(req.body.Id);
  let level = req.body.level;
  let yieldBonus = req.body.yieldBonus;
  let strength = req.body.strength;
  let accuracy = req.body.accuracy;
  let control = req.body.control;
  let freeItemDropChance = req.body.freeItemDropChance;

  const metadata = new Object();
  if(gameType == null || NFTType == null || ID == null){
    res.send("{}");
  }
  else{
    if(gameType.trim().toLowerCase() == "pool"){
      if(NFTType.trim().toLowerCase() == "cue"){
        if(ID > 0){
          try{
            let resVal =await TokenContract.methods.tokenURI(ID).call();
            let origin = await axios.get(resVal);            
            metadata.name = origin.data.name;
            metadata.image_url = origin.data.image_url;
            metadata.description = origin.data.description;  
            if(level !=null){
              metadata.level = level;
            }
            else{
              if(origin.data.level !=null){
                metadata.level = origin.data.level;
              }
              else{
                metadata.level = "0";
              }
            }
            if(strength !=null){
              metadata.strength = strength;
            }
            else{
              if(origin.data.strength !=null){
                metadata.strength = origin.data.strength;
              }
              else{
                metadata.strength = "0";
              }              
            }
            if(accuracy !=null){
              metadata.accuracy = accuracy;
            }
            else{
              if(origin.data.accuracy !=null){
                metadata.accuracy = origin.data.accuracy;
              }
              else{
                metadata.accuracy = "0";
              } 
            }
            if(control !=null){
              metadata.control = control;
            }
            else{
              if(origin.data.control !=null){
                metadata.control = origin.data.control;
              }
              else{
                metadata.control = "0";
              } 
            }
            if(freeItemDropChance !=null){
              metadata.freeItemDropChance = freeItemDropChance;
            }
            else{
              if(origin.data.freeItemDropChance !=null){
                metadata.freeItemDropChance = origin.data.freeItemDropChance;
              }
              else{
                metadata.freeItemDropChance = "0";
              } 
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send("{}");         
            } 
            else{
              res.send(pinataResponse.pinataUrl); 
            }
          }
          catch{
            res.send("{}");
          }          
        }
        else{
          res.send("{}");
        }      
      }
      else if(NFTType.trim().toLowerCase() == "card"){
        if(ID > 0){
          try{
            let resVal =await CardTokenContract.methods.tokenURI(ID).call();
            let origin = await axios.get(resVal);            
            metadata.name = origin.data.name;
            metadata.image_url = origin.data.image_url;
            metadata.description = origin.data.description;  
            if(yieldBonus !=null){
              metadata.yieldBonus = yieldBonus;
            }
            else{
              if(origin.data.yieldBonus !=null){
                metadata.yieldBonus = origin.data.yieldBonus;
              }
              else{
                metadata.yieldBonus = "0";
              }
            }
            if(strength !=null){
              metadata.strength = strength;
            }
            else{
              if(origin.data.strength !=null){
                metadata.strength = origin.data.strength;
              }
              else{
                metadata.strength = "0";
              }              
            }
            if(accuracy !=null){
              metadata.accuracy = accuracy;
            }
            else{
              if(origin.data.accuracy !=null){
                metadata.accuracy = origin.data.accuracy;
              }
              else{
                metadata.accuracy = "0";
              } 
            }
            if(control !=null){
              metadata.control = control;
            }
            else{
              if(origin.data.control !=null){
                metadata.control = origin.data.control;
              }
              else{
                metadata.control = "0";
              } 
            }
            if(freeItemDropChance !=null){
              metadata.freeItemDropChance = freeItemDropChance;
            }
            else{
              if(origin.data.freeItemDropChance !=null){
                metadata.freeItemDropChance = origin.data.freeItemDropChance;
              }
              else{
                metadata.freeItemDropChance = "0";
              } 
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send("{}");         
            } 
            else{
              res.send(pinataResponse.pinataUrl); 
            }
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
  };    
});

router.post('/getTokenURI', async function(req, res) {

  let gameType = req.body.gameType;
  let NFTType = req.body.NFTType;
  let name = req.body.name;
  let description = req.body.description;
  let image_url = req.body.image_url;
  let level = req.body.level;
  let yieldBonus = req.body.yieldBonus;
  let strength = req.body.strength;
  let accuracy = req.body.accuracy;
  let control = req.body.control;
  let freeItemDropChance = req.body.freeItemDropChance;

  const metadata = new Object();
  if(gameType == null || NFTType == null){
    res.send("{}");
  }
  else{
    if(gameType.trim().toLowerCase() == "pool"){
      if(NFTType.trim().toLowerCase() == "cue"){
          try{  
            if(name !=null){
              metadata.name = name;
            }
            else{
              metadata.name = "";
            }   
            if(description !=null){
              metadata.description = description;
            }
            else{
              metadata.description = "";
            }                
            if(image_url !=null){
              metadata.image_url = image_url;
            }
            else{
              metadata.image_url = "";
            }
            if(level !=null){
              metadata.level = level;
            }
            else{
              metadata.level = "0";
            }
            if(strength !=null){
              metadata.strength = strength;
            }
            else{
              metadata.strength = "0";         
            }
            if(accuracy !=null){
              metadata.accuracy = accuracy;
            }
            else{
              metadata.accuracy = "0";
            }
            if(control !=null){
              metadata.control = control;
            }
            else{
              metadata.control = "0";
            }
            if(freeItemDropChance !=null){
              metadata.freeItemDropChance = freeItemDropChance;
            }
            else{
              metadata.freeItemDropChance = "0";
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send("{}");         
            } 
            else{
              res.send(pinataResponse.pinataUrl); 
            }
          }
          catch{
            res.send("{}");
          }          
             
      }
      else if(NFTType.trim().toLowerCase() == "card"){
          try{
              
            if(name !=null){
              metadata.name = name;
            }
            else{
              metadata.name = "";
            }   
            if(description !=null){
              metadata.description = description;
            }
            else{
              metadata.description = "";
            }                
            if(image_url !=null){
              metadata.image_url = image_url;
            }
            else{
              metadata.image_url = "";
            }
            if(yieldBonus !=null){
              metadata.yieldBonus = yieldBonus;
            }
            else{
              metadata.yieldBonus = "0";
            }
            if(strength !=null){
              metadata.strength = strength;
            }
            else{
              metadata.strength = "0";         
            }
            if(accuracy !=null){
              metadata.accuracy = accuracy;
            }
            else{
              metadata.accuracy = "0";
            }
            if(control !=null){
              metadata.control = control;
            }
            else{
              metadata.control = "0";
            }
            if(freeItemDropChance !=null){
              metadata.freeItemDropChance = freeItemDropChance;
            }
            else{
              metadata.freeItemDropChance = "0";
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send("{}");         
            } 
            else{
              res.send(pinataResponse.pinataUrl); 
            }
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
  };    
});

const pinJSONToIPFS = async(JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //making axios POST request to Pinata ⬇️
  return axios 
      .post(url, JSONBody, {
          headers: {
              pinata_api_key: "238047f870c7ab07af4b",
              pinata_secret_api_key: "1b57450a5dc199dd620cca759bf665c8abc323278469baf2368cb3d8372d9a6f",
          }
      })
      .then(function (response) {
         return {
             success: true,
             pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
         };
      })
      .catch(function (error) {
          console.log(error)
          return {
              success: false,
              message: error.message,
          }

      });
};

router.post('/fetchNFTList', async function(req, res) {
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
      else if(NFTType.trim().toLowerCase() == "card"){
        if(address.length == 42 && address.substring(0,2) == "0x"){
          try{
            let resVal =await CardMarketContract.methods.fetchAllItemsOfOwner(req.body.address).call();
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

router.post('/getETHBalance', async function(req, res) {
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

router.post('/getSPORTBalance', async function(req, res) {
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

router.post('/getESGBalance', async function(req, res) {
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