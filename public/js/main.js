const ifm = document.createElement("iframe");
ifm.id = "ifm";
ifm.src = "../html/start.html";
ifm.allow = "fullscreen"; 
document.body.appendChild(ifm);
let isLocalhost;

async function getIslocalhost() {
    try {
        const response = await fetch(`/get-islocalhost`);
        const text = await response.text();
        if(text == "islocalhost"){
            isLocalhost = true;
            if(isLocalhost){
                setTimeout(() => {
                    changeHtml("home");
                }, 7000);
            }
        }
        else{
            alert('無法載入內容，請使用node.js啟動server.js');
            isLocalhost = false; 
        }
    } catch (error) {
        console.error('讀取文件失敗:', error);
        alert('無法載入內容，請使用node.js啟動server.js');
        isLocalhost = false;
    }
}

getIslocalhost();

const deviceWidth = window.innerWidth;
const deviceHeight = window.innerHeight;

let globalWidth;
let globalHeight;
let count = 0;
adjustScale();

function adjustScale(){
    globalWidth = 1920;
    globalHeight = 1080;
    ifm.style.width = globalWidth + "px";
    ifm.style.height = globalHeight + "px";
    if (globalHeight*(deviceWidth/globalWidth) > window.innerHeight){
        ifm.style.scale = deviceHeight/globalHeight;
        ifm.style.left = (deviceWidth-globalWidth*(deviceHeight/globalHeight))/2 + "px";
    }
    else{
        ifm.style.scale = deviceWidth/globalWidth;
        ifm.style.left = 0;
    }
}

document.addEventListener('fullscreenchange', () => {
    adjustScale();
    const deviceWidth = window.innerWidth;
    const deviceHeight = window.innerHeight;
    if (globalHeight*(deviceWidth/globalWidth) > window.innerHeight){
        ifm.style.scale = deviceHeight/globalHeight;
        ifm.style.left = (deviceWidth-globalWidth*(deviceHeight/globalHeight))/2 + "px";
    }
    else{
        ifm.style.scale = deviceWidth/globalWidth;
        ifm.style.left = 0;
    }
    handleFullscreenChange();
  });

function fullScreenBtnClick(x){
    fullscreen();
    x.style.display = 'none';
}

window.addEventListener('resize', () => {
    const deviceWidth = window.innerWidth;
    const deviceHeight = window.innerHeight;
    if (globalHeight*(deviceWidth/globalWidth) > window.innerHeight){
        ifm.style.scale = deviceHeight/globalHeight;
        ifm.style.left = (deviceWidth-globalWidth*(deviceHeight/globalHeight))/2 + "px";
    }
    else{
        ifm.style.scale = deviceWidth/globalWidth;
        ifm.style.left = 0;
    }
})


function fullscreen() {
    // check if fullscreen mode is available
    if (document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled) {
        // Do fullscreen
        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.webkitRequestFullscreen) {
            document.body.webkitRequestFullscreen();
        } else if (document.body.mozRequestFullScreen) {
            document.body.mozRequestFullScreen();
        } else if (document.body.msRequestFullscreen) {
            document.body.msRequestFullscreen();
        }
    }
    else {
        document.querySelector('.error').innerHTML = 'Your browser is not supported';
    }
}

