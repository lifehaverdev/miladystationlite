/*

 ________  ___   __    ______   ______   __     __     
/_______/\/__/\ /__/\ /_____/\ /_____/\ /__/\ /__/\    
\__.::._\/\::\_\\  \ \\:::_ \ \\::::_\/_\ \::\\:.\ \   
   \::\ \  \:. `-\  \ \\:\ \ \ \\:\/___/\\_\::_\:_\/   
   _\::\ \__\:. _    \ \\:\ \ \ \\::___\/_ _\/__\_\_/\ 
  /__\::\__/\\. \`-\  \ \\:\/.:| |\:\____/\\ \ \ \::\ \
  \________\/ \__\/ \__\/ \____/_/ \_____\/ \_\/  \__\/
                                                       

*/

///////////////
// VARIABLES //
///////////////

    //constants
    const stageMax = 12;
    const totalSup = 222;
    const charPre = 'char/';
    const pre = './public/PPO/';

    //state
    var phase;
    var hear = false;
    var character = 1;
    var character1 = 8;
    var arena = 1;
    var walletPacks = [];
    var onChained = false;
    var userXP;

    //animation
    var curInt;
    
    //battle
    var level;
    var win = 0;
    var streak = 0;
    var stocks = 3;
    var random = [];
    var score = [];
    var round;
    var game = {
        p1: {
            stock: 0
        },
        p2: {
            stock: 0
        }
    }

//////////
// menu //
//////////

playerBio = async() => {
    playSprite('menuButton');
    phase = 'bio';
    let bio = '';
    let _book;
    let canon = '';
    let name = '';
    if(onChained){
        _book = (await readBook(accounts[0])).toString();
        _winnings = (await readWinnings(accounts[0])).toString();
        _exp = userXP;
        _level = getLevel(_exp);
        name = await getName(accounts[0]);
    }
    if(_level > 11){
        canon = create('button','userName','','createUsername()','CREATE USERNAME');
    } else {
        canon = create('p','','','','');
    }
    for(i=0;i<walletPacks.length;i++){
        bio +=
            create('p','','','',`${walletPacks[i]}`)
    }
    frame('','','bio','',
        create('p','','','',`${name}`)
        +
        canon
        +
        create('p','','','',`EXP: ${_exp} LEVEL: ${_level}`)
        +
        create('p','','','',`Your available claim balance: ${_book}`)
        +
        create('button','','','claim()','COLLECT')
        +
        create('p','','','','Your registered team:')
        +
        bio
        +
        create('p','','','',`Your all time earnings: ${_winnings}`)
    )
}

leaderBoard = async() => {
    playSprite('menuButton');
    wait();
    phase = 'leaderboard';
    let leaderboard = "";
    let _roster = await readPlayers();
    let seenWallets = [];
    //console.log('readplayers',_roster)
    let roster = [];
    //loop roster to get exp
    for(i=0;i<_roster.length;i++){
        let wallet = _roster[i];
        if(!seenWallets[wallet]){
            seenWallets[wallet] = true;
            roster.push({
                wallet: _roster[i],
                exp: await getExternalExp(_roster[i])
            })
        }
    }
    //console.log('roster',roster);
    const sortedRoster = roster.slice().sort((a, b) => b.exp - a.exp);
    //populate leaderboard top 10
    for(i=1;i<11&&i<=roster.length;i++){
        leaderboard += 
            create("p","","","",
                create("h3","","leaderboard","",
                `#${i}: ${await getName(sortedRoster[i-1].wallet)} : ${sortedRoster[i-1].exp}`
                )
            );
    }
    frame("","","leaderboard","",
        leaderboard
    );
}

function openSea() {
    openNewTab('https://opensea.io/collection/cigstation');
}

