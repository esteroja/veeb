const monthNamesET = ["jaanuar", "veerbuar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];

const dateETformatted = function(){

    let dateNow = new Date();
    return dateNow.getDate() + ". " + monthNamesET[dateNow.getMonth()] + " " + dateNow.getFullYear();
}

const timeFormatted = function() {

    let timestamp = new Date();
    return timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
}

const dateENGformatted = function() {

    let dateENGNow = new Date();
    return dateENGNow.getFullYear() + "-" + dateENGNow.getMonth() + "-" + dateENGNow.getDate();
}

const formatChange = function(engFormatDate) {
    let separated = []
    separated = engFormatDate.split(".");
    let estDate = new Date();
    let day = separated[1];
    let month = separated[0];
    let year = separated[2];
    let estFormatDate = day + "." + month + "." + year;
    return estFormatDate
}

/* const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    let dateEN = new Date();
    let dateET = new Date();
    let dateENformatted = months[dateEN.getMonth()] + "/" + dateEN.getDate() + "/" + dateEN.getFullYear();
    let dateETformatted = dateET.getDate() + "/" + months[dateET.getMonth()] + "/" + dateET.getFullYear();*/
const timeOfDayET = function() {
    let partOfDay = "suvaline hetk"; //allväärtus, nagu varuvariant kui miski muu ei toimi selleks, et midagigi oleks öeldud
    const hourNow = new Date().getHours();
    if(hourNow >= 6 && hourNow < 12) {
        partOfDay = "hommik";
    }
    if (hourNow > 14 && hourNow < 18) {
        partOfDay = "pärastlõuna";
    }
    if(hourNow >= 18) {
        partOfDay = "õhtu";
    }
    return partOfDay


}
//ekspordin kõik asjad, järgnev on massiiv, nende nimedega asju tahan näidata väljapoole, koolon tähendab väärtuse andmist(tahan selle nime seda asja ja teise nimega teist asja)
module.exports = {dateETformatted: dateETformatted, timeFormatted: timeFormatted, monthsET: monthNamesET, timeOfDayET: timeOfDayET}