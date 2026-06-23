window.addEventListener("load", refreshRelaysStates);

async function refreshRelaysStates(num) {
    let response = await fetch(`http://esp32project.ddns.net/getRelaysStates`);
    var states = await response.json();

    for (i = 0; i < 4; i++) {
        if (Object.values(states)[i] == true) {
            $(".handling").children().slice(2).eq(i).attr("class", "relay-active");
            $(".handling").children().slice(2).eq(i).children().slice(0).attr("src", "./images/switch-on-button.png");
            $(".state-text").eq(i).text("ВИКЛ. ");
        }
        else {
            $(".handling").children().slice(2).eq(i).attr("class", "relay-inactive");
            $(".handling").children().slice(2).eq(i).children().slice(0).attr("src", "./images/switch-off-button.png");
            $(".state-text").eq(i).text("ВКЛ. ");
        }
    }
}

function openJournal() {
    $(".journal").css("display", "inherit");
    $(".open-journal-icon").css('--display-state', 'none');
}

function closeJournal() {
    $(".journal").css("display", "none");
    $(".open-journal-icon").css('--display-state', 'none');
}

setInterval(async () => {
    refreshRelaysStates();
}, 5000);

async function setupRelay(num) {
    await fetch(`http://esp32project.ddns.net/setupRelays?num=${num}`);
    refreshRelaysStates();
}