function ppoInfo() {
    phase = "info";
    frame('','','info','',
        create('p','','','','POWER PACKS ONCHAINED')
        +
        create('p','','','','This game is made with javascript, css and html in the front and solidity in the back. The game smart contract uses chainlink vrf to provide the randomness for the fights. Fees are credited to the contract owner to be withdrawn and used to fund the chainlink prescription.')
        +
        create('p','','','',`The lvl1 contract address: 
            ${create('button','','',`openNewTab('${chainScanPre}${masterAdd}')`,'ETHERSCAN')}
        `)
        +
        create('p','','','',`The exp contract address: 
            ${create('button','','',`openNewTab('${chainScanPre}${expAdd}')`,'ETHERSCAN')}
        `)
        +
        create('p','','','',`The Music is by TimeTravel, of the BRG clan. They are tracks off their album: "I Feel Funny." You can stream the album here:
            ${create('button','','',`openNewTab('https://open.spotify.com/album/2LeMA2VSpS1GMQVvTIvX4T?si=Vpu73gjkS_OO1kR02HKRuw&nd=1')`,'I FEEL FUNNY SPOTIFY')}
        `)
        +
        create('p','','','','If you have any trouble or spot an error or bug, send a pm or dm to @miladystation on twitter, or join the mony discord')
        +
        create('button','','',`openNewTab('https://discord.gg/CYJMPg2NPR')`,'MONY DISCORD')
    )
}

function monySend() {
    goPage('https://miladystation.net');
}

//////////////
// Campaign //
//////////////

function mainMenu(){
    phase = "main"
    playSprite('menuButton');
    //console.log('main menu wallet packs',walletPacks.length);
    if(walletPacks[0] > 0 && openBusiness){
        frame("","inside","option","option",
            create("ul","","list","",
                create("li","","option","",
                    create("button","","float","charMenu()","Campaign")
                )
                +
                create("li","","option","",
                    create("button","multi","float","multiFlow()","Create Multiplayer Game")
                )
                +
                create("li","","option","",
                    create("button","join","float","joinFlow()","Join Multiplayer Game")
                )
                +
                create("li","","option","",
                    create("button","watch","float","spectate()","Spectate")
                )
            )
        )
        get("multi").disabled = true;
        get("join").disabled = true;
        get("watch").disabled = true;
    } else if(walletPacks[0] == 0 && openBusiness) {
        frame("","inside","option","option",
            create("p","","","","We see you haven't registered, you need to choose your team before you can fight. If you'd like to play online, please register your team.")
            +
            create("ul","","list","",
                create("li","","option","",
                    create("button","","float","registerMenu()","Register")
                )
                +
                create("li","","option","",
                    create("button","","float","charMenu()","Play Offline")    
                )
            )
        )
    } else if(!openBusiness) {
        frame("","inside","option","option",
            create("p","","","","The arena is closed for maintenance right now. Check miladystation twitter for updates or go to the mony discord.")
            +
            create("ul","","list","",
                create("li","","option","",
                    create("button","","float","charMenu()","Play Offline")    
                )
            )
        )
    } else if(!onChained) {
        frame("","inside","option","option",
            create("p","","","","Check miladystation twitter for updates or go to the mony discord.")
            +
            create("ul","","list","",
                create("li","","option","",
                    create("button","","float","charMenu()","Play Offline")    
                )
            )
        )
    } else {
        frame("","inside","option","option",
            create("p","","","","Tell arthurt if you get this message. Check miladystation twitter for updates or go to the mony discord.")
            +
            create("ul","","list","",
                create("li","","option","",
                    create("button","","float","charMenu()","Play Offline")    
                )
            )
        )
    }
}

registerMenu = async() => {
    playSprite('menuButton');
    phase="register";
    frame('','','team','',
        create('p','','','',`Now, ${await getName(accounts[0])}, which Power Packs do you want?`)
        +
        await teamView()
    )
    members = document.getElementsByClassName('teamMember');
    for(let x = 0;x<members.length;x++){
        members[x].style.cursor = 'pointer';  
    }
    if(fullWallet()){
        get('team').innerHTML += 
            create('button','submit-reg','','register()','REGISTER');
        if(!noDuplicates()){
            get('submit-reg').disabled = true;
        }
    }
}

