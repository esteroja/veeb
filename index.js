const express = require('express');
const fs = require("fs");
const app = express(); //lõime rakenduse (enamvähem nagu create server nodeis)
const mysql = require('mysql2');
const timeInfo = require('./datetime_et');
const bodyparser = require('body-parser');
const dbInfo = require('../../vp23config');

app.set('view engine', 'ejs'); //tuleb määrata ära mis mootoriga express app tööle hakkab, visualiseerimise mootor
app.use(express.static('public')); //express.jsi vahevara, static(kataloogi staatiliselt pakkumine) - võtke kasutusele kataloog mida serveerid vabalt ehk võimaldab ligipääseda vabalt kui tead aadressi
app.use(bodyparser.urlencoded({extended: false})); //võrab päringu/requesti, sinna on kodeeritud sisse andmed, encodediga kodeerib lahti, extended false tähendab et kõige lihtsamad andmed ja pole nt lisatud faile,pilte vms, aint tekstiinfo, isegi numbrid(kuupäev) läheb sinna sisse

//loon andmebaasiühenduse
const connection = mysql.createConnection({
    host: dbInfo.configData.host, 
    user: dbInfo.configData.user, 
    password: dbInfo.configData.password,
    database: dbInfo.configData.database
});

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
    let allElements = [];
    let separatedElements = [];
    fs.readFile('public/txtfiles/log.txt', 'utf8', (err, data)=> {
        if (err){
            throw err;
        }
        else {
            allNames = data.replaceAll(",", " ").split(";").filter(element => element.trim() !== '');
            allElements = data.split(";")
                .flatMap(item => item.split(","))
                .map(element => element.trim())
                .filter(element => element);
            for (let i = 0; i < allElements.length; i += 3) {
                if (allElements[i] && allElements[i + 1] && allElements[i + 2]) {
                    separatedElements.push([allElements[i], allElements[i + 1], allElements[i + 2]]);
                }
            }
            console.log(separatedElements)
            res.render('namelist', {h1: 'Nimed', names: allNames}); 
        }
    });
});

app.get('/eestifilm', (req, res)=>{
    res.render('filmindex');
});

app.get('/eestifilm/filmiloend', (req, res)=>{
    let sql = 'SELECT title, production_year, duration FROM movie'; //siin hoiad sequel päringu teskti
    let sqlResult = [];
    connection.query(sql, (err, result) => { //query funktsiooniga saab data kätte
        if (err) {
            res.render('filmlist', {filmlist: sqlResult});
            throw err;
            //connection.end();
        } else {
            //console.log(result[7]);
            res.render('filmlist', {filmlist: result});
            //connection.end();
        }
    });
});

app.get('/eestifilm/addfilmperson', (req, res)=>{
    res.render('addfilmperson');
});

app.post('/eestifilm/addfilmperson', (req, res)=>{ //selleks et salvestada info formi kaudu
    //res.render('addfilmperson');
    //res.send(req.body);
    let notice = '';
    let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES (?, ?, ?)'; //küsimärke peab olema nii palju kui andmeid oodatakse
    connection.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
        if (err) {
            notice = "Andmete salvestamine ebaõnnestus.";
            res.render('addfilmperson', {notice: notice}); //esimene notice nimetus/läheb viewsse, teine notice on see kust ta väärtuse saab
            throw err;
        } else {
            notice = req.body.firstNameInput + ' ' + req.body.lastNameInput + ' ' + ' salvestamine õnnestus.';
            res.render('addfilmperson', {notice: notice});
        }
    });
});

app.get('/eestifilm/singlefilm', (req, res)=>{
    res.render('singlefilm');
});

app.get('/eestifilm/singlefilm', (req, res)=>{
    let max_value = 'SELECT COUNT(id) FROM movie';
    let sql = 'SELECT FROM movie WHERE id= '; //id on inputist??

});

app.listen(5128);