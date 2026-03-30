const text1 = document.getElementById("text1");
const text2 = document.getElementById("text2");
const text3 = document.getElementById("text3");

main();

function main() {
    setTimeout(() => {
        text1.style.transform = "rotate(0) scale(1)";
        text1.style.opacity = 1;
        text1.style.filter = "blur(0)";
    }, 3000);
    setTimeout(() => {
        text1.style.transition = "all 1s cubic-bezier(.31,.01,.66,-0.59)";
        text1.style.transform = "rotate(90deg) scale(1)";
        text1.style.marginLeft = "800px";
        text1.style.opacity = 0;
        text1.style.filter = "blur(30px)";
    }, 4500);
    setTimeout(() => {
        text2.style.transform = "rotate(0) scale(1)";
        text2.style.marginRight = "0px";
        text2.style.opacity = 1;
        text2.style.filter = "blur(0)";

        text3.style.transform = "rotate(0) scale(1)";
        text3.style.marginRight = "0px";
        text3.style.opacity = 1;
        text3.style.filter = "blur(0)";
    }, 5500);
    setTimeout(() => {
        text2.style.transition = "all 1s cubic-bezier(.31,.01,.66,-0.59)";
        text2.style.transform = "rotate(0) scale(0)";
        text2.style.marginBottom = 0;
        text2.style.opacity = 0;
        text2.style.filter = "blur(30px)";

        text3.style.transition = "all 1s cubic-bezier(.31,.01,.66,-0.59)";
        text3.style.transform = "rotate(0) scale(0)";
        text3.style.marginTop = 0;
        text3.style.opacity = 0;
        text3.style.filter = "blur(30px)";
    }, 7000);
}