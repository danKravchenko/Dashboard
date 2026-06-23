var express = require("express");
var fs = require("node:fs/promises");
var mqttHandler = require('./src/mqttHandler');
var IdGenerator = require('auth0-id-generator');
var { setupParams, checkParams, paramsForecast } = require('./src/params');
var { makeGroqReqest } = require('./src/groqAPI');
var settings = require('./src/settings');
var handlebars = require("express-handlebars");
var cron = require('node-cron');
var { setLogs } = require('./src/logger');

var app = express();
var mqttClient = new mqttHandler();
var generator = new IdGenerator({ len: 10, alphabet: 'abcdefghqyu1234567890' });
var hbs = handlebars.create({
  defaultLayout: 'index',
  extname: 'hbs'
});

mqttClient.connect();
app.use(express.static(__dirname + "/public/"));
app.engine('hbs', hbs.engine);
app.set('views', './views');
app.set("view engine", "hbs");
app.use(express.json());

cron.schedule(' */5 * * * * *', async () => {
  if (settings.mode["off-line"] == true) {
    checkParams(mqttClient.data);
  }
  mqttClient.publishMessage("relays", JSON.stringify(settings.relaysStates));
});

cron.schedule(' */10 * * * *', async () => {
  await paramsForecast("temperature");
  await paramsForecast("humidity");
  await paramsForecast("C02Emissions");
  console.log(`Поточні параметри станом ${new Date().toLocaleDateString()}: температура - ${mqttClient.data.temperature},
    вологість - ${mqttClient.data.humidity}, свіжість повітря - ${mqttClient.data.C02Emissions}. Очікувані: температура - ${settings.forecast.temperature}, 
    вологість - ${settings.forecast.humidity}, свіжість повітря - ${settings.forecast.C02Emissions}.`);
  /*settings.recommendation.text = await makeGroqReqest(`Ти система порад, яка враховує параметрами мікроклімату 
    в приміщені та вплив на людину. Особливості людини: ${settings.description} Врахуй особливості та надай рекомендації щодо
    мікроклімату (температура, вологість, свіжість повітря). Поточні параметри: температура - ${mqttClient.data.temperature},
    вологість - ${mqttClient.data.humidity}, свіжість повітря - ${mqttClient.data.C02Emissions}. 
    Очікувані параметри мікроклімату на найближчі  10 хв: температура - ${settings.forecast.temperature}, 
    вологість - ${settings.forecast.humidity}, свіжість повітря - ${settings.forecast.C02Emissions}. Загальна рекомендацію в 1 невелике речення 
    (передбачено вентиляцію, охолодження, зволоження, обігрів в системі).`);
  settings.recommendation.id = generator.get();*/
});

app.get("/", (req, res) => {
  res.redirect("/monitoring");
});

app.get("/monitoring", (req, res) => {
  res.render("charts", { header: "Поточні параметри мікролімату в приміщені" });
});

app.get("/profiles", (req, res) => {
  res.render("profiles", { header: "Доступні профілі" });
});

app.get("/logs", (req, res) => {
  res.render("logs", { header: "Журнал подій" });
});

app.get("/settings", (req, res) => {
  res.render("settings", { header: "Налаштування" });
});

app.get("/setupRelays", (req, res) => {
  let relay = settings.relaysStates[`${req.query.num}`];
  if (relay == true && req.query.num > 0 && req.query.num < 5) {
    settings.relaysStates[`${req.query.num}`] = false;
  } else if (relay == false && req.query.num > 0 && req.query.num < 5) {
    settings.relaysStates[`${req.query.num}`] = true;
  }
  mqttClient.publishMessage("relays", JSON.stringify(settings.relaysStates));
  res.sendStatus(200);
});

app.get("/getRelaysStates", (req, res) => {
  res.send(settings.relaysStates);
});

app.get("/setupMode", (req, res) => {
  if (req.query.mode == "off-line") {
    settings.mode["off-line"] = true;
    settings.mode.handheld = false;
  } else if (req.query.mode == "handheld") {
    settings.mode.handheld = true;
    settings.mode["off-line"] = false;
  }
  res.sendStatus(200);
});

app.get("/setupSettings", (req, res) => {
  res.send({ connectionState: settings.connectionState, mode: settings.mode });
});


app.get("/getLogs", async (req, res) => {
  let logs = await fs.readFile("./logs/logs.txt", "utf-8");
  logs.length > 0 ? res.send(logs) : res.send("На даний момент будь-які дані відстутні.");
});

app.get("/getData", (req, res) => {
  if (settings.connectionState == true) {
    mqttClient.data.params = settings;
    res.send(mqttClient.data);
  } else {
    mqttClient.reconnect();
  }
});

app.get("/getProfiles", async (req, res) => {
  let profiles = await fs.readFile("profiles.json", "utf-8");
  let data = JSON.parse(profiles);
  res.send(data.profiles);
});

app.get("/involveProfile", async (req, res) => {
  let profiles = await fs.readFile("profiles.json", "utf-8");
  let data = JSON.parse(profiles);

  data.profiles.forEach(element => {
    if (element.id == req.query.profile) {
      element.involved = true;
    } else {
      element.involved = false;
    }
  });
  await fs.writeFile("profiles.json", JSON.stringify(data));
  setupParams();
  res.sendStatus(200);
});

app.post("/addProfile", async (req, res) => {
  let profiles = await fs.readFile("profiles.json", "utf-8");
  let data = JSON.parse(profiles);
  let profile = {};

  profile["id"] = generator.get();

  Object.keys(req.body).forEach((params, index) => {
    profile[params] = Object.values(req.body)[index];
  });

  profile["involved"] = false;
  data.profiles.push(profile);
  await fs.writeFile("profiles.json", JSON.stringify(data));
  res.sendStatus(200);
});

app.get("/deleteProfile", async (req, res) => {
  let profiles = await fs.readFile("profiles.json", "utf-8");
  let data = JSON.parse(profiles);
  if (data.profiles.length > 1) {
    let index = data.profiles.findIndex(element => { return element.id == req.query.profile });
    data.profiles.splice(index, 1);
    await fs.writeFile("profiles.json", JSON.stringify(data));
    res.sendStatus(200);
  } else {
    res.sendStatus(200);
  }
});

app.listen(80);
