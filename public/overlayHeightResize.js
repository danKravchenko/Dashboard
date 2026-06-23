var overlay = document.getElementsByClassName("overlay")[0];

window.addEventListener("load", resize);

window.addEventListener("resize", resize);

window.addEventListener("scroll", resize);

function resize() {
    var vh =  document.documentElement.scrollHeight;
    overlay.style.setProperty("--vh", `${vh}px`);
}