import { data } from "./getSensorsData.js";
let timeStamps = [];
let values = [];

var ctx = document.getElementById("humidity-chart").getContext("2d");
var humidityChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: timeStamps,
    datasets: [
      {
        label: "Відносна вологість повітря (%)",
        data: values,
        borderWidth: 2,
        fill: "origin",
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        max: 100,
        min: 0,
        grace: 10,
        ticks: {
          font: { size: 13 },
          callback: function (value, index, values) {
            return value += "%";
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
  setData(data.humidity, 10, values);
  setData(data.timestamp, 10, timeStamps);
  humidityChart.update();
}

export { update }
