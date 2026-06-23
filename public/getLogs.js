var preTag = document.getElementsByTagName("pre")[0];
var vh = window.innerHeight;

document.documentElement.style.setProperty("--vh", `${vh}px`);

window.addEventListener("load", getLogs);
window.addEventListener("resize", function() {
    var vh = window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
});

async function getLogs(){
    var response = await fetch("http://esp32project.ddns.net/getLogs");
    if (response.status == 200) {
        var data = await response.text();
        preTag.innerHTML = data;
    }
}

setInterval(getLogs, 5000);