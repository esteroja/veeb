const express = require('express');
const timeInfo = require('./datetime_et');
const fs = require("fs");
const app = express(); //lõime rakenduse (enamvähem nagu create server nodeis)

app.set('view engine', 'ejs'); //tuleb määrata ära mis mootoriga express app tööle hakkab
app.use(express.static('public')); //express.jsi vahevara, static(kataloogi staatiliselt pakkumine) - võtke kasutusele kataloog mida serveerid vabalt ehk võimaldab ligipääseda vabalt kui tead aadressi

app.get('/', (req, res)=>{
    //res.send('see töötab');
    //res.download('index.js')
    res.render('index');
});

app.get('/timenow', (req, res)=>{
    //res.send('test toimib');
    //res.download('index.js')
    const dateNow = timeInfo.dateETformatted();
    const timeNow = timeInfo.timeFormatted();
    //res.render('timenow');
    res.render('timenow', {nowD: dateNow, nowT: timeNow}); //loogelistes sulgudes objekt - nimi ja väärtuspaar??nowD on nowdate, selle nimega saadetakse ejs failile ja väärtus on datenow
});

app.get('/wisdom', (req, res) => {
    let folkWisdom = [];
    fs.readFile('public/txtfiles/vanasonad.txt', 'utf8', (err, data)=> { //callback funktisoon
        if (err){
            throw err;
        } 
        else {
            folkWisdom = data.split(";"); //folkwisdom saab võrdseks dataga mis loeti ja saadeti
            res.render('justlist', {h1: 'Vanasõnad', wisdom: folkWisdom}); //justlist on vaade. kogu folkWisdom massiivi saadad wisdom nime all(avalehele)
        }
    }); 
});

app.get('/names', (req, res) => {
    let allNames = [];
    fs.readFile('public/txtfiles/log.txt', 'utf8', (err, data)=> { //callback funktisoon
        if (err){
            throw err;
        } 
        else {
            allNames = data.replaceAll(",", " ").split(";"); //folkwisdom saab võrdseks dataga mis loeti ja saadeti
            //tuleb massiivi elemendi viimasest elemendist ehk ; lahti saada
            res.render('namelist', {h1: 'Nimed', names: allNames}); //justlist on vaade. kogu folkWisdom massiivi saadad wisdom nime all(avalehele)
        }
    }); 
});

app.listen(5128);