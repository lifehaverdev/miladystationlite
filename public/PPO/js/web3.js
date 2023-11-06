/*

 __ __ __   ______    _______   ______      
/_//_//_/\ /_____/\ /_______/\ /_____/\     
\:\\:\\:\ \\::::_\/_\::: _  \ \\:::_:\ \    
 \:\\:\\:\ \\:\/___/\\::\_)  \/_  /_\:\ \   
  \:\\:\\:\ \\::___\/_\::  _  \ \ \::_:\ \  
   \:\\:\\:\ \\:\____/\\::\_)  \ \/___\:\ ' 
    \_______\/ \_____\/ \_______\/\______/  
                                            
*/

const web3 = new Web3(Web3.givenProvider); 
const owner = '0x8BA1335998d6aAF38217B5B8A70EA48506b58D17';
const chainScanPre = 'https://goerli.arbiscan.io/address/';
var accounts = [];
var team;
var playerXP;
var found;
var fee;
var openBusiness;
var toteOpen;

const masterABI = [{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"readActivity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"readBook","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"readBusiness","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"game","type":"uint256"}],"name":"readDub","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"readFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"readLosses","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"readMaxBet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"game","type":"uint256"}],"name":"readSchedule","outputs":[{"components":[{"internalType":"address","name":"player0","type":"address"},{"internalType":"uint32","name":"char","type":"uint32"},{"internalType":"uint32","name":"stock","type":"uint32"},{"internalType":"bool","name":"a","type":"bool"},{"internalType":"bool","name":"w","type":"bool"},{"internalType":"bool[10]","name":"score","type":"bool[10]"},{"internalType":"uint256","name":"wager","type":"uint256"}],"internalType":"struct IPPOMaster.Game","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"readTote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"readWinnings","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"p","type":"address"},{"internalType":"uint32","name":"c","type":"uint32"},{"internalType":"uint32","name":"s","type":"uint32"},{"internalType":"uint32","name":"st","type":"uint32"},{"internalType":"uint256","name":"wager","type":"uint256"}],"name":"sponsor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]
const expABI = [{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint32","name":"","type":"uint32"},{"internalType":"uint32","name":"","type":"uint32"}],"name":"addValue","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"userName","type":"string"}],"name":"incorporate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"char","type":"uint32"},{"internalType":"string","name":"title","type":"string"}],"name":"knight","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"id","type":"address"}],"name":"readCanon","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"id","type":"address"},{"internalType":"uint32","name":"char","type":"uint32"}],"name":"readPackExp","outputs":[{"internalType":"uint32","name":"xp","type":"uint32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"readPlayers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"id","type":"address"}],"name":"readRegistrar","outputs":[{"internalType":"uint32[6]","name":"","type":"uint32[6]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"id","type":"address"},{"internalType":"uint32","name":"char","type":"uint32"}],"name":"readRoster","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"char","type":"uint32"}],"name":"readStats","outputs":[{"internalType":"uint256","name":"atk","type":"uint256"},{"internalType":"uint256","name":"def","type":"uint256"},{"internalType":"uint256","name":"spd","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32[6]","name":"","type":"uint32[6]"}],"name":"register","outputs":[],"stateMutability":"nonpayable","type":"function"}]
//const masterAdd = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
//const expAdd = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9"; test junk old script deploy
const expAdd = "0x587155305c898C363130D79c2068ec31329a1c98"; //arbitrum goerli foundry deploy 6
const masterAdd = "0x7863eCe6Ca2C15227f2B1A71d55d82d175915965"; //arbitrum goerli foundry deploy 5

const master = new web3.eth.Contract(masterABI, masterAdd);
const exp = new web3.eth.Contract(expABI, expAdd);

console.log('version 1');

//////////
// core //
//////////

connectWallet = async() => {
    playSprite('web3');
    console.log('you clicked connect')
    let connected = false;
    get('wallet-ask').innerHTML = `<img src="${assetPre}loading.gif" />`
    try {
        accounts = await web3.eth.requestAccounts().then()
        connected = true;
        console.log('we see this');
        onChained = true;
    } catch(err) {
        errorTell(err.message);
    }   
    if(connected){
        var networkId = await web3.eth.net.getId();
        //console.log(networkId);
        //if (networkId !== 31337) { foundry eth
        if(networkId !== 421613){ //arb goerli
        // Show an error message or take other appropriate action
            alert('change your network to arbitrum goerli','https://bridge.arbitrum.io/')
        }
        checkWallet();
    }
}

