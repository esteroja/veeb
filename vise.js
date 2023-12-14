const express = require('express');
const fs = require("fs");
const app = express();
const timeInfo = require('./src/datetime_et');
const bodyparser = require('body-parser');
const pool = require('./src/databasepool').pool;
const async = require('async');
const path = require('path');
const viewPath = path.join(__dirname, '/views2');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));


app.get('/', (req, res)=>{
    res.render('vise');
});

app.post('/', (req, res)=>{
    let notice = '';
    let sqlInsert = 'INSERT INTO vp_ball (player_number, date, player_result) VALUES (?, ?, ?)';
    let sqlQuery = 'SELECT date, player_result FROM vp_ball WHERE player_number = ?';
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        } else {
            conn.execute(sqlInsert, [req.body.personInput, req.body.dateInput, req.body.resultInput], (err, result)=>{
                if (err) {
                    notice = "Andmete salvestamine ebaõnnestus.";
                    res.render('vise', {notice: notice});
                    throw err;
                } else {
                    conn.execute(sqlQuery, [req.body.personInput], (err, result)=>{
                        if(err){
                            notice = "Ei saa kuvada andmeid"
                            res.render('single_result', {notice: notice})
                        } else {
                            if (result && result.length > 0) {
                                notice = "Andmed edukalt kuvatud";
                                res.render('single_result', { playerInfo: result, notice: notice });
                            } else {
                                notice = "Võistlejat ei leitud";
                                res.render('single_result', { notice: notice });
                            }
                        }
                    });
                };
            });
        };
    }); 
});
   
app.listen(5128);