function charMenu(){
    phase = "char"
    position = { x: 0, y: 0};
    playSprite('menuButton');
    playSprite('choose');
    frame("","inside","","",  
        create("div","char-sel","float grid","",
            `${charList()}`
        )
        +
        create("div","disc","draggable","","")
        +
        create("div","picked","card","",
            // `<img src="" alt="pick"/>`
            ""
        )
        +
        create("div","spec","","",
            create("p","exp","stat","","exp: ")
            +
            create("p","name","stat","","name: ")
        )
        +
        create("div","param","","",
            create("div","","dial","",
                create("p","odds","","",`STOCKS: ${stocks}`)
                +
                create("button","risk-less","ctrl","stock(0)","-")
                +
                create("button","risk-more","ctrl","stock(1)","+")
            )
        )
    );
}

async function stageMenu() {
    playSprite('menuButton');
    await updateBar();
    phase = "stage"
    position = { x: 0, y: 0};
    let page = 0;
    if(level + 2 >= stageMax){
        page = page + 1 * (Math.floor((level)/stageMax))
    }
    //console.log('level',level,'page',page)
    setTimeout(()=>{
        frame("","inside","stageMenu","",  
            create("div","stage-sel","float grid","",
                `${stageList(page)}`
            )
            +
            create("div","disc","draggable","","")
        )
        if(level + 2 >= stageMax){
            get('stageMenu').innerHTML += 
                create("div","page-sel","","",
                    create("button","page-prev","page-button",`reloadStages(${page}-1)`,"-")
                    +
                    create("button","page-next","page-button",`reloadStages(${page}+1)`,"+")
                );
            if(page = 0){
                get('page-prev').disabled = true;
            }
            get('page-next').disabled = true;
        }
    },cadence.menu.barLag)

}

async function tote() {
    phase = "tote";
    character1 = Math.floor(Math.random()*totalSup);
    playSprite('menuButton');
    frame("","","option","",
        create("div","summary","float sheet","",
            `${summary()}`
        )
        +
        create("button","fight","","arm()","FIGHT")
        +
        create("button","check","","charMenu()","wait")
    )
    let bet = await readMaxBet();
    get('gamble').placeholder = `${bet.toString()}max`;
    if(!onChained){
        get('gamble').innerHTML = '';
        get('challenge').innerHTML = '';
    }
}

function battle() {
    phase = "battle";
    //playSprite('applause');
    if(hear){
        fightMusics();
    }
    round = 0;
    if(onChained){
        //console.log('we gotta wait for the results');
    } else {
        writeChain("fight");
    }
    
    game.p1.stock = stocks;
    game.p2.stock = game.p1.stock;
    frame("","","match","",
        create("div","action","","",
            `${action()}`
        )
    )
    get('player1').style.display = 'none';
    get('player2').style.display = 'none';

    fight()
}

function result() {
    phase = "result";
    //playSprite('menuButton');
    clearInterval(curInt);
    if(game.p1.stock > 0){
        victory();
    } else if(game.p2.stock > 0){
        defeat();
    }
    resetField();
    frame("","","","water",
        create("div","board","","",
            create("h1","result","","","")
        )
    )
    if(win == 1){
        playSprite('applause');
        playSprite('congrats');
        get('result').innerHTML = "YOU WIN"
    } else if(win == -1){
        playSprite('defeated');
        get('result').innerHTML = "YOU LOSE"
    } else {
        get('result').innerHTML = "something rong"
    }
    var butt =  
        create("button","","","charMenu()","select Pack")
        +
        create("button","","","stageMenu()","select Stage")
        +
        create("button","","","tote()","again")
        +
        create("button","","","mainMenu()","main menu");

    get('board').innerHTML += butt;
    menuMusics();
}

//////////
//multi //
//////////

// function newGameFlow(){
//     frame(
//         "choose the param of your game"
//     )
// }

// function joinFlow(){
//     cast(
//         create("div","","container","",
//             create("div","","container","",
//                 gameList()
//             )
//         )
//     )
// }

