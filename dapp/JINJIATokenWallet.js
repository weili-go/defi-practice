/*
** This wallet can interact with  SENSOJI contract and JINJAToken contract.
** Ropsten network will be used.
*/
const ethers = require('ethers');
const fs = require('fs');
const Web3 = require('web3-utils');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const readlineSync = require('readline-sync');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const dotenv = require('dotenv');
const config = dotenv.config(); 

const provider =  new ethers.providers.JsonRpcProvider("https://ropsten.infura.io/v3/<id>"); //Please use your id here.

let overrides = {
    // The maximum units of gas for the transaction to use
    gasLimit: 2300000,
    // The price (in wei) per unit of gas
    gasPrice: ethers.utils.parseUnits('20', 'gwei'),
};

let wallet = undefined;

const createWalet = async ()=> {
    const randomWallet = ethers.Wallet.createRandom();
    const _wallet1 = ethers.Wallet.fromMnemonic(randomWallet.signingKey.mnemonic);
    console.log("Wallet Address: ", _wallet1.address);
    qrcode.generate(_wallet1.address, { small: true });
    console.log("Wallet Private Key(Note!Strictly CConfidential): ",_wallet1.privateKey);
    console.log("Mnemonic(Note!Strictly CConfidential) :",randomWallet.signingKey.mnemonic);
}

const unlockWalletWithPKey = async (pkey)=> {
    const privateKey = pkey;
    wallet = new ethers.Wallet(privateKey, provider);
    console.log("This Wallet Address will be used: ",wallet.address);
}

const sendJINJAToken = async (to, amountt, messaget)=> {
    const abi = await readFile('./contracts/JINJAToken.abi',{encoding: 'utf8'});
    const contractAddress = process.env.JINJA_CONTRACT;
    //JINJAToken contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    //const message = 'GMO太郎：2020年世界が平和になりますように.2020年世界が平和になりますように.2020/01/01';
    const message = messaget;
    // UTF8String to HexData
    let data = Web3.utf8ToHex(message);
    //console.log(data);
    // HexData to UTF8String
    //let ss = Web3.hexToUtf8(data);
    //console.log(ss);

    const amount = ethers.utils.parseEther(amountt).toString();
    //console.log(amount)

    let result = await callcontract.send(
        to,
        amount,
        data,
        overrides
    );
    console.log("Success.Transaction Hash: ",chalk.blueBright(result.hash));
}


const flashSwap = async (t1,t2,minEth)=> {
    const artifact = require('./contracts/pair.json');
    const abi_pair = artifact.abi;
    const contractAddress_pair = process.env.PAIR_CONTRACT
  
    //Uniswap V2 pair contract
    const callcontract = new ethers.Contract(
      contractAddress_pair,
      abi_pair,
      wallet
    );
  
    const flashswapaddress = process.env.FLASHSWAP_CONTRACT
    let abiCoder = ethers.utils.defaultAbiCoder;
    let tmpwei = ethers.utils.parseEther(minEth).toString();
    let data = abiCoder.encode(["uint"], [`${tmpwei}`]);
    //console.log(data);
  
    let result = await callcontract.swap(
      ethers.utils.parseEther(t1),
      ethers.utils.parseEther(t2),
      flashswapaddress,
      data,
      overrides
    );
  
    console.log("Success.Transaction Hash: ",chalk.blueBright(result.hash));
}

const getGiverSS = async ()=> {
    const abi = await readFile('./contracts/sensoji.abi',{encoding: 'utf8'});
    const contractAddress = process.env.SENSOJI_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let balance = await callcontract.getGiverSS(wallet.address);

    const result = Web3.fromWei(balance.toString(), 'ether');
	console.log("The SAISEN you had sent to SENSOJI is ", chalk.greenBright(`${result} JINJA`));
}

const getGiverMessage = async ()=> {
    const abi = await readFile('./contracts/sensoji.abi',{encoding: 'utf8'});
    const contractAddress = process.env.SENSOJI_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let data = await callcontract.getGiverMessage(wallet.address);
    let ss = Web3.hexToUtf8(data);
    console.log('願うこと/Message: ', chalk.magentaBright(ss));
}

const getPersonAmount = async ()=> {
    const abi = await readFile('./contracts/sensoji.abi',{encoding: 'utf8'});
    const contractAddress = process.env.SENSOJI_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let account = await callcontract.getPersonAmount();
    console.log('The Account of Person sent JINJA token to SENSOJI are ', chalk.redBright(account.toString()));
}

