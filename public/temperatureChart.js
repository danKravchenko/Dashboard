import { data } from "./getSensorsData.js";
let timeStamps = [];
let values = [];

var ctx = document.getElementById("temperature-chart").getContext("2d");
var temperatureChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: timeStamps,
    datasets: [
      {
        label: "Температура повітря (°C)",
        data: values,
        borderWidth: 2,
        pointBackgroundColor: "#ff3535",
        borderColor: "#ff3535",
         fill: {
          target: "origin",
          above: "#ff353550",
        },
      }
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grace: 10,
        ticks: {
          font: { size: 13 },
          callback: function (value, index, values) {
            return value += " °C";
          }
        }
      },
    },
    plugins: {
      legend: {
        labels: {
          font: { size: 17 }
        }
      }
    }
  }
});

function setData(value, max, array) {
  if (array.length < max) {
    array.push(value);
  }
  else {
    array.splice(0, 1);
    array.push(value);
  }
}

function update() {
  setData(data.temperature, 10, values);
  setData(data.timestamp, 10, timeStamps);
  temperatureChart.update();
}

export { update }