// function gameList(){
//     var games = "";
//     var live = checkChain("",0);
//         for(i=0; i < live.length; i++){
//             games += create("div","${i}","game float","",`Game ${live[i]}`+
//                 create("button","","join",`joinGame(${live[i]})`,"Join")
//             );
//         }
//     return games;
// }

////////////////
// SUPPORTING //
////////////////

/////////
// gen //
/////////

playOffline = () => {
    onChained = false;
    mainMenu();
}

function wait() {
    phase = "wait";
    frame("","","wait","",
        create("div","","","",
            `<img src="${pre}assets/loading.gif"/>`
        )
    )
}

function banner() {
    if(get('banner')){
        get('banner').remove();
    }
    document.body.innerHTML += 
    create("div","banner","ribbon","",
        create("button","banner-min","tiny",`minimize('banner')`,"-")
        +
        create("button","next","","next()","READY")
    );
    bannerSlide('banner');
    get('disc').style.opacity = ".33";
}

function minimize(target) {
    tar = get(target);
    tar.style.top = "0px";
    tar.style.height = "10%";
    tar.innerHTML = create("button","banner-max","tiny","banner()","+");
    get('disc').style.opacity = "1";
    get('banner').style.padding = "0%";
}

getName = async(address) => {
    let _name = await readCanon(address);
    if(_name == ""){
        return address;
    } else {
        return _name;
    }
}

//////////
// menu //
//////////

function createUsername() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'New Input';
    input.id = 'canonized';

    const button = document.getElementById('userName');

    // Get reference to the container
    const container = document.getElementById('bio');
    container.insertBefore(input, button);

    button.onclick = incorporate;
}

getLevel = (_xp) => {
    let _level
    if(onChained){
        // console.log('current exp', userXP);
        _level = Math.floor(Math.cbrt(_xp));
        //xp2next = (cube(level + 1))-_xp;
        console.log('level',_level);
        //console.log('xp to next level: ', xp2next);
    }else {
        return 0;
    }
    return _level;
}

function openNewTab(url) {
    // Open a new tab with the specified URL
    const newTab = window.open(url, '_blank');
    
    // Focus on the new tab (optional)
    if (newTab) {
        newTab.focus();
    }
}

function goPage(url) {
    window.location.href = url;
}

//////////////
// register //
//////////////


function fullWallet() {
    for(i=0;i<6;i++){
        if(walletPacks[i] =='0'){
            return false;
        } else {
            return true;
        }
    }
}

function noDuplicates() {
    for(i=0;i<5;i++){
        for(j=i+1;j<6;j++){
            if(walletPacks[i] == walletPacks[j]){
                return false;
            }
            else{
                continue
            }
        }
    }
    return true;
}

teamMenu = async() => {
    playSprite('menuButton');
    phase="team";
    _teamView = await teamView();
    frame('','','team','',
        `${_teamView}`
    )
    if(level > 30){
        for(let x = 0;x<members.length;x++){
            members[x].style.cursor = 'pointer';  
        }
    }
}

teamView = async() => {
    let _teamView = '';
    let _teamNames = [];
    let _teamExp = [];
    let _teamStats = [];
    let _walletPacks = walletPacks;
    for(let j = 0; j < 6; j++){
        _teamNames.push(await readRoster(accounts[0],_walletPacks[j]));
        if(_teamNames[j] != ""){
            _teamNames[j] == `NAME: ${_teamNames[j]}`
        }
        _teamExp.push(await readExp(accounts[0],_walletPacks[j]));
        let stat = await readStats(_walletPacks[j]);
        //console.log('stat',stat)
        _teamStats.push({
            atk: stat[0],
            def: stat[1],
            spd: stat[2]
        })
    }
    for(let i = 0; i < 6; i++){
        _teamView += create('div',`${i}`,'teamMember',`memberView(${i},0)`,
            `
            <img src="${pre}${charPre}${_walletPacks[i]}.png" />
            <p>#${_walletPacks[i]} ${_teamNames[i]} EXP:${_teamExp[i]}</p>
            <p class="right">ATK:${_teamStats[i].atk} DEF:${_teamStats[i].def} SPD:${_teamStats[i].spd}</p>
            `
        )
    }
    return _teamView;
}