////////////
// battle //
////////////

arm = async() => {
    playSprite('web3');
    var BN = web3.utils.BN;
    get('fight').innerHTML = `<img src="./assets/loading.gif" />`
    let _value = 0;
    let _credit = 0;
    let _account = await readBook(accounts[0]);
    let bet = get('gamble');
    if(bet.value){
        bet = new BN(get('gamble').value);
        //console.log('Wager amount',bet.toString());
        if(bet.gt(_account)) {
            //console.log('value is greater than credit');
            _credit = _account;
            _value = bet.sub(_credit);
            //console.log('cost to send contract after subtracting credit',_value.toString());
        }else {
            _credit = bet;
            _value = BN(0);
        }
    } else {
        _value = BN(0);
    }
    let _max = new BN(await readMaxBet());
    //console.log('max bet',_max);
    if(_value.gt(_max)){
        alert(`no actually dont bet more than ${_max}`);
        get('fight').innerHTML = `FIGHT`
        return
    }
    if(_value.gt(_max.mul(new BN(4)))){
        alert('well well well mr money bags. SORRY you need to claim your balance before continuing to wager with us');
        playerBio();
        return
    }
    if(onChained){
        // Sending the transaction and listening for the event
        try{
            const tx = await master.methods.sponsor(accounts[0],character, arena, stocks, _credit).send({
                from: accounts[0],
                value: _value.add(new BN(fee))
            });
            // Get the transaction receipt to access the event logs
            const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
            //console.log('arm2 receipt ',receipt)
            // Filter the logs to find the event you emitted
            const armResultLog = receipt.logs.find((log) => log.topics[0] === web3.utils.keccak256('Fight(uint256,address,uint32,uint32,uint32,uint256)'));

            if (armResultLog) {
                const data = armResultLog.data; // Get the data field of the log
                const uint256Hex = "0x" + data.slice(2, 66); // Assuming the uint256 is 32 bytes (64 characters)
                const uint256Value = web3.utils.toBN(uint256Hex);
                var reqId = web3.utils.toBN(uint256Value); // Convert the data to a BigNumber
                reqId = reqId.toString();
                //console.log('reqId:', reqId);
            } else {
                console.log('Event not found or no result.');
                get('fight').innerHTML = "FIGHT";
            }
            go(reqId);
        } catch(err) {
            console.log('arm errror',err);
            get('fight').innerHTML = `FIGHT`;
        }


    } else {
        battle();
    }

}

go = async(id) => {
    //console.log('goin');
    //console.log('game id: ',id);
    let count = 0;
    wait();
    let checkInterval = setInterval(()=>{
        watch(id);
        if(found) {
            playSprite('fightStart');
            clearInterval(checkInterval);
            playSprite('applause');
            setTimeout(()=>{
                battle();
            },cadence.fight.applause)
            // found = false;
        }
        if(count > 20){
            clearInterval(checkInterval);
            mainMenu();
        }
        count++
    },5000);
}

watch = async(id) => {
    if(await checkGame(id)){
        stopMusics();
        playSprite('web3');
        //console.log('we got a live one');
        found = true;
    };
}

claim = async() => {
    try{
        await master.methods.claim().send({
            from: accounts[0]
        })
    } catch(err) {
        console.log('claim error: ',err);
    }

}

checkGame = async(id) => {
    let a = false;
    let game;
    const idBN = web3.utils.toBN(id);
    try {
        game = await readSchedule(idBN);
        a = game[3];
    } catch (err) {
        console.log('checkGame error ',err);
    }
    if(a) {
        loadScore(game[5]);
    }
    return a;
}

function loadScore(res) {
    score = new Array(stocks*2);
    for(let i = 0; i < score.length; i++){
        score[i] = res[i];
    }
    console.log('score',score);
}

///////////
// state //
///////////

checkWallet = async() => {
    playSprite('sparkle');
    walletPacks = await exp.methods.readRegistrar(accounts[0]).call()
    fee = await readFee();
    await readBusiness();
    await readTote();
    await getUserExp();
    console.log('team: ',walletPacks);
    mainMenu();
}

