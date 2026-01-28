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
        cast(
            create("div",idO,"container "+clastO,"",
                create("div",idI,"container "+clastI,"",
                    bod
                )
            )
        ) 
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