const getSAISENAmount = async ()=> {
    const abi = await readFile('./contracts/sensoji.abi',{encoding: 'utf8'});
    const contractAddress = process.env.SENSOJI_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let all = await callcontract.getSAISENAmount();
    const result = Web3.fromWei(all.toString(), 'ether');
	console.log("All SAISEN are: ", chalk.greenBright(`${result} JINJA`));
}

const withdraw = async ()=> {
    const abi = await readFile('./contracts/sensoji.abi',{encoding: 'utf8'});
    const contractAddress = process.env.SENSOJI_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let result = await callcontract.withdraw();
    console.log("Success.Transaction Hash: ",chalk.blueBright(result.hash));
}

const setBlack = async (bladdres,b)=> {
    const abi = await readFile('./contracts/sensoji.abi',{encoding: 'utf8'});
    const contractAddress = process.env.SENSOJI_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let result = await callcontract.setBlack(bladdres,b);
    console.log("Success.Transaction Hash: ",chalk.blueBright(result.hash));
}

const getJJBalance = async ()=> {
    const abi = await readFile('./contracts/JINJAToken.abi',{encoding: 'utf8'});
    const contractAddress = process.env.JINJA_CONTRACT;
    //SENSOJI contract
    const callcontract = new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );

    let balance = await callcontract.balanceOf(wallet.address);

    const result = Web3.fromWei(balance.toString(), 'ether');
	console.log("JINJA Token Balance: ", chalk.greenBright(`${result} JINJA`));
}

const getETHBalance = async ()=> {
    let balance = await provider.getBalance(wallet.address);
    const result = Web3.fromWei(balance.toString(), 'ether');
	console.log("ETH Balance: ", chalk.redBright(`${result} ETH`));
}


const main = async ()=> {
    const walletSelections = ["User Mode","Manager Mode"];
    const modeIdx = readlineSync.keyInSelect(walletSelections, 'Select Mode: ');
    switch (walletSelections[modeIdx]) {
        //for general users
        case "User Mode": {
            const walletSubSelections = ["Create Wallet","Send JINJA Token", 
            "Get My message to SENSOJI", "Get My SAISEN to SENSOJI", "Get JINJA token balance",
            "Get My ETH balance", "FlashSwap"];

            const taskIdx = readlineSync.keyInSelect(walletSubSelections, 'Select Task: ');

            switch (walletSubSelections[taskIdx]) {
                case "Create Wallet": {
                    await createWalet();
                    break;
                }
                case "Send JINJA Token": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    const to = readlineSync.question('Input to address: ');
                    const amount = readlineSync.question('Input amount: ');
                    const message = readlineSync.question('Input message: ');
                    await sendJINJAToken(to,amount,message);
                    break;
                }
                case "Get My SAISEN to SENSOJI": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    await getGiverSS();
                    break;
                }
                case "Get My message to SENSOJI": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    await getGiverMessage();
                    break;
                }
                case "Get JINJA token balance": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    await getJJBalance();
                    break;
                }
                case "Get My ETH balance": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    await getETHBalance();
                    break;
                }
                case "FlashSwap": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    const t1 = readlineSync.question('Input Token1 amount: ');
                    const t2 = readlineSync.question('Input Token2 amount: ');
                    const minEth = readlineSync.question('Input minimum ETH amount from Uniswap V1: ');
                    await flashSwap(t1,t2,minEth);
                    break;
                }                
                default: {
                    break;
                }
            }

            console.log(chalk.yellowBright("Exit User Mode"));
            break;
        }
        //for JINJA manager
        case "Manager Mode": {
            const walletSubSelections = ["Set Black Wallet","Cancel Black Wallet",
            "Get person amount","Get SAISEN amount","Withdraw the SAISEN"];

            const taskIdx = readlineSync.keyInSelect(walletSubSelections, 'Select Task: ');

            switch (walletSubSelections[taskIdx]) {
                case "Set Black Wallet": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    const blackaddress = readlineSync.question('Input black address: ');
                    await setBlack(blackaddress,true);
                    break;
                }
                case "Cancel Black Wallet": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    const blackaddress = readlineSync.question('Input black address to be canceled: ');
                    await setBlack(blackaddress,false);
                    break;
                }
                case "Get person amount": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);
                    await getPersonAmount();
                    break;
                }
                case "Get SAISEN amount": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);

                    await getSAISENAmount();
                    break;
                }     
                case "Withdraw the SAISEN": {
                    const pkey = readlineSync.question('Input Private Key to Unlock wallet(Just for test): ');
                    await unlockWalletWithPKey(pkey);

                    await withdraw();
                    break;
                }           
                default: {
                    break;
                }
            }
            console.log(chalk.yellowBright("Exit Manager Mode"));
            break;
        }
        default: {
            console.log(chalk.yellowBright("Exit Wallet"));
            return;
        }
    }
}

main();