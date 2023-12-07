const express = require('express');
//loome oma rakenduse sees toimiva miniäpi
const router = express.Router(); // Suur algustäht R on oluline
const pool = require('../src/databasepool').pool;
const timeInfo = require('../src/datetime_et');


//kuna siin on miniäpp router, siis kõik marsruudid on temaga, mitte appiga seotus
//kuna küik siinsed marsruudid algavad */news", siis j'tame selle 'ra

router.get('/', (req, res)=>{
    res.render('news');
});

router.get('/add', (req, res)=>{
    res.render('addnews');
});

router.post('/add', (req, res)=>{
    console.log("news add post töötab alguses");
    let notice = '';
    let sql = 'INSERT INTO vpnews (title, content, expire, user_id) VALUES (?, ?, ?, 1)';
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        } else {
            conn.query(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
                if (err) {
                    res.render('addnews');
                    console.log(result)
                    throw err;
                } else {
                    notice = 'Uudise salvestamine õnnestus!';
                    res.render('addnews', {notice: notice});
                    conn.release();
                }
            });
        }
    });    
});


router.get('/read', (req, res)=>{
    const dateENGNow = timeInfo.dateENGformatted();
    let sql = 'SELECT * FROM vpnews WHERE expire > ' + dateENGNow + ' AND DELETED IS NULL ORDER BY id DESC';
    let sqlResult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        } else {
            conn.query(sql, (err, result)=>{
                if (err) {
                    res.render('readnews', {readnews: sqlResult, nowENGD: dateENGNow});
                    throw err;
                } else {
                    //console.log("news read töötab");
                    //console.log(result);
                    res.render('readnews', {readnews: result, nowENGD: dateENGNow});
                    conn.release();
                }
            });
        }
    });    
});


router.get('/read/:id', (req, res) => {
    let sql = 'SELECT * FROM vpnews WHERE id = ? AND DELETED IS NULL ORDER BY id DESC';
    let sqlResult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        } else {
            conn.query(sql, [req.params.id], (err, result) => {
                if (err) {
                    res.render('singlenews', {news: sqlResult})
                    throw err;
                } else {
                    //console.log(result[0]);
                    //console.log(newsID)
                    res.render('singlenews', {news: result[0]});
                    conn.release();
                }
            });
        }
    });    
});

module.exports = router;