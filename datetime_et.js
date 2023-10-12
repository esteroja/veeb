const monthNamesET = ["jaanuar", "veerbuar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];

const dateETformatted = function(){

    let dateNow = new Date();
    return dateNow.getDate() + ". " + monthNamesET[dateNow.getMonth()] + " " + dateNow.getFullYear();
 }

const timeFormatted = function() {

    let timestamp = new Date();
    return timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
}

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