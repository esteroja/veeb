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
app.set('views', viewPath);
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));


app.get('/', (req, res)=>{
    notice = '';
    let sql = 'SELECT player_number, MAX(player_result) as max_result FROM vp_ball GROUP BY player_number ORDER BY max_result DESC LIMIT 3';
    pool.getConnection((err, conn)=>{
        if (err) {
            throw err;
            conn.release();
        } else {
            conn.execute(sql, (err, bestResults)=>{
                //console.log(bestResults);
                notice = "3 parimat mängijat leitud."
                res.render('vise', {notice: notice, bestPlayers: bestResults});
                conn.release();
            });
        }
    });
});

app.post('/', (req, res)=>{
    let notice = '';
    let sqlUpdate = 'UPDATE vp_ball SET player_result = ? WHERE player_number = ? AND date = ? AND player_result < ?'
    let sqlInsert = 'INSERT INTO vp_ball (player_number, date, player_result) VALUES (?, ?, ?)';
    let sqlQuery = 'SELECT player_number, date, player_result FROM vp_ball WHERE player_number = ? ORDER BY player_result DESC';
    const resultInput = parseFloat(req.body.resultInput);
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        } else {
            conn.execute(sqlUpdate, [resultInput, req.body.personInput, req.body.dateInput, resultInput], (err, updateResult)=>{
                if (err) {
                    throw err;
                    res.render('vise', {notice: "sql update bloki error"});
                } else {
                    if (updateResult.affectedRows > 0) {
                        conn.execute(sqlQuery, [req.body.personInput], (err, result) => {
                            if (err) {
                                notice = "Ei saa kuvada andmeid"
                                res.render('single_result', {notice: notice})
                            } else {
                                if (result && result.length > 0) {
                                    notice = "Andmed edukalt kuvatud";
                                    //console.log(result)
                                    res.render('single_result', {playerInfo: result, notice: notice});
                                } else {
                                    notice = "Võistlejat ei leitud";
                                    res.render('single_result', {notice: notice});
                                }
                            }

                        });
                    } else {
                        conn.execute(sqlInsert, [req.body.personInput, req.body.dateInput, resultInput], (err, result)=>{
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
                                            //console.log(result)
                                            res.render('single_result', {playerInfo: result, notice: notice});
                                        } else {
                                            notice = "Võistlejat ei leitud";
                                            res.render('single_result', {notice: notice});
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        };
    });
});


app.listen(5128);

