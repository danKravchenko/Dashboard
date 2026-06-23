import { update as updateTemperature } from "./temperatureChart.js";
import { update as updateHumidity } from "./humidityChart.js";
import { update as updateC02Emissions } from "./C02EmissionsChart.js";

var data;
var currentRecommendationId;
var currentMessageId;

window.addEventListener("load", getSensorsData);

setInterval(async () => {
    getSensorsData();
}, 30000);

async function getSensorsData() {
    let response = await fetch("http://esp32project.ddns.net/getData");
    if (response.status == 200) {
        var sensorsData = await response.json();
        // оновлюємо дані графіків
        data = sensorsData;
        updateTemperature();
        updateHumidity();
        updateC02Emissions();
        updatePanelMonitor();
    }
}

function updatePanelMonitor() {
    $(".params").children().eq(2).html(`<b>Температура:</b> ${data.temperature}°C
     ( T<sub>min-max</sub> ${data.params.temperature.min} – ${data.params.temperature.max}°C )`);
    $(".params").children().eq(3).html(`<b>Вологість:</b> ${data.humidity} %
     ( RH<sub>min-max</sub> ${data.params.humidity.min} – ${data.params.humidity.max} % )`);
    $(".params").children().eq(4).html(`<b>Свіжість повітря (рівень CO<sub>2</sub>):</b> ${data.C02Emissions} ppm <br>
     ( CO<sub>2 max</sub> ${data.params.C02Emissions.max} ppm )`);
    if (currentRecommendationId != data.params.recommendation.id) {
        $(".messages").append(`<div class='message'><b>Рекомендація від ШІ: </b>${data.params.recommendation.text}</div>`);
        currentRecommendationId = data.params.recommendation.id;
        $(".open-journal-icon").css('--display-state', 'block');
    }
    if (currentMessageId != data.params.message.id) {
        $(".messages").append(`<div class='message'><b>Система: </b>${data.params.message.text}</div>`);
        currentMessageId = data.params.message.id;
        $(".open-journal-icon").css('--display-state', 'block');
    }
}

export { data };
