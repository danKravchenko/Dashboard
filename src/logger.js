var fs = require("node:fs/promises");
var { setTime } = require('./setTime');
var IdGenerator = require('auth0-id-generator');
var generator = new IdGenerator({ len: 10, alphabet: 'abcdefghqyu1234567890' });
var settings = require('./settings');

async function setLogs(text) {
  settings.message.id = generator.get();
  settings.message.text = text;
  await fs.writeFile("./logs/logs.txt", formText(text), { flag: 'a' });
}

function formText(text) {
  return `[${new Date().toLocaleDateString()} ${setTime()}] - ${text}`;
}

module.exports = { setLogs };