memberView = async(p,page) => {
    playSprite('click');
    if(phase=="register"){
        document.body.innerHTML += 
        create('div','registration','pop','',
            `${fullPackList(0,p)}`
        )
        +
        create("div","page-sel","","",
            create("button","page-prev","page-button",`reloadPacks(${page}-1,${p})`,"-")
            +
            create("button","page-next","page-button",`reloadPacks(${page}+1,${p})`,"+")
        );
    } else if (phase="team" && level > 29){
        document.body.innerHTML += 
        create('div','registration','pop','',
            `
            <h3>Knight your Warrior</h3>
            <input id="new-title" placeholder="new name"></input>
            <button onclick="knight()">Name Them</button>
            `
        )
    }else {
        return
    }
    buttonCheck(page);
}

fullPackList = (page,p) => {
    //console.log(get('team').innerHTML)
    let packs = '';
    packListPop = create('div','close','',`closeMemberView()`,'x');
    for(i=1+page*12;i<=12*(page+1);i++){
        packs += 
            `<img src='${pre}${charPre}${i}.png' class='pack-choice' onclick='selectPack(${i},${p})'/>`
    }
    packListPop +=
            create('div','pack-list','','',
                `${packs}`
            )
    return packListPop;
}

function closeMemberView() {
    get('registration').remove()
    get('page-sel').remove()
}

function selectPack(i, p) {
    playSprite('sparkle');
    //console.log('Picking pack', p, 'to be', i);
    //console.log('Wallet pack', walletPacks[p], 'should now be', i);

    walletPacks = [...walletPacks]; // Create a new copy of the array

    walletPacks[p] = i;
    //console.log('WalletPacks after change:', walletPacks);
    registerMenu();
}

function reloadPacks(page,p)  {
    playSprite('click');
    get('registration').innerHTML = fullPackList(page,p)
    get('page-sel').innerHTML =         
        create("button","page-prev","page-button",`reloadPacks(${page}-1,${p})`,"-")
        +
        create("button","page-next","page-button",`reloadPacks(${page}+1,${p})`,"+");
    buttonCheck(page);
}

function buttonCheck(page) {
    if(page == 0){
        get('page-prev').disabled = true;
    }
    if((page+1)*12 > totalSup) {
        get('page-next').disabled = true;
    }
}

//////////
// char //
//////////

function charList(){
    var chars = "";
    if(onChained){
        for(let i=0; i < 6; i++){
            chars += create("div",`${walletPacks[i]}`,"op char","",
                `<img src="${pre}${charPre}${walletPacks[i]}.png" alt="char${walletPacks[i]}" class="pp"/>`    
            )
        }
    } else {
        for(let i = 1; i < 13; i++){
            chars += create("div",`${i}`,"op char","",
                `<img src="${pre}${charPre}${i}.png" alt="char${i}" class="pp"/>`    
            )
        }
    }
    return chars
}

loadCard = async(id) => {
    //var img = get(id).innerHTML;
    //get("picked").innerHTML = img;
    
    //character = parseInt(get(id).id);
    // console.log('loadcardchar',character)
    get("picked").innerHTML = 
        `<img src="${pre}${charPre}${character}.png" id="chosen" alt="pack" />`
    //stats(id)
    get('picked').children[0].style.classList = "card"
    //console.log(get('picked').children[0].style.classList)
    stats(id);
    banner();
}

stock = (w) => {
    playSprite('click');
    if(w > 0){
        stocks++
    } else {
        stocks--
    }
    get("odds").innerHTML = "STOCKS: " + `${stocks}`;
    if(stocks < 2){
        get('risk-less').disabled = true;
    } else {
        get('risk-less').disabled = false;
    }

    if(stocks > 4){
    get('risk-more').disabled = true;
    } else {
        get('risk-more').disabled = false;
    }
    //bannerUpdate()
}

