var mqtt = require("mqtt");
var { setLogs } = require('./logger');
var { setTime } = require('./setTime');
var { addValues } = require('./dbHandler');
var cron = require('node-cron');
var settings = require('./settings');

class MqttHandler {
    constructor() {
        this.mqttClient = null;
        this.data = {};
        this.host = "mqtt://192.168.1.252";
    }

    connect() {
        this.mqttClient = mqtt.connect(this.host);

        this.mqttClient.on("connect", () => {
            setLogs("З`єднання з модулем встановлено.\n\n");
            settings.connectionState = true;
            this.mqttClient.subscribe("sensorsData");
        });

        this.mqttClient.on("error", () => {
            if (this.connectState == true) {
                setLogs("З`єднання з модулем було втрачено.\n\n");
                settings.connectionState = false;
            }
        });

        this.mqttClient.on("message", (topic, payload) => {
            this.data = JSON.parse(payload.toString());
            this.data.timestamp = setTime();
            if (this.data.temperature != null && this.data.humidity != null && this.data.C02Emissions != null) {
                addValues(`'${this.data.temperature}', '${this.data.humidity}', '${this.data.C02Emissions}', 
                    '${new Date().toLocaleDateString()} ${this.data.timestamp}'`);
            }
        });
    }

    publishMessage(topic, message) {
        if (topic == "relays") {
            this.mqttClient.publish("relays", message);
        }
    }

    reconnect() {
        this.mqttClient.reconnect();
    }
}

module.exports = MqttHandler;