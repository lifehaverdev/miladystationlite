/*

 ______   ______   ______    ______      
/_____/\ /_____/\ /_____/\  /_____/\     
\:::__\/ \:::_ \ \\:::_ \ \ \::::_\/_    
 \:\ \  __\:\ \ \ \\:\_\ \ |_\:\/___/\   
  \:\ \/_/\\:\ \ \ \\: __ `\ \\::___\/_  
   \:\_\ \ \\:\_\ \ \\ \ `\ \ \\:\____/\ 
    \_____\/ \_____\/ \_\/ \_\/ \_____\/ 
                                         

*/

//////////////////
// FOUNDATIONAL //
//////////////////

const assetPre = './public/PPO/assets/'

function create(elem, id, clast, onclick, bod){
    return `<${elem} id="${id}" class="${clast}" onclick="${onclick}">${bod}</${elem}>`
}

function reset(level){
    document.body.innerHTML = "";
}

function cast(...inner){
    document.body.innerHTML = inner;
}

function frame(idO, clastO, idI, clastI, bod) {
    //if(!isMobileDevice()){
    if(true){
        cast(
            create("div",idO,"container "+clastO,"",
                create("div",idI,"container "+clastI,"",
                    bod
                )
                +
                bar()
            )
        )
    }
    if(phase == "battle" || phase == "wait"){
        get('back').disabled = true;
        get('cash-out').disabled = true;
    } 
    
}

//////////
// MATH //
//////////

function cube(n){
    return n*n*n;
}

/////////
// KEY //
/////////

function bar() {
    let bar = '';
    bar += 
    create("div","bar","","",
        create("button","back","","back()","BACK")
        +
        create("button","vol","","soundSwitch()",`${volume()}`)
        +
        create("div","balance","","",
            `${headline()}`
        )
        +
        create("button","cash-out","","settings()","Menu")
        +
        create("button","close-settings","","hideSettings()","Menu")
    )
    return bar;
}

function headline() {
    if(onChained){
        if(!isMobileDevice()){
            return create("h3","wallet","","",`WINS:${streak} EXP:${userXP}`)
        } else {
            return create("h3","wallet","","",`EXP:${userXP}`)
        }
        
    } else {
        return create("h3","wallet","","",`WINS:${streak}`)
    }
}

async function settings() {
    var settings = get('cash-out');
    settings.style.display = "none";
    phase = "settings";
    get('close-settings').style.display = "inline-block";
    playSprite('click');
    let _name = '';
    if(onChained){
        _name = await getName(accounts[0])
        if(_name.length > 12){
            _name = _name.slice(0,5) + '...' + _name.slice(_name.length - 2,_name.length);
        }
    } else {
        _name = 'PLAYER';
    }

    if(onChained){
        document.body.innerHTML += 
        create("div","settings","","",
            create("p","","settings-option","playerBio()",`${_name}`)
            +
            create("p","","settings-option","",
                create("div","","settings-button","leaderBoard()","LEADERBOARD")
            )
            +
            create("p","","settings-option","",
                create("div","","settings-button","teamMenu()",`POWER PACKS`)
            )
            +
            create("p","","settings-option","",
                create("div","","settings-button","openSea()","COLLECTION")
            )
            +
            create("p","","settings-option","",
                create("div","","settings-button","ppoInfo()","INFO")
            )
            +
            create('p','','settings-option','',
                create('div','','settings-button','monySend()','SAVE & QUIT')
            )

        )
    } else {
        document.body.innerHTML += 
        create("div","settings","","",
            create("p","","settings-option","","OFFLINE")
        )
    }
    
}

function hideSettings() {
    var settings = get('close-settings');
    settings.style.display = "none";
    playSprite('click');
    get('cash-out').style.display = "inline-block";
    get('settings').remove();
}

updateBar = async() => {
    let xp;
    if(userXP){
        xp = userXP;
    }else {
        xp = 0;
    }
    if(onChained && phase != "battle"){
        level = getLevel(await getUserExp(accounts[0]));
    }
    //console.log('xp in update bar',xp);
    if(onChained){
        if(!isMobileDevice()){
            get('wallet').innerHTML = `WINS:${streak} EXP:${xp}`;
            get('vol').innerHTML = `${volume()}`;
        } else {
            get('wallet').innerHTML = `EXP:${xp}`;
            get('vol').innerHTML = `${volume()}`;
        }
    } else {
        if(!isMobileDevice()){
            get('wallet').innerHTML = `WINS:${streak} EXP:${xp}`;
            get('vol').innerHTML = `${volume()}`;
        } else {
            get('wallet').innerHTML = `WINS:${streak}`;
            get('vol').innerHTML = `${volume()}`;
        }
    }

}

function get(id) {
    return document.getElementById(id);
}

function show(id) {
    var target = get(id);
    target.style.display = "block";
}

function hide(id) {
    var target = get(id);
    target.style.display = "none";
}

function errorTell(msg) {
    alert(msg);
}

//////////
// FLOW //
//////////

async function next(){
    console.log('current phase',phase)
    if(phase == "char"){
        await stageMenu();
        return
    }
    if(phase == "stage"){
        await tote();
        return
    }
}

function back(){
    playSprite('back');
    setTimeout(()=>{
        if(phase == "main"){
            start();
        } else if(phase == "stage"){
            charMenu();
        } else if(
            phase == "result" || 
            phase == "register" || 
            phase == "bio" || 
            phase == "leaderboard" ||
            phase == "char" ||
            phase == "settings" ||
            phase == "team"
        ){
            mainMenu();
        } else if(phase == "tote"){
            stageMenu();
        }
    },300);

}

function boot(){
    phase = "boot";
    frame(
        "boot","","logo","",
        `<img src="${assetPre}bwlogosmol.png" alt="miladystation">`
    )
    get('bar').style.display = "none";
    welcome();
}

function start(loud){
    phase = "start"
    if(loud){
        hear = true;
        titleMusic.play();
    } else {
        hear = false;
    }
    frame("","","intro","container",
        create("h1","title","fight","","POWER PACKS ONCHAINED")
        +
        create(
            "button","start","float centered-button","auth()","START"
        )
        +
        `<img src="${assetPre}dogpile.png" id="dogpile" />`
    )
    get('bar').style.display = "none";
    panUp(1.3)
}

function auth(){
    phase = "auth"
    titleMusic.stop();
    playSprite('startButton');
    menuMusics();
    let walletButton;
    if(onChained){
        walletButton = 
        create(
            "button","wallet-ask","float centered-button web3","mainMenu()","continue"
        )
    } else {
        walletButton = 
        create(
            "button","wallet-ask","float centered-button web3","connectWallet()","connect-wallet"
        )
    }
    frame("","","","container",
        walletButton
        +
        create(
            "button","wallet-ask","float centered-button web3","playOffline()","play-offline"
        )
    )
    get('bar').style.display = "none";
}

