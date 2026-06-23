var panel = document.getElementsByClassName("add-profile-panel")[0];
var overlay = document.getElementsByClassName("overlay")[0];

window.addEventListener("load", function () {
    loadProfiles();
    $("#profile-name").val("");
    $("#profile-description").val("");
    $("#profile-priority-temperature").val(0.1);
    $("#profile-priority-humidity").val(0.1);
    $("#profile-priority-C02-Emissions").val(0.1);
});

function loadProfiles() {
    $(".profiles").empty();
    fetch("http://esp32project.ddns.net/getProfiles").then(res => res.json()).then(data => {
        Object.values(data).forEach((profile, index) => {
            $(".profiles").append("<div class='profile'></div>");
            $(".profile").eq(index).append("<div class='profile-header'></div>");
            $(".profile-header").eq(index).append(`<div class='profile-info'>Профіль <b>${profile.profileName}</b>
            в статусі: <b>${profile.involved == true ? "активно" : "неактивно"}</b> </div>`);
            $(".profile-header").eq(index).append("<div class='profile-buttons'></div>");
            $(".profile-buttons").eq(index).append(`<button class='dashboard-button' onclick="setupProfileStatus('${profile.id}')">Задіяти</button>`);
            $(".profile-buttons").eq(index).append(`<button class='dashboard-button' onclick="deleteProfile('${profile.id}')">Видалити профіль</button>`);
            $(".profile").eq(index).append("<hr>");
            $(".profile").eq(index).append(`<p class='profile-text'><b>Опис:</b> ${profile.description}</p>`);
        });
    });
}

var sliderRangeTemperature = function () {
    $("#slider-range-temperature").slider({
        range: true,
        min: 0,
        max: 50,
        values: [15, 20],
        slide: function (event, ui) {
            $("#amount-temperature").val(ui.values[0] + "°C — " + ui.values[1] + "°C");
        }
    });
    $("#amount-temperature").val($("#slider-range-temperature").slider("values", 0) + "°C — " +
        $("#slider-range-temperature").slider("values", 1) + "°C");
}

var sliderRangHumidity = function () {
    $("#slider-range-humidity").slider({
        range: true,
        min: 0,
        max: 100,
        values: [40, 60],
        slide: function (event, ui) {
            $("#amount-humidity").val(ui.values[0] + "% — " + ui.values[1] + "%");
        }
    });
    $("#amount-humidity").val($("#slider-range-humidity").slider("values", 0) + "% — " +
        $("#slider-range-humidity").slider("values", 1) + "%");
}

var sliderRaneC02Emissions = function () {
    $("#slider-range-C02-Emissions").slider({
        min: 0,
        max: 2000,
        value: 400,
        range: "min",
        slide: function (event, ui) {
            $("#amount-C02-Emissions").val(ui.value + " ppm");
        }
    });
    $("#amount-C02-Emissions").val($("#slider-range-C02-Emissions").slider("value") + " ppm");
}

$(sliderRangeTemperature);
$(sliderRangHumidity);
$(sliderRaneC02Emissions);

function closeTab() {
    panel.style.display = "none";
    overlay.style.display = "none";
}

function openTab() {
    panel.style.display = "flex";
    overlay.style.display = "inherit";
    $("#profile-name").val("");
    $("#profile-description").val("");
    $("#profile-priority-temperature").val(0.1);
    $("#profile-priority-humidity").val(0.1);
    $("#profile-priority-C02-Emissions").val(0.1);
    $(sliderRangeTemperature);
    $(sliderRangHumidity);
    $(sliderRaneC02Emissions);
}

async function addProfile() {
    var profileName = $("#profile-name").val();
    var description = $("#profile-description").val();
    var priorityTemperature = $("#profile-priority-temperature").val();
    var priorityHumidity = $("#profile-priority-humidity").val();
    var priorityC02Emissions = $("#profile-priority-C02-Emissions").val();
    var minTemperature = $("#slider-range-temperature").slider("values", 0);
    var maxTemperature = $("#slider-range-temperature").slider("values", 1);
    var minHumidity = $("#slider-range-humidity").slider("values", 0);
    var maxHumidity = $("#slider-range-humidity").slider("values", 1);
    var maxC02Emissions = $("#slider-range-C02-Emissions").slider("value");

    await fetch("http://esp32project.ddns.net/addProfile", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profileName: profileName,
            description: description,
            params: {
                "temperature": {
                    "priority": priorityTemperature,
                    "min": minTemperature,
                    "max": maxTemperature
                },
                "humidity": {
                    "priority": priorityHumidity,
                    "min": minHumidity,
                    "max": maxHumidity
                },
                "C02Emissions": {
                    "priority": priorityC02Emissions,
                    "max": maxC02Emissions
                },
            }
        })
    });
    loadProfiles();
    closeTab();
}

async function setupProfileStatus(id) {
    await fetch(`http://esp32project.ddns.net/involveProfile?profile=${id}`);
    loadProfiles();
}

async function deleteProfile(id) {
    await fetch(`http://esp32project.ddns.net/deleteProfile?profile=${id}`);
    loadProfiles();
}
