const express = require('express');
const fs = require("fs");
const app = express();
const bodyparser = require('body-parser');
const pool = require('./src/databasepool').pool;
const path = require('path');
const viewPath = path.join(__dirname, '/views3');
const async = require('async');

app.set('view engine', 'ejs');
app.set('views', viewPath);
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));

app.get('/', (req, res)=>{
    res.render('addpeople')
});

app.post('/', (req, res)=>{
    let femWorkers, maleWorkers, femStudents, maleStudents;
    pool.getConnection((err, conn)=>{
        if (err) {
            throw err;
        }
        const myQueries = [
            function conn_categories (callback) {
                conn.execute('INSERT INTO vp_univ_count (female_workers, male_workers, female_students, male_students) VALUES (?, ?, ?, ?)', [req.body.femWorkInput, req.body.maleWorkInput, req.body.femStudInput, req.body.maleStudInput], (err, result)=>{
                    if (err) {
                        return callback(err);
                    } else {
                        console.log("conn cat")
                        return callback(null, result)
                    }
                });
            },
            function conn_count (callback) {
                conn.execute('INSERT INTO vp_univ_count (overall_people) SELECT female_workers + male_workers + female_students + male_students AS overall_people FROM vp_univ_count', (err, result)=>{
                    if (err) {
                        return callback(err);
                    } else {
                        console.log("conn count")
                        return callback(null, result)
                    }
                });
            },
            function conn_last (callback) {
                conn.execute('SELECT * FROM vp_univ_now ORDER BY date_time DESC LIMIT 1', [req.body.movingInput], (err, result)=>{
                    if (err){
                        return callback(err);
                    } else {
                        console.log("enne movingbody inputi")
                        if (req.body.movingInput === "siseneb" || req.body.movingInput === "väljub") {
                            conn.execute(sqlLast, (err, result) => {
                                if (err) {
                                    throw err;
                                    notice = "Ei saa kätte viimast kirjet NOW tabelist";
                                    res.render('addpeople', { notice: notice });
                                } else {
                                    console.log("arvutab miinuseid ja plusse")
                                    femWorkers = result[0].female_workers;
                                    maleWorkers = result[0].male_workers;
                                    femStudents = result[0].female_students;
                                    maleStudents = result[0].male_students;

                                    if (req.body.movingInput === "siseneb") {
                                        femWorkers += parseInt(req.body.femWorkInput);
                                        maleWorkers += parseInt(req.body.maleWorkInput);
                                        femStudents += parseInt(req.body.femStudInput);
                                        maleStudents += parseInt(req.body.maleStudInput);
                                    } else if (req.body.movingInput === "väljub") {
                                        femWorkers -= parseInt(req.body.femWorkInput);
                                        maleWorkers -= parseInt(req.body.maleWorkInput);
                                        femStudents -= parseInt(req.body.femStudInput);
                                        maleStudents -= parseInt(req.body.maleStudInput);
                                    }
                                    conn.execute('INSERT INTO vp_univ_now (female_workers, male_workers, female_students, male_students) VALUES (?, ?, ?, ?)', [femWorkers, maleWorkers, femStudents, maleStudents], (err, result)=>{
                                        if (err){
                                            throw err;
                                        } else {
                                            if (req.body.movingInput === "siseneb" || req.body.movingInput === "väljub") {
                                            res.render('addpeople');
                                            return callback(null, result)
                                        }
                                    });
                                }
                            });
                        };
                    }
                });
            }
        ];
        async.parallel(myQueries, (err, results)=>{
            if (err) {
                throw err;
            } else {
                console.log(results)
                res.render('addpeople', {data:results});
            }
        });
    });
});

app.listen(5128);