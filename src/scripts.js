// const{ ApiPromise, WsProvider } = require('@polkadot/api');

// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { WsProvider } from '@polkadot/api';

// import Api from '/node_modules/@polkadot/api/promise';
// import Ws from '/node_modules/@polkadot/rpc-provider/ws';


function createXmlHttp() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!(xmlhttp)) {
        alert("Your browser does not support AJAX!");
    }
    return xmlhttp;
}

function get(xmlHttp, target) {
    if (xmlHttp) {
        xmlHttp.open("GET", target, true); // XMLHttpRequest.open(method, url, async)
        var contentType = "application/x-www-form-urlencoded";
        xmlHttp.setRequestHeader("Content-type", contentType);
        xmlHttp.send();
    }
}

function sendGetRequest(targetUrl, callbackFunction) {
    var xmlHttp = createXmlHttp();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            console.log(xmlHttp);
            var myObject = JSON.parse(xmlHttp.responseText);
            callbackFunction(myObject, targetUrl);
        }
    }
    get(xmlHttp, targetUrl)
}




function initServer() {
    fetch('./loadAPI')
        .then(
            function (response) {
                // console.log(response);
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                // Examine the text in the response
                response.json().then(function (data) {
                    // console.log(data);
                    elem = document.getElementById('event_updates_content');
                    oldText = elem.innerText;
                    elem.innerText = data.response + "\n\n" + oldText;
                    initProposedParachains(); 
                    initImage();
                    initSidebar();
					generateInfoPanel();

                }).catch((e) => {
                    console.log(e);
                });
            }
        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

}

// added
// getProposedParachains(), getValidatorGroups(), getActiveValidators()
// to-do: clean up JSON data
function initProposedParachains() {
	elem = document.getElementById('proposed_svg');
	text = "";
    fetch('./getProposedParachains').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            console.log(response);
            response.json().then(function (data) {
                console.log(data);
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });   
//start making the proposed chains
/*
	centerX = 100;
    centerY = 200;
	text += "<text id='proposed_text" + "' x='" + (centerX-100) + "' y='" + (centerY-150) + "' fill='black'>"+"Proposed Parachains"+"</text>";

	numProposed = 12
	
	for (var i = 0; i < numProposed; i++) {
		thisX = centerX+(i%4)*190;
		thisY = centerY+(Math.floor(i/5)*150);
        text += "<circle id='proposed_id_" + i + "'cx='" + (thisX) + "' cy='" + (thisY) + "' r='30' fill='#ffffff' stroke-width='20' stroke='#BBBBBB' />\n";
		text += "<text id='proposed_text_id_" + i + "' x='" + (thisX - 50) + "' y='" + (thisY - 40) + "' fill='black'>"+"proposed parachain #"+i+"</text>";

	}
	elem.innerHTML = text;		
*/
}

function initImage() {
    // sets active_validators
    fetch('./getActiveValidators').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            //console.log(response);
            response.json().then(function (data) {
                active_validators = data.response; // array of validators
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });

    // sets validator_groups
    fetch('./getValidatorGroups').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            //console.log(response);
            response.json().then(function (data) {
                validator_groups = data.response; // validator_groups[parachain][its validators] (parachains indexed with lowest ID at 0th index)
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });


    fetch('./getParachainIDs').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            response.json().then(function (data) {
                // console.log(data);
                chains_array = data.response.ids;
                num_chains = chains_array.length;
                elem = document.getElementById('event_updates_content');
                oldText = elem.innerText;
                elem.innerText = "Parachain IDs:\n[" + chains_array + "]\n\n" + oldText;
                generateChains();
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });    

}
/*
function initInfoPanel() {
	elem = document.getElementById('info_panel');
	
}*/

function initSidebar() {
    fetch('./subscribeToEvents').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.json().then(function (data) {
                // console.log(data);
                elem = document.getElementById('event_updates_content');
                setInterval(() => { updateRelaychain(); updateParachains(); }, 6000);
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

// sleep time expects milliseconds
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

latestNumber = 0;

function updateRelaychain() {
    fetch('./latestEvents').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.json().then(function (data) {
                // console.log(data);
                elem = document.getElementById('event_updates_content');
                oldText = elem.innerText;
                newText = "";
                if (data.response.head.number != latestNumber) {
                    console.log(data.response.head.number);
                    newText += "Relay Chain - New block: " + data.response.head.number + "\n";
                    latestNumber = data.response.head.number;
                    elem.innerText = newText + "\n" + oldText;
                    //visually display new block on the relay chain
                    fadeRelaychain();
                }


            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

function fadeRelaychain() {
    /*chain = document.getElementById('relay_circle');
    currColor = chain.getAttribute('stroke');
    currRed = parseInt(currColor.substr(1,2),16);
    currGreen = parseInt(currColor.substr(3,2),16);
    currBlue = parseInt(currColor.substr(5,2),16);
    console.log('current color: ' + currColor);
    currRed = Math.round(currRed - ((currRed - 119) * 0.1));
    currBlue = Math.round(currBlue - ((currBlue - 119) * 0.1));
    currGreen = Math.round(currGreen - ((currGreen - 119) * 0.1));
    console.log('new color: #' + currRed.toString(16) + currBlue.toString(16) + currGreen.toString(16));
    chain.setAttribute('stroke', '#' + currRed.toString(16).padStart(2,'0') + currBlue.toString(16).padStart(2,'0') + currGreen.toString(16).padStart(2,'0'));
    */
    anime({
        targets: '#relay_circle',
        stroke: [
            {value: '#ff0000', duration: 2000},
            {value: '#ffa500', duration: 2000},
            {value: '#ffff00', duration: 2000},
            {value: '#008000', duration: 2000},
            {value: '#0000ff', duration: 2000},
            {value: '#ff0000', duration: 2000},
            {value: '#4b0082', duration: 2000},
            {value: '#000000', duration: 2000},
        ],
        easing: 'easeInOutSine'
    });
}

currentHeads = {}

function updateParachains() {
    fetch('./getParachains').then(
        function (response) {
            console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.json().then(function (data) {
                console.log(data);
                elem = document.getElementById('event_updates_content');
                animate_webs = new Array(); // ADDED
                oldText = elem.innerText;
                newText = "";
                newText2 = "";
                hash_array = data.response.parachains;
                console.log(hash_array);
                for(i=0; i<hash_array.length; i++){
                    elem2 = document.getElementById('hash_text_id_' + chains_array[i]);

                    if(currentHeads[i] == null){
                        newText += parachain_id_to_name[chains_array[i]] + "(" + hash_array[i]['id'] + ") - current head: \n       " + hash_array[i]['head'].substring(0, 25) + "...\n";
                        newText2 = "Hash: " + hash_array[i]['head'].substring(0, 15) + "...";
                        console.log(newText2);
                        elem2.innerHTML = newText2;
                    }
                    else if(currentHeads[i]['head'] != hash_array[i]['head']){
                        newText += parachain_id_to_name[chains_array[i]] + "(" + hash_array[i]['id'] + ") - new head: \n       " + hash_array[i]['head'].substring(0, 25) + "...\n";
                        newText2 = "Hash: " + hash_array[i]['head'].substring(0, 15) + "...";
                        console.log(newText2);
                        elem2.innerHTML = newText2;
                        //visually display new block on the parachain by changing its color
                        //animate_webs.push(chains_array[i]); // ADDED
                        anime({
                            targets: '#chain_id_' + chains_array[i],
                            stroke: [
                                {value: '#ff0000', duration: 2000},
                                {value: '#ffa500', duration: 2000},
                                {value: '#ffff00', duration: 2000},
                                {value: '#008000', duration: 2000},
                                {value: '#0000ff', duration: 2000},
                                {value: '#ff0000', duration: 2000},
                                {value: '#4b0082', duration: 2000},
                                {value: '#000000', duration: 2000},
                            ],
                            easing: 'easeInOutCubic'
                        });
                           
                    }
                }
                currentHeads = hash_array;
                if(newText != ""){
                    elem.innerText = newText + "\n" + oldText;
                }
                /* ADDED
                for(j=0; j<animate_webs.length; j++){ 
                    animatePathFrom(animate_webs[j], 2000);
                }
                */
                //setTimeout(() => { generateChains() }, 4250);

            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

function showChains(result, url) {
    console.log(result);
    elem = document.getElementById('event_updates_content');
    oldText = elem.innerText;
    elem.innerText = result.response + oldText;
}


// function animatePathFrom(from_id, length) {
//     elem = document.getElementById('chain_id_' + from_id);
//     elem2 = document.getElementById('path_id_' + from_id);
//     elem.setAttribute('fill', '#00BB00');
//     elem2.setAttribute('stroke', '#00BB00');
//     anime({
//         targets: '#path_id_' + from_id,
//         strokeDashoffset: [anime.setDashoffset, 0],
//         easing: 'linear',
//         duration: length,
//         direction: 'alternate',
//         // loop: true
//     });
// }

// function animatePathTo(to_id, length) {
//     elem = document.getElementById('chain_id_' + to_id);
//     elem2 = document.getElementById('path_id_' + to_id);
//     elem3 = document.getElementById('path_under_id_' + to_id);
//     elem.setAttribute('fill', '#00BB00');
//     elem2.setAttribute('stroke', '#000000');
//     elem3.setAttribute('stroke', '#00BB00');
//     anime({
//         targets: '#path_id_' + to_id,
//         strokeDashoffset: [anime.setDashoffset, 0],
//         easing: 'linear',
//         duration: length,
//         delay: length,
//         direction: 'reverse',
//         // loop: true
//     });
// }
function animatePathFrom(from_id, length){
    elem = document.getElementById('chain_id_' + from_id);   
    elem3 = document.getElementById('chain_under_id_' + from_id);
    elem2 = document.getElementById('path_id_' + from_id);   
    elem.setAttribute('fill', '#e6007a');
    elem3.setAttribute('fill', '#e6007a');
    elem2.setAttribute('stroke', '#e6007a');
    var x = document.getElementById('chain_under_id_' + from_id).getAttribute("x");
    x = 300-x; // changed from 338 to 300 to better center block
    var y = document.getElementById('chain_under_id_' + from_id).getAttribute("y");
    y = 348-y;
    anime({
        targets: '#chain_under_id_' + from_id,
        translateX: x,
        translateY: y,
        easing: 'linear',
        duration: length/2,
        //direction: 'reverse',
    });
    
    anime({
        targets: '#path_id_' + from_id,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInCubic', // changed from linear to easeInCubic...feel free to change back
        duration: length,
        //direction: 'alternate',
        // loop: true
    });
}

function animatePathTo(to_id, from_id, length){
    document.getElementById('chain_under_id_' + from_id).setAttribute('fill', 'none');
    elem = document.getElementById('chain_id_' + to_id); 
    elem5 = document.getElementById('chain_under_id_' + to_id);  
    elem2 = document.getElementById('path_id_' + to_id); 
    elem3 = document.getElementById('path_under_id_' + to_id);     
	elem5.setAttribute('fill', '#e6007a');
    elem.setAttribute('fill', '#e6007a');
    elem2.setAttribute('stroke', '#fffff');
    elem3.setAttribute('stroke', '#e6007a');
    
    var x2 = document.getElementById('chain_under_id_' + to_id).getAttribute("x");
    x2 = 338-x2;
    var y2 = document.getElementById('chain_under_id_' + to_id).getAttribute("y");
    y2 = 348-y2;
    
    anime({
        // delay: 3000,
        targets: '#chain_under_id_' + to_id,
        translateX: x2,
        translateY: y2,
        easing: 'linear',
        duration: length/2,
        direction: 'reverse',
    });

    anime({
        targets: '#path_id_' + to_id,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'linear',
        duration: length,
        delay: length,
        direction: 'reverse',
        // loop: true
    });
}


function sendMessage() {
    from_id = document.getElementById('from_chain').value;
    to_id = document.getElementById('to_chain').value;
    console.log("Animating sending a message from " + from_id + " to " + to_id);
    animatePathFrom(from_id, 2000);
    setTimeout(() => { animatePathTo(to_id, from_id, 2000) }, 1200)
    // animatePathTo(to_id, 4000);
    setTimeout(() => { generateChains() }, 4250); //reset the paths after a message is sent... Not really sure why 4000 is the delay, I feel like it should be 8000 but idk
}

active_validators = [];
validator_groups = [];
chains_array = [];
hash_array = [];
num_chains = 0;

function changeColor(chain) {
    elem = document.getElementById('chain_id_' + chain);
    // text += "<rect id='chain_id_" + i + "' x='" + (thisX-30) + "' y='" + (thisY-30) + "' rx='10' ry='10' width='60' height='60' stroke='black' stroke-width='0' fill='#BBBBBB' />\n";
    elem.setAttribute('fill', '#00BB00');

}


// Hard coded URLs for each of the parachains.. Not really a better way to do this because the URLs aren't named with any real consistency
parachain_id_to_url = {     18: 'parachain-rpc.darwinia.network',
                            21: 'rococo.polkabtc.io/api/parachain',
                            30: 'rococov1.phala.network/ws',
                            100: 'tick-rpc.polkadot.io',
                            107: 'rococo-1.testnet.liebi.com',
                            110: 'trick-rpc.polkadot.io',
                            120: 'track-rpc.polkadot.io',
                            188: 'rococo-parachain.zenlink.pro',
                            666: 'rococo-1.acala.laminar.one/ws',
                            1000: 'rpc.parachain.plasmnet',
                            3000: 'parachain-rpc.robonomics.network',
                            5000: 'rococo-1.acala.laminar.one',
                            7777: 'api-rococo.crust.network',
                            5001: 'rococo-1.laminar-chain.laminar.one',
                            8000: 'parachain-rpc.darwinia.network',
                            12623: 'para.rococo-v1.kilt.io',
                            82406: 'hydrate-rpc.hydradx.io:9944'
                        }

// There might be a way to get these from the Network, but it would require the URLs above anyway, so we might as well just hardcode these too
parachain_id_to_name = {    


                            18: 'Darwinia PC2',
                            21: 'PolkaBTC PC1',
                            30: 'Phala PC1',
                            100: 'Tick',
                            107: 'Bitfrost PC1',
                            110: 'Trick',
                            120: 'Track',
                            188: 'Zenlink PC1',
                            666: 'Mandala PC2',
                            1000: 'Plasm',
                            3000: 'Robonomics',
                            5000: 'Mandala',
                            7777: 'Crust PC1',
                            5001: 'Turbulence',
                            8000: 'Darwinia',
                            12623: 'Kilt PC1',
                            82406: 'Hydrate'
                        }

function generateInfoPanel(){
	elem = document.getElementById('info_panel_content');
	var currentdate = new Date(); 
	var datetime = "As of: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	//display info
	text = "";
	text += "<text id = t0 x='" + (10) + "' y='" + (30) + "' fill='black'> INFO:  \n</text>";
	text += "<text id = t1 x='" + (10) + "' y='" + (50) + "' fill='black'> ACTIVE CHAINS: "+num_chains+  "\n</text>";
	text += "<text id = t2 x='" + (10) + "' y='" + (70) + "' fill='black'> Placeholder A \n</text>";
	text += "<text id = t3 x='" + (10) + "' y='" + (90) + "' fill='black'> Placeholder B \n</text>";
	text += "<text id = t4 x='" + (10) + "' y='" + (110) + "' fill='black'> "+datetime+  "\n</text>";
	text += "<text id = t5 x='" + (10) + "' y='" + (130) + "' fill='black'> What constants do we need?  \n</text>";
	elem.innerHTML = text;
}


// This generates the image on the webpage of the network
// It does so by generating the SVG components that make up the complete image
function generateChains() {
    console.log("Generating parachains.");
    elem = document.getElementById('message_svg');
	elem.style.fontSize="120%";
	
	
	
    // number = document.getElementById('num_chains').value;
    number = num_chains
    angleBetween = (360 / number) * (Math.PI / 180);
	sizeDifVal = .2;
	sizeDif = .8
	textXOffset = -60;
	textYOffset = -65;
    centerX = 350;
    centerY = 360;
    offsetX = -40; // previously used, no longer to center the SVG in a rectangle, change to 0 because the SVG is just a square now
    text = "";
	
	
	

    // build the outer parachain boxes and the paths that lead to the middle
    for (var i = 0; i < number; i++) {
        numVals = validator_groups[i].length;
		
        thisX = offsetX + centerX + Math.cos(angleBetween * i) * (centerX * sizeDif);
        thisY = centerY + Math.sin(angleBetween * i) * (centerX * sizeDif);
		
		for( var j = 0; j < numVals; j++){
			
			valX = thisX + Math.cos(angleBetween * (i-j/2)+ Math.PI)  * (centerX * sizeDifVal);
			valY = thisY + Math.sin(angleBetween * (i-j/2)+ Math.PI)  * (centerX * sizeDifVal);
			
			text += "<circle id='val_id_" + chains_array[i]+"-"+j + "'cx='" + (valX) + "' cy='" + (valY) + "' r='5' fill='#BBBBBB' stroke-width='20' stroke='#BBBBBB' />\n";
			
		}
		text += "<path id='path_under_id_" + chains_array[i] + "'d='M" + (thisX) + " " + (thisY) + " L" + (offsetX + centerX) + " " + centerY + " Z' stroke='none' stroke-width='2' />\n";
        text += "<path id='path_id_" + chains_array[i] + "'d='M" + (thisX) + " " + (thisY) + " L" + (offsetX + centerX) + " " + centerY + " Z' stroke='none' stroke-width='2' />\n";
        
        text += "<a data-toggle='modal' data-target='#paraModal' onClick='updateModal("+i+"); return false;'>"
        

        //text += "<rect id='chain_id_" + chains_array[i] + "' x='" + (thisX - 30) + "' y='" + (thisY - 30) + "' rx='10' ry='10' width='60' height='60' stroke='black' stroke-width='0' fill='#BBBBBB' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
		text += "<rect id='innerchain_id_" + chains_array[i] + "' x='" + (thisX - 12) + "' y='" + (thisY - 12) + "' rx='5' ry='5' width='24' height='24' fill='#ffffff' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
        text += "<rect id='chain_under_id_" + chains_array[i] + "' x='" + (thisX-12) + "' y='" + (thisY-12) + "' rx='5' ry='5' width='24' height='24' fill='#ffffff' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";

		
		text += "<circle id='chain_id_" + chains_array[i] + "'cx='" + (thisX) + "' cy='" + (thisY) + "' r='30' fill='#ffffff' stroke-width='20' stroke='#BBBBBB' />\n";
        text += "</a>\n";
        text += "<text x='" + (thisX + textXOffset) + "' y='" + (thisY + textYOffset) + "' fill='black'> " + parachain_id_to_name[chains_array[i]] + " (" + chains_array[i] + ")</text>";
        text += "<text id='hash_text_id_" + chains_array[i] + "' x='" + (thisX + textXOffset) + "' y='" + (thisY + textYOffset+20) + "' fill='black'></text>";
    }

    // build the relay chain
    text += "<a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frococo-rpc.polkadot.io#/explorer'>";
    text += "<circle id='relay_circle' cx='" + (centerX + offsetX) + "' cy='" + centerY + "' r='120' fill='none' stroke-width='40' stroke='#777777' />";

	//text += "</a>";
    text += "</a>";

    // build the little white boxes in the relay chain
    for (var i = 0; i < number; i++) {
        thisX = offsetX + centerX + Math.cos(angleBetween * i) * (centerX * .34);
        thisY = centerY + Math.sin(angleBetween * i) * (centerX * .34);
        text += "<rect id='chain_connect_id_" + chains_array[i] + "' x='" + (thisX - 10) + "' y='" + (thisY - 10) + "' rx='4' ry='4' width='20' height='20' fill='#FFFFFF' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
    }
    // console.log(text);
    elem.innerHTML = text;
}

function updateModal(para_id){
    console.log(para_id)
    console.log(chains_array[para_id])
    console.log(parachain_id_to_name[chains_array[para_id]])
    console.log(hash_array[para_id]['head'])
    document.getElementById("paraModal_title").innerHTML = parachain_id_to_name[chains_array[para_id]] + " - ID: "+chains_array[para_id]
    document.getElementById("paraModal_hash").innerHTML = "Hash: "+hash_array[para_id]['head']
    document.getElementById("paraModal_body").innerHTML = "Validators: \n"
    var text = "";
    text += "<a style='color:white' target='_blank' href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2F";
    text += parachain_id_to_url[chains_array[para_id]];
    text += "#/explorer'>Explorer</a>";
    document.getElementById("paraModal_link").innerHTML = text;
    for(let i = 0; i < validator_groups[para_id].length; i++) {
        document.getElementById("paraModal_body").innerHTML += active_validators[validator_groups[para_id][i]]+'\n' 
    }
}

async function main() {
    const provider = new WsProvider('wss://rococo-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });
    const chain = await api.rpc.system.chain();
    console.log(`Connected to ${chain}!`);

    update_parachain_heads(api);
    show_new_blocks(api);
    show_queues(api);

}

async function show_new_blocks(api) {
    const block_unsub = await api.rpc.chain.subscribeNewHeads((block) => {
        console.log("New block: " + block.number + "\n");
    })
}

async function show_queues(api) {
    const parachainIDS = await api.query.registrar.parachains(); // returns an arary of all the parachains connected to the network
    parachainIDS.forEach(async (id) => {
        await api.query.parachains.downwardMessageQueue(id, (incoming_messages) => {
            console.log("Parachain with ID " + id + " - Incoming Messages: " + incoming_messages.length + "\n");
        });
        await api.query.parachains.relayDispatchQueue(id, (outgoing_messages) => {
            console.log("Parachain ID " + id + " - Outoging Messages: " + outgoing_messages.length + "\n");
        });
    })
}

async function update_parachain_heads(api) {
    const parachainIDS = await api.query.paras.parachains(); // returns an arary of all the parachains connected to the network

    parachainIDS.forEach(async (id) => {
        await api.query.paras.heads(id, (head) => {
            // elem = document.getElementById('event_updates_content');
            // elem.innerText = elem.innerText + "Parachain with ID: " + id + " new head: " + head.toHuman() + "\n";
            console.log("Parachain with ID " + id + " - New Head: " + head.toHuman().substring(0, 20) + "...\n");
        });
    });
}

// main()
