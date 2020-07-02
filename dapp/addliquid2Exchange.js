/*
** This file will add ETH-GYEN token liquidity to Uniswap V1 Exchange.
** ETH        -> 1ETH
** GYEN token -> 200GYEN
** NOTE: You need to first approve EX contract to tranfer you GYEN token first.
*/

const ethers = require('ethers');
const fs = require('fs');
let Web3 = require('web3-utils');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const dotenv = require('dotenv');
const config = dotenv.config(); 

const provider =  new ethers.providers.JsonRpcProvider("https://ropsten.infura.io/v3/<id>");// please use your own id here.
const privateKey = '0x...'; // please give your own private key here

let wallet = new ethers.Wallet(privateKey, provider);
//console.log(wallet.address);


const addliquidEX = async ()=> {

    const abi = await readFile('./contracts/exchange.abi',{encoding: 'utf8'});
    //const contractAddress = "0xA8c30d5aDC3dcF9886b4f9FD4328A0622AeF0584";
    const contractAddress = process.env.EXV1_CONTRACT;
  
    let overrides = {
      gasLimit: 2300000,
      gasPrice: ethers.utils.parseUnits('20', 'gwei'),
      value: ethers.utils.parseEther("1"),
    };

    //contract
    const callcontract = new ethers.Contract(
      contractAddress,
      abi,
      wallet
    );
  
    let deadline = Date.UTC(2020,9,1);

    let  result = await callcontract.addLiquidity(
      ethers.utils.parseEther("0.0001"),
      ethers.utils.parseEther("200"),
      ethers.utils.bigNumberify(deadline),
      overrides
    );
  
    console.log(result)
  
    /*
    // Use this you can predict the ETH you get with swaping tokens

    let token = ethers.utils.parseEther("20");
    let result = await callcontract.getTokenToEthInputPrice(token);
    console.log(result.toString());
    console.log(Web3.fromWei(result.toString(), 'ether'));
    */
  }
  
  addliquidEX();
  