getUserExp = async() => {
    let xp = 0;
    for(let i = 0; i < 6; i++){
        // console.log('wallet packs',walletPacks[i])
        xp += parseInt(await readExp(accounts[0],walletPacks[i]));
    }
    console.log('user exp', xp);
    userXP = xp;
    return xp;
}

getExternalExp = async (address) => {
    let xp = 0;
    let team = await readRegistrar(address);
    for(let i = 0; i < 6; i++){
        xp += parseInt(await readExp(address,team[i]));
    }
    console.log('ext user exp',xp);
    return xp;
}

//////////////
// exp send //
//////////////

register = async() => {
    if(onChained){
        playSprite('web3');
        // Sending the transaction and listening for the event
        const tx = await exp.methods.register(walletPacks).send({
            from: accounts[0],
        });
        playSprite('web3');
        alert('please reload the game');
    }
}

incorporate = async() => {
    _name = get('canonized').value;
    if(onChained){
        await exp.methods.incorporate(_name).send({
            from: accounts[0]
        });
        playSprite('web3');
        alert('nice to meet you ',_name);
    }
}

////////////////////////
// EXP READ FUNCTIONS //
////////////////////////

readPlayers = async() => {
    try {
        return await exp.methods.readPlayers().call();
    } catch(err) {
        console.log('readPlayer error: ',err);
    }
}

readRoster = async(address,char) => {
    let _title;
    if(onChained){
        try{
            _title = await exp.methods.readRoster(address,char).call();
        } catch(err) {
            console.log('read roster error: ',err);
        }
        console.log('title for ',address,'pack ',char,':',_title);
        return _title;
    } else {
        return '';
    }
}

readExp = async(address,id) => {
    if(onChained){
        let xp = 0;
        try {
            xp = await exp.methods.readPackExp(address,id).call();
            // console.log('xp in checkExp',xp);
        } catch (err) {
            console.log(err);
        }
        return xp;
    } else {
        return 0;
    }
}

readStats = async(char) => {
    if(onChained){
        if(char > 0){
            try {
                return await exp.methods.readStats(char).call();
            } catch(err) {
                console.log('readStats error',err);
            }
        } else {
            return [0,0,0];
        }
    } else {
        return [0,0,0];
    }


}

readRegistrar = async(address) => {
    try {
        return await exp.methods.readRegistrar(address).call();
    } catch(err) {
        console.log('read regisrtrar err',err);
    }
}

readCanon = async(address) => {
    if(onChained){
        try {
            return await exp.methods.readCanon(address).call();
        } catch(err) {
            console.log('read canon err',err);
            return '';
        }
    }
}

/////////////////////////
// LVL1 READ FUNCTIONS //
/////////////////////////   

readBusiness = async() => {
    if(onChained) {
        try{
            open = await master.methods.readBusiness().call();
        } catch(err) {
            console.log('readBusiness error: ',err);
        }
        
    } else {
        return;
    }
}

readTote = async() => {
    if(onChained) {
        try{
            tote = await master.methods.readTote().call();
        } catch(err) {
            console.log('readTote error: ',err);
        }
        
    } else {
        return;
    }
}

readFee = async() => {
    let _fee = 0;
    if(onChained){
        try {
            //_fee = web3.utils.BN(await contract.methods.readFee().call());
            _fee = web3.utils.BN('40000000000000');
        } catch(err) {
            console.log('readFee error: ',err);
        }
        console.log('fee: ',_fee.toString());
        return _fee;
    } else {
        return 0;
    }
}

readSchedule = async(gameId) => {
    let _game = [];
    if(onChained){
        try {
            _game = await master.methods.readSchedule(gameId).call();
        } catch(err) {
            console.log('check book err', err);
        }
        //console.log('game: ',_game)
        return _game;
    } else {
        console.log('connect wallet');
    }
}

readDub = async(gameId) => {
    let _dub = false;
    if(onChained){
        try {
            _dub = await master.methods.readDub(gameId).call();
        } catch(err) {
            console.log('readDub error: ',err);
        }
        console.log('readDub game:',gameId.toString(),' dub: ',dub);
        return _dub;
    } else {
        return _dub;
    }
}

readBook = async(address) => {
    let _balance = 0;
    if(onChained){
        try {
            _balance = web3.utils.BN(await master.methods.readBook(address).call());
        } catch(err) {
            console.log('check book err', err);
        }
        console.log('credit account balance: ',_balance.toString())
        return _balance;
    } else {
        console.log('connect wallet');
    }
}

