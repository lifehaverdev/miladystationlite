/*

 ___   ___   ______   ___ __ __   ______      
/__/\ /__/\ /_____/\ /__//_//_/\ /_____/\     
\::\ \\  \ \\:::_ \ \\::\| \| \ \\::::_\/_    
 \::\/_\ .\ \\:\ \ \ \\:.      \ \\:\/___/\   
  \:: ___::\ \\:\ \ \ \\:.\-/\  \ \\::___\/_  
   \: \ \\::\ \\:\_\ \ \\. \  \  \ \\:\____/\ 
    \__\/ \::\/ \_____\/ \__\/ \__\/ \_____\/ 
                                              

*/

var phase;
var volume;

const cadence = {
    intro: {
        mony: 11000,
        ms: 7500
    }
}

const options = [
    {
        name: "Buy LawbStation on Solana",
        image: "public/main/lawbstar.gif",
        url: "https://www.tensor.trade/trade/lawbstation"
    },
    {
        name: "Power Packs Onchained",
        image: "public/main/ppo.gif",
        url: "https://miladystation.net/PPO"
    },
    {
        name: "MiladyCola",
        image: "public/main/cola.gif",
        url: "https://miladycola.net"
    },
    {
        name: "MiladyStation Classic",
        image: "public/main/msclassic.gif",
        url: "https://miladystation.net/classic"
    },
    {
        name: "Mony Group Corp",
        image: "public/main/mony.gif",
        url: "https://monygroup.net"
    },
    {
        name: "Arthurt Stream",
        image: "public/main/sanko.gif",
        url: "https://sanko.tv/MiladyStation"
    }

];

function boot() {
    phase = "boot";
    frame("","","pre","",
        create("button","sound","","start(true)","SOUND")
        +
        create("button","quiet","","start(false)","NO SOUND")
        +
        create("button","","","mainMenu()","SKIP")
  )
}

function start(loud) {
    phase = "start";
    if(loud){
        volume = true;
        playIntro();
    }
    frame(
        "boot","","","",
            create("div","","","",
            `
                <h2 id="top-title">MONY</h2>
                <img id="logo" src="public/msinvert.png" alt="miladystation"/>
                <img id="mony" src="public/mony.png" alt="mony"/>
                <h3 id="bottom-title">COMPUTER ENTERTAINMENT</h3>
            `
            )
    )
    welcome();
}

function welcome() {
    var ms = get("logo");
    var mony = get('mony');
    //first, hide ms, show mony while sound plays
    ms.style.display = "none";
    fadeInOut(['mony','top-title','bottom-title'],cadence.intro.mony);
    //then after mony linger, do the ms
    setTimeout(function() {
        mony.style.display = "none";
        ms.style.display = "block";
        document.body.style.backgroundColor = "black";
        fadeInOut(['logo'],cadence.intro.ms);
    }, cadence.intro.mony);
    setTimeout(function() {
        mainMenu()
    }, cadence.intro.mony + cadence.intro.ms);
}

function fadeInOut(ids,durIn){
    var what = [];
    for(let i = 0; i < ids.length; i++){
        what.push(get(ids[i]));
    }
    var opacity = 0;
    var intervalID = setInterval(function() {
        if (opacity < 1) {
        opacity += 0.01;
        for( let  i = 0; i < ids.length; i++){
            what[i].style.opacity = opacity;
        }
        } else {
        clearInterval(intervalID);
        setTimeout(function() {
            var intervalID2 = setInterval(function() {
            if (opacity > 0) {
                opacity -= 0.01;
                for( let  i = 0; i < ids.length; i++){
                    what[i].style.opacity = opacity;
                }
            } else {
                clearInterval(intervalID2);
            }
            }, 4);
        }, durIn);
        }
    }, 2);
}

function mainMenu() {
frame("menu","","choices","",`${populate()}`)
}

function populate() {
    let content = "";
    for(let i = 0; i < options.length; i++){
        content += 
            create("div","","content","",
                `
                    <a href="${options[i].url}">
                    <img src="${options[i].image}"/>
                    <h3>${options[i].name}</h3>
                    </a>
                `
            )
    }
    return content;
}

window.onload = function() {
    // Check if the URL contains #home
    if (window.location.hash === '#home') {
        // Execute your function or code here
        mainMenu();
    }
}

boot();
//mainMenu();
