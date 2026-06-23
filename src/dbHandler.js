var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '567123',
    database: 'sensors_data'
});

connection.connect(function (err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Database connection established!');
});

function addValues(values) {
    connection.query(`INSERT INTO data VALUES (${values})`);
    checkValuesCount();
}

function deleteValues() {
    connection.query(`DELETE FROM data LIMIT 150`);
}

function checkValuesCount() {
    connection.query(`SELECT COUNT(*) FROM data`, (err, result, fields) => {
        if (result[0]['COUNT(*)'] == 300) {
            deleteValues();
        }
    });
}

async function getValues(num) {
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT * FROM data ORDER BY time DESC LIMIT ${num}`, (err, result, fields) => {
            resolve(result.reverse());
        });
    });
}

module.exports = { addValues, getValues };