readWinnings = async(address) => {
    let _winnings = new web3.utils.BN(0);
    if(onChained) {
        try{
            _winnings = web3.utils.BN(await master.methods.readWinnings(address).call());
        } catch(err) {
            console.log('readWinnings error: ',err);
        }
        console.log('winnings for ',address,' :',_winnings.toString());
        return _winnings;
    } else {
        return 0;
    }
}

readLosses = async(address) => {
    let _losses = new web3.utils.BN(0);
    if(onChained) {
        try{
            _losses = web3.utils.BN(await master.methods.readLosses(address).call());
        } catch(err) {
            console.log('readWinnings error: ',err);
        }
        console.log('losses for ',address,' :',_losses.toString());
        return _losses;
    } else {
        return 0;
    }
}

readActivity = async() => {
    let _act = 0;
    if(onChained) {
        try {
            _act = await master.methods.readActivity().call();
        } catch(err) {
            console.log('readActivity err: ',err);
        }
        console.log('games played: ',_act);
        return _act;
    } else {
        return 0;
    }
}

readMaxBet = async() => {
    let _balance = 0;
    let _maxBet = 0;
    if(onChained){
        try {
            _maxBet = web3.utils.BN(await master.methods.readMaxBet().call());
            await web3.eth.getBalance(masterAdd, (err, balance) => {         
                if (!err) {
                    _balance = web3.utils.BN(balance);
                } else {
                    console.error('check health Error:', err);
                }
            });
            console.log('Contract balance:', _balance.toString());
        } catch (err) {
            console.log('read max bet erro',err);
        }
    }
    console.log('max bet from contract: ',_maxBet.toString());
    return _maxBet;
}

///////////////////
//// FAKE WEB3 ////
///////////////////

fund = async(amt) =>  {
    fakeTransaction(`pls pay ${amt} ETH to play`);
    //amt = parseFloat(amt);
    // playerWallet = playerWallet - amt;
    // purse = purse + amt;
    // table = table + amt;
    await updateBar();
}

fakeConnectWallet = async () => {
    const butt = get("wallet-ask");
    butt.innerHTML = 
        `<img src="loading.gif" alt="loading.."/>`
    // setTimeout(function (){
    //     console.log("simulating wallet connection");
    //     mainMenu();
    // }, 2000)
    fakeTransaction('connect');
    // while(thinking){
    //     //stay here
    // }
    walletPacks = await checkChain("checkPacks");
    mainMenu();
}

fakeTransaction = (w) => {
    alert(w)
}

writeChain = async(w) => {
    if(w=="fight"){
        fakeTransaction('you are now sending an amount of eth on arb to pay for the vrf');
        score = vrf(stocks*2);
        // if(hear){
        //     sound.stop()
        // }
    }
}

checkChain = async(w,i) => {
    if(w == "games"){
        setTimeout(function() {
            console.log('chainchecked');
            return ["0x3493934","0x9284839","0x838949"];
            
        },500)
    }
    if(w == "stats"){
        // setTimeout(function() {
        //     console.log('chainchekced');
        //     console.log(userExp[i])
        //     if(userExp[i]){
        //         get('exp').innerHTML = "exp: " + `${userExp[i]}`;
        //     } else {
        //         get('exp').innerHTML = "exp: " + "0";
        //     }
        //     get('name').innerHTML = "name: " + "";
        //     return ["355","3",""];
        // },500)
        if(onChained){
            return readExp(accounts[0],i);
        }
    }
    if(w == "play"){
        setTimeout(function() {
            console.log("chainchecked");
            //get("odds").innerHTML = "odds: " + `${getRisk()}`;
            //get("wager").innerHTML = "wager: " + `${getBet()} $DMT`;
        })
    }
    if(w == "checkPacks"){
        //return [171,2,4];
        return [];
    }
}

function vrf(num) {
    //console.log(score,'inside vrf');
    let ran = [];
    for(let i = 0; i < num; i++){
        // Generate a random number between 0 and 1
        var random = Math.random();
        // console.log(random);
        // If the random number is less than 0.5, consider it heads (true)
        // Otherwise, consider it tails (false)
        ran.push(random < parseFloat(.5));
    }
    console.log('score',ran)
    random = ran;
    return ran;
}

function simRf(odd) {
    const random = Math.random();
    return random < odd;
}
