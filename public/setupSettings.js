async function setupMode(name) {
    var response = await fetch(`http://esp32project.ddns.net/setupMode?mode=${name}`);
}

setInterval(async () => {
    await getSettingsParams();
}, 5000);

window.addEventListener("load", async function () {
    await getSettingsParams();
});

async function getSettingsParams() {
    var response = await fetch(`http://esp32project.ddns.net/setupSettings`);
    var data = await response.json();
    if (data.connectionState == true) {
        document.getElementById("connection-status").textContent = "З'єднання з модулем встановлено";
    }
    else {
        document.getElementById("connection-status").textContent = "З'єднання з модулем не встановлено";
    }

    if (data.mode["off-line"] == true) {
        document.getElementById("radio-mode-1").setAttribute("checked", "");
    } else if (data.mode.handheld == true) {
        document.getElementById("radio-mode-2").setAttribute("checked", "");
    }
}