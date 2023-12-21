const express = require('express');
const fs = require("fs");
const app = express();
const bodyparser = require('body-parser');
const pool = require('./src/databasepool').pool;
const path = require('path');
const viewPath = path.join(__dirname, '/views4');
//const session = require('express-session');

app.set('view engine', 'ejs');
app.set('views', viewPath);
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));

app.get('/', (req, res)=>{
    notice = '';
    let sql = 'SELECT id, drink, unitprice, stock FROM vp_drinkstock WHERE unitprice > 0';
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            throw err;
        } else {
            conn.execute(sql, (err, drinkResults)=>{
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    notice = "Valikus olevad joogid on kuvatud.";
                    res.render('user', {notice: notice, drinkData: drinkResults});
                    conn.release();
                }
            });
        }
    });
});

app.post('/', (req, res)=>{
    let sql = 'UPDATE vp_drinkstock SET stock = stock - 1, sold = sold + 1 WHERE id = ?';
    let sqlCash = 'UPDATE vp_drinkcash SET money_amount = money_amount + (SELECT unitprice FROM vp_drinkstock WHERE id = ?) WHERE ID = 1';
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            throw err;
        } else {
            console.log("selected drink:", [req.body.selectedDrink]);
            console.log("selected drink 0:", [req.body.selectedDrink[0]]);
            conn.execute(sql, [req.body.selectedDrink[0]], (err, stockResult)=>{
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    conn.execute(sqlCash, [req.body.selectedDrink[0]], (err, cashResult)=>{
                        if (err) {
                            conn.release();
                            throw err;
                        } else {
                            res.redirect('/');
                            conn.release();                          
                        }
                    });
                }
            });
        }
    });
});

app.get('/owner', (req, res)=>{
    notice = '';
    let sql = 'SELECT id, drink, stock FROM vp_drinkstock';
    let sqlQuery = 'SELECT money_amount FROM vp_drinkcash'
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            throw err;
        } else {
            let data = {};
            conn.execute(sql, (err, stockResults)=>{
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    data.stockData = stockResults;
                    conn.execute(sqlQuery, (err, moneyResult)=>{
                        if (err) {
                            conn.release();
                            throw err;
                        } else {
                            data.money = moneyResult;
                            notice = 'Laoseis on kuvatud'
                            console.log(data)
                            res.render('owner', {notice: notice, data: data});
                            conn.release();
                        }
                    });
                }
            });
        }
    });
});

app.post('/owner', (req, res)=>{
    notice = '';
    let sql = 'UPDATE vp_drinkstock SET drink = ?, unitprice = ? WHERE id = ?';
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            throw err;
        } else {
            conn.execute(sql, [req.body.newNameInput, req.body.newPriceInput, req.body.selectedDrink[0]], (err, result)=>{
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    notice = "Nimi ja hind on muudetud"
                    res.redirect('owner');
                    conn.release();
                }
            });
        }
    });
});

app.get('/adddrinks', (req, res)=>{
    let sql = 'SELECT id, drink, stock FROM vp_drinkstock';
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            throw err;
        } else {
            conn.execute(sql, (err, result)=>{
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    res.render('adddrinks', {stockData: result});
                    conn.release();
                }
            });
        }
    });
});

app.post('/adddrinks', (req, res)=>{
    notice = '';
    let sql = 'UPDATE vp_drinkstock SET stock = ? WHERE id = ?';
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            throw err;
        } else {
            conn.execute(sql, [req.body.stockInput, req.body.selectedDrink[0]], (err, result)=>{
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    console.log("stock input", req.body.stockInput)
                    console.log("id", req.body.selectedDrink[0])
                    console.log(sql)
                    notice = "Laoseis muudetud"
                    res.redirect('adddrinks');
                    conn.release();
                }
            });
        }
    });
});


app.listen(5128);