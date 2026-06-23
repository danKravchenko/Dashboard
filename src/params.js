var fs = require("node:fs/promises");
var settings = require('./settings');
var ss = require('simple-statistics');
var { getValues } = require('./dbHandler');
var { setLogs } = require('./logger');

setupParams();

async function setupParams() {
    let profiles = await fs.readFile("profiles.json", "utf-8");
    let profilesData = JSON.parse(profiles);
    let profile = profilesData.profiles.find(element => { return element.involved == true });
    settings.description = profile.description;

    Object.keys(profile.params).forEach((params, index) => {
        settings[params].priority = profile.params[params].priority;
        settings[params].min = profile.params[params].min;
        settings[params].max = profile.params[params].max;
    });
    console.log("Params for profile set up!");
}

async function paramsForecast(param) {
    var data = [];
    var time = 60 * 10;
    var values = await getValues(150);
    for (i = 0; i < values.length; i++) {
        data.push([30 * i, parseFloat(values[i][param])]);
    }
    var lr = ss.linearRegression(data);
    var forecast = lr.m * (data[data.length - 1][0] + time) + lr.b;
    settings.forecast[param] = forecast.toFixed(1);
}

async function checkParams(data) {
    checkTemperature(data);
    checkHumidity(data);
    checkC02Emissions(data);
}

function getEarlyMargin(min, max, sensitivity) {
    var range = max - min;
    var buffer = sensitivity * range * 0.3;
    var earlyMin = min + buffer;
    var earlyMax = max - buffer;
    return { earlyMin: earlyMin, earlyMax: earlyMax };
}

function checkTemperature(data) {
    var result = getEarlyMargin(settings.temperature.min, settings.temperature.max, settings.temperature.priority);
    if (data.temperature <= result.earlyMin) {
        if (settings.relaysStates["2"] == false) {
            setLogs(`Температура в приміщені ${data.temperature} °C та досягла встановленого мінімального порогу. Увімкнено систему обігріву.\n\n`);
        }
        settings.relaysStates["2"] = true;
        settings.relaysStates["4"] = false;
    } else if (data.temperature >= result.earlyMax) {
        if (settings.relaysStates["4"] == false) {
            setLogs(`Температура в приміщені ${data.temperature} °C та досягла встановленого максимального порогу. Увімкнено систему охолодження.\n\n`);
        }
        settings.relaysStates["2"] = false;
        settings.relaysStates["4"] = true;
    }
}

function checkHumidity(data) {
    var result = getEarlyMargin(settings.humidity.min, settings.humidity.max, settings.humidity.priority);
    if (data.humidity <= result.earlyMin) {
        if (settings.relaysStates["3"] == false) {
            setLogs(`Вологість в приміщені ${data.temperature} % та скоро досягне встановленого мінімального порогу. Увімкнено систему зволоження.\n\n`);
        }
        settings.relaysStates["3"] = true;
    } else if (data.humidity >= result.earlyMax) {
        settings.relaysStates["3"] = false;
    }
}

function checkC02Emissions(data) {
    var result = getEarlyMargin(0, settings.C02Emissions.max, settings.C02Emissions.priority);
    if (data.C02Emissions <= 400) {
        settings.relaysStates["1"] = false;
    } else if (data.C02Emissions >= result.earlyMax) {
        if (settings.relaysStates["1"] == false) {
            setLogs(`Рівень C02 в приміщені ${data.temperature} ppm та скоро досягне встановленого максимального порогу. Увімкнено систему вентиляцї.\n\n`);
        }
        settings.relaysStates["1"] = true;
    }
}

module.exports = { setupParams, checkParams, paramsForecast };