function stinger(){
    const stinger = document.createElement("div");
    const wave11 = document.createElement("img");
    const wave12 = document.createElement("img");
    const wave21 = document.createElement("img");
    const wave22 = document.createElement("img");
    const stingerDot1 = document.createElement("div");
    const stingerDot2 = document.createElement("div");
    const stingerLine1 = document.createElement("div");
    const stingerLine2 = document.createElement("div");
    const stingerLine3 = document.createElement("div");
    const stingerLine4 = document.createElement("div");
    const stingerLine5 = document.createElement("div");
    const stingerLine6 = document.createElement("div");
    const stingerLine7 = document.createElement("div");
    const stingerLine8 = document.createElement("div");
    const stingerLine9 = document.createElement("div");
    const stingerLine10 = document.createElement("div");
    const stingerLine11 = document.createElement("div");
    const stingerLine12 = document.createElement("div");
    const stingerLine13 = document.createElement("div");
    const stingerLine14 = document.createElement("div");
    const stingerLine15 = document.createElement("div");
    const stingerLine16 = document.createElement("div");
    const stingerLine17 = document.createElement("div");
    const stingerLine18 = document.createElement("div");
    const stingerLine19 = document.createElement("div");
    const stingerLine20 = document.createElement("div");
    const stingerSound = document.createElement("audio");

    wave11.src = "../img/icon/wave.svg";
    wave12.src = "../img/icon/wave.svg";
    wave21.src = "../img/icon/wave-2.svg";
    wave22.src = "../img/icon/wave-2.svg";
    stingerSound.src = "../sound/transition.mp3";

    stinger.classList.add("stinger");
    wave11.classList.add("wave1");
    wave12.classList.add("wave2");
    wave21.classList.add("wave1");
    wave22.classList.add("wave2");
    stingerDot1.classList.add("stinger-dot");
    stingerDot2.classList.add("stinger-dot");
    stingerLine1.classList.add("stinger-line");
    stingerLine2.classList.add("stinger-line");
    stingerLine3.classList.add("stinger-line");
    stingerLine4.classList.add("stinger-line");
    stingerLine5.classList.add("stinger-line");
    stingerLine6.classList.add("stinger-line");
    stingerLine7.classList.add("stinger-line");
    stingerLine8.classList.add("stinger-line");
    stingerLine9.classList.add("stinger-line");
    stingerLine10.classList.add("stinger-line");
    stingerLine11.classList.add("stinger-line");
    stingerLine12.classList.add("stinger-line");
    stingerLine13.classList.add("stinger-line");
    stingerLine14.classList.add("stinger-line");
    stingerLine15.classList.add("stinger-line");
    stingerLine16.classList.add("stinger-line");
    stingerLine17.classList.add("stinger-line");
    stingerLine18.classList.add("stinger-line");
    stingerLine19.classList.add("stinger-line");
    stingerLine20.classList.add("stinger-line");

    stinger.id = "stinger";
    wave11.id = "wave1-1";
    wave12.id = "wave1-2";
    wave21.id = "wave2-1";
    wave22.id = "wave2-2";
    stingerDot1.id = "stingerDot1";
    stingerDot2.id = "stingerDot2";
    stingerLine1.id = "stingerLine1";
    stingerLine2.id = "stingerLine2";
    stingerLine3.id = "stingerLine3";
    stingerLine4.id = "stingerLine4";
    stingerLine5.id = "stingerLine5";
    stingerLine6.id = "stingerLine6";
    stingerLine7.id = "stingerLine7";
    stingerLine8.id = "stingerLine8";
    stingerLine9.id = "stingerLine9";
    stingerLine10.id = "stingerLine10";
    stingerLine11.id = "stingerLine11";
    stingerLine12.id = "stingerLine12";
    stingerLine13.id = "stingerLine13";
    stingerLine14.id = "stingerLine14";
    stingerLine15.id = "stingerLine15";
    stingerLine16.id = "stingerLine16";
    stingerLine17.id = "stingerLine17";
    stingerLine18.id = "stingerLine18";
    stingerLine19.id = "stingerLine19";
    stingerLine20.id = "stingerLine20";

    document.body.appendChild(stinger);
    stinger.appendChild(wave21);
    stinger.appendChild(wave22);
    stinger.appendChild(wave11);
    stinger.appendChild(wave12);
    stinger.appendChild(stingerDot1);
    stinger.appendChild(stingerDot2);
    stinger.appendChild(stingerLine1);
    stinger.appendChild(stingerLine2);
    stinger.appendChild(stingerLine3);
    stinger.appendChild(stingerLine4);
    stinger.appendChild(stingerLine5);
    stinger.appendChild(stingerLine6);
    stinger.appendChild(stingerLine7);
    stinger.appendChild(stingerLine8);
    stinger.appendChild(stingerLine9);
    stinger.appendChild(stingerLine10);
    stinger.appendChild(stingerLine11);
    stinger.appendChild(stingerLine12);
    stinger.appendChild(stingerLine13);
    stinger.appendChild(stingerLine14);
    stinger.appendChild(stingerLine15);
    stinger.appendChild(stingerLine16);
    stinger.appendChild(stingerLine17);
    stinger.appendChild(stingerLine18);
    stinger.appendChild(stingerLine19);
    stinger.appendChild(stingerLine20);
    stinger.appendChild(stingerSound);
    stingerSound.setAttribute('autoplay', 'true');

    setTimeout(() => {
        stinger.remove();
    }, 2900);
}

let stingerTime = 1000;



function changeHtml(html){
    stinger();
    setTimeout(() => {
        ifm.src = `../html/${html}.html`;
    }, stingerTime);
}


function toggleFullscreen(shouldEnable) {
    if (shouldEnable) {
        const docElm = document.body;
        if (docElm.requestFullscreen) docElm.requestFullscreen();
        else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
        else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
}

window.addEventListener("message", (event) => {
    switch(event.data.type){
        case "loadingComplete":
            changeHtml("home");
            break;
        case "fullScreen":
            toggleFullscreen(event.data.value);
            break;
    }
});
