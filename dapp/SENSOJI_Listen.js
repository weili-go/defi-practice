/*
** This file will add listen JINJA token sent to SENSOJI contract.
*/

const ethers = require('ethers');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
let Web3 = require('web3-utils');
const chalk = require('chalk');
const dotenv = require('dotenv');
const config = dotenv.config(); 
const provider = ethers.getDefaultProvider('ropsten');

const SENSOJI_Listening = async ()=> {
  const abi = await readFile('./contracts/JINJAToken.abi',{encoding: 'utf8'});
  const contractAddress = process.env.JINJA_CONTRACT;
  const sensoji = process.env.SENSOJI_CONTRACT;
  const contract = new ethers.Contract(contractAddress, abi, provider);

  contract.on("Sent", (operator,from, to, amount, data,operatorData,event) => {
    //Just listen the Sent event of SENSOJI contract
    if (sensoji.toLowerCase() == to.toLowerCase()) {

      console.log(chalk.yellow("***********************************************************************"))
      console.log('from: ', chalk.cyanBright(from));
      console.log('to: ', chalk.greenBright(to));
      console.log('blockNumber: ', chalk.redBright(event.blockNumber));

      let tmp = amount.toString();
      tmp = Web3.fromWei(tmp, 'ether');
      console.log('amount: ', chalk.cyanBright(`${tmp} JINJA`));

      let ss = Web3.hexToUtf8(data);
      console.log('願うこと/Message:\n');

      let message = ss.split("|");//改行で表示する
      message.map((item) => {
        console.log("    ",chalk.magentaBright(item));
      });

      console.log(chalk.yellow("***********************************************************************"));
      console.log("\n\n");
    }
    else{
      //Do what you want here.
    }

  });
};

SENSOJI_Listening().catch(console.log);