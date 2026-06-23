function setTime() {
    let date = new Date();
    let hour = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    var currentTime = `${hour}:${minutes.slice(-2)}:${seconds.slice(-2)}`;
    return currentTime;
}

module.exports = { setTime };