stats = async (charSelId) => {
        //await checkChain("stats",charSelId);
        xp = await readExp(accounts[0],charSelId);
        //let name = await checkName(accounts[0],charSelId);
        get('exp').innerHTML = `exp: ${xp}`;
        //get('name').innerHTML = `name: ${name}`;
}

///////////
// stage //
///////////

function stageList(page) {
    var stages = "";
    if(onChained){
        for(i = 1 + stageMax*page; i < level + 2 && i <= stageMax + stageMax*page; i++){
            stages += create("div",`${i}`,"dest op","",
                `<img src="${pre}stage/${i}.png" alt="stage${i}" class="stage" />`    
            )
        }
    } else {
        for(i = 1; i <= stageMax; i++){
            stages += create("div",`${i}`,"dest op","",
                `<img src="${pre}stage/${i}.png" alt="stage${i}" class="stage" />`    
            )
        }
    }
    //console.log('1+stagemax*page', (1+stageMax*page))

    return stages
}

function reloadStages(page) {
    //console.log('page in reload',page)
    playSprite('click');
    get('stageMenu').innerHTML = 
        create("div","stage-sel","float grid","",
            `${stageList(page)}`
        )
        +
        create("div","disc","draggable","","")
        +
        create("div","page-sel","","",
            create("button","page-prev","page-button",`reloadStages(${page}-1)`,"-")
            +
            create("button","page-next","page-button",`reloadStages(${page}+1)`,"+")
        );
    if(page == 0){
        get('page-prev').disabled = true;
    }
    if(page == page + 1 * (Math.floor((level+2)/stageMax))){
        get('page-next').disabled = true;
    }
}

//////////
// tote //
//////////

function summary() {
    let feeSum = '';
    if(onChained){
        feeSum = create("p","","","",`current fee: ${fee.div(web3.utils.BN(1000000000)).toString()}e9`)
    }
    sum = 
    
    create("h3","q","","","Are you ready to fight?")
    +
    feeSum
    +
    create("p","challenge","","","Wanna bet?")
    +
    create("input","gamble","","","")
    +
    create('p','glance','','',
        `
        <img src="${pre}char/${character}.png" />
        <img src="${pre}stage/${arena}.png" />
        `
    );

    return sum
}

////////////
// battle //
////////////

function action() {
    return  create("div","game","","",
                `<img src="${pre}stage/${arena}.png" alt="stage" id="arena" /> `
                +
                `<img src="${pre}char/${character}.png" alt="char0" id="player1" />`
                +
                `<img src="${pre}char/${character1}.png" alt="char1" id="player2" />`
                +
                getStocks()
            )
}

function getStocks() {
    let p1s = `<div class="stocks stock0">`
    let p2s = `<div class="stocks stock1">`
    for(let i = 1; i < stocks + 1; i++){
        if(game.p1.stock + 1 > i){
            p1s += `<img src="${pre}char/${character}.png" alt="stock0" id="0stock${i}" class="stock0"/>`;
        }
        if(game.p2.stock + 1 > i){
            p2s += `<img src="${pre}char/${character1}.png" alt="stock1" id="1stock${i}" class="stock1"/>`;
        }
    }
    p1s += "</div>"
    p2s += "</div>"
    return p1s + p2s;
}

function fight() {
    spawnSlide('player1');
    spawnSlide('player2');    
    
    setTimeout(()=>{
        get('action').innerHTML = action();
    },cadence.fight.spawn)

    setTimeout(()=>{
        countDown()
    },cadence.fight.countdown)

    setTimeout(()=>{
        battle1();
    },cadence.fight.battle)
}

////////////
// result //
////////////

defeat = async() => {
    //table = table - parseFloat(getBet());
    win = -1;
    await updateBar();
}

victory = async() => {
    streak++;
    win = 1;
    await updateBar()
}

function resetField() {
    game.p1.stock = stocks;
    game.p2.stock = stocks;
    score = [];
    a = false;
    found = false;
}

//////////////
// settings //
//////////////

//full spread
boot();
//start()
//auth()
//mainMenu();
//charMenu();
//banner();
//tote();
//stageMenu();
//tote()
//battle();
//spare();