const express = require('express');
const fs = require("fs");
const app = express(); //lõime rakenduse (enamvähem nagu create server nodeis)
//kui kõik db asjad poolis, siis pole seda enam vaja
const mysql = require('mysql2');
const timeInfo = require('./src/datetime_et');
const bodyparser = require('body-parser');
//kui kõik db asjad poolis, siis pole seda enam vaja
const dbInfo = require('../../vp23config');
const pool = require('./src/databasepool').pool;
 //package fotode laadimiseks
const multer = require('multer');
//seadistame vahevara (middleware), mis määrab üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
const sharp = require('sharp');
const async = require('async');
//paroolide krüpteerimiseks
const bcrypt = require('bcrypt');
//sessiooni jaoks
const session = require('express-session');

app.use(session({secret: 'minuAbsoluutseltSalajaneVõti', saveUninitialized: true, resave: true})); //1) võti 2) aegumise aeg (prg ei pannud) 3)sessioon hoiustatakse ilma huvitavate andmeteta
let mySession;

app.set('view engine', 'ejs'); //tuleb määrata ära mis mootoriga express app tööle hakkab, visualiseerimise mootor
app.use(express.static('public')); //express.jsi vahevara, static(kataloogi staatiliselt pakkumine) - võtke kasutusele kataloog mida serveerid vabalt ehk võimaldab ligipääseda vabalt kui tead aadressi
//järgnev: kui ainult tekst, siis "false", siis "false", kui ka muud nagu nt pilti, siis "true"
app.use(bodyparser.urlencoded({extended: true})); //võrab päringu/requesti, sinna on kodeeritud sisse andmed, encodediga kodeerib lahti, extended false tähendab et kõige lihtsamad andmed ja pole nt lisatud faile,pilte vms, aint tekstiinfo, isegi numbrid(kuupäev) läheb sinna sisse

//loon andmebaasiühenduse
//kui kõik db asjad poolis, siis pole seda enam vaja
const connection = mysql.createConnection({
    host: dbInfo.configData.host, 
    user: dbInfo.configData.user, 
    password: dbInfo.configData.password,
    database: dbInfo.configData.database
});

//marsruudid (routes)

const newsRouter = require('./routes/news');
app.use('/news', newsRouter);

app.get('/', (req, res)=>{
    //res.send('see töötab');
    //res.download('index.js')
    notice = 'Sisesta oma kasutajakonto andmed';
    res.render('index', {notice: notice});
});

app.post('/', (req, res)=>{
    let notice = "Sisesta oma kasutajakonto andmed!";
    if (!req.body.emailInput || !req.body.passwordInput) {
        console.log('Paha');
        res.render('index', {notice: notice});
    } else {
        console.log('Hea');
        let sql = 'SELECT id, password FROM vpusers WHERE email = ?';
        pool.getConnection((err, conn)=>{
            if(err){
                throw err;
                //connection.release();
            } else {
                connection.execute(sql, [req.body.emailInput], (err, result)=>{
                    if (err) {
                        notice = "Tehnilise vea tõttu ei saa sisse logida.";
                        console.log(notice);
                        res.render('index', {notice: notice});
                        //conn.release();
                    } else {
                        if (result[0] != null){
                            console.log(result[0].password); 
                            bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{ //argumendid: 1) parool, mis on lahtine tekst 2) räsi 3) callback
                                if (err) {
                                    throw err;
                                } else {
                                    if(compareresult){ //if true lause
                                        //console.log('Sisse');
                                        mySession = req.session;
                                        mySession.userName = req.body.emailInput;
                                        mySession.userId = result[0].id;
                                        notice = mySession.userName + ' on sisse loginud.';
                                        res.render('index', {notice: notice});
                                    } else {
                                        notice = 'Kasutajanimi või parool oli vigane'
                                        console.log('Ei saa sisse');
                                        res.render('index', {notice: notice});
            
                                    }
                                }
                            });
                        } else { 
                            notice = 'Kasutajatunnus või parool oli vigane';
                            console.log(notice);
                            res.render('index', {notice: notice});
                            //conn.release();
                        }
                    }
                });
                //res.render('index', {notice: notice});
            }
        });   
    }
});


app.get('/logout', (req, res)=>{
    req.session.destroy(); //hävitab sessiooni
    mySession = null;
    console.log('Logi välja');
    res.redirect('/');
});

app.get('/signup', (req, res)=>{
	res.render('signup');
});

app.post('/signup', (req, res)=>{
    let notice = "Ootan andmeid!";
	console.log(req.body);
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.genderInput || !req.body.birthInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
		console.log('Andmeid on puudu või pole nad korrektsed!');
        notice = "Andmeid on puudu või pole nad korrektsed!";
        res.render('signup', {notice: notice});
	} else {
		console.log('Ok!');
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(req.body.passwordInput, salt, (err, pwdhash)=>{
                let sql = 'INSERT INTO vpusers (firstname, lastname, birthdate, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)';
                connection.execute(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthInput, req.body.genderInput, req.body.emailInput, pwdhash], (err,result)=>{
                    if (err) {
                        console.log(err);
                        notice = "Tehnilistel põhjustel kasutajat ei loodud.";
                        res.render('signup', {notice: notice});
                    } else {
                        console.log(result)
                        notice = "Kasutaja " + req.body.emailInput + " edukalt loodud!";
                        res.render('signup', {notice: notice});
                    }
                });
            });
        });
	}
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
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
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
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
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
        }
    });    
});

app.get('/eestifilm/addfilmrelation', (req, res) => {
    //kasutades asynv moodulit paneme mitu tegevust paralleelselt tööle
    //kõigepealt loome tegevuste loendi
    const myQueries = [
        function conn_person(callback){
            connection.execute('SELECT id,first_name,last_name from person', (err, result)=> {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, result);
                }
            })
        }, // KOMA ON OLULINE
        function conn_movie (callback) {
            connection.execute('SELECT id,title from movie', (err, result)=> {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, result);
                }
            })
        }, //veel , ja järgmine function jne
        function conn_position (callback) {
            connection.execute('SELECT id, position_name FROM position', (err, result) => {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, result);
                }
            })
        }
    ];
    //paneme kõik need paralleelselt tööle
    async.parallel(myQueries, (err, results) =>{
        if (err){
            throw err;
        } else {
            //siin kõik asjad mis on vaja teha
            console.log(results)
            res.render('addfilmrelation', {data: results});
        }
    });
});

app.get('/eestifilm/singlefilm', (req, res) => {
    //console.log("app geti algusesse jõuab");
    let sql = 'SELECT COUNT(id) AS max FROM movie';
    let sqlResult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.query(sql, (err, result) => {
                if (err) {
                    res.render('singlefilm');
                    throw err;
                } else {
                    //console.log("app.get countib");
                    res.render('singlefilm', {filmcount: result[0]["max"]});
                    //connection.release();
                }
            });
        }
    });    
});


app.post('/eestifilm/singlefilm', (req, res)=>{
    //console.log("app posti algusesse jõuab")
    let notice = '';
    //let = 'SELECT COUNT(id) FROM movie';
    let sql = 'SELECT * FROM movie WHERE id=?'; //id on inputist??
    let sqlResult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.query(sql, [req.body.filmIdInput], (err, result) =>{
                if (err) {
                    console.log("app.post error")
                    notice = "Viga. Ei leia filmi.";
                    res.render('singlefilmdisplay', {filmdata: sqlResult, notice: notice});
                    throw err;
                } else {
                    //console.log("app post peaks toimima")
                    notice = "Otsing tehtud"
                    res.render('singlefilmdisplay', {filmdata: result, notice: notice});
                    //connection.release();
                }
            });
        }
    });    
});


/* app.get('/news', (req, res)=>{
    res.render('news');
});

app.get('/news/add', (req, res)=>{
    res.render('addnews');
});

app.post('/news/add', (req, res)=>{
    console.log("news add post töötab alguses");
    let notice = '';
    let sql = 'INSERT INTO vpnews (title, content, expire, user_id) VALUES (?, ?, ?, 1)';
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.query(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
                if (err) {
                    res.render('addnews');
                    console.log(result)
                    throw err;
                } else {
                    notice = 'Uudise salvestamine õnnestus!';
                    res.render('addnews', {notice: notice});
                    connection.release();
                }
            });
        }
    });    
});


app.get('/news/read', (req, res)=>{
    const dateENGNow = timeInfo.dateENGformatted();
    let sql = 'SELECT * FROM vpnews WHERE expire > ' + dateENGNow + ' AND DELETED IS NULL ORDER BY id DESC';
    let sqlResult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.query(sql, (err, result)=>{
                if (err) {
                    res.render('readnews', {readnews: sqlResult, nowENGD: dateENGNow});
                    throw err;
                } else {
                    //console.log("news read töötab");
                    //console.log(result);
                    res.render('readnews', {readnews: result, nowENGD: dateENGNow});
                }
            });
        }
    });    
});


app.get('/news/read/:id', (req, res) => {
    let sql = 'SELECT * FROM vpnews WHERE id = ? AND DELETED IS NULL ORDER BY id DESC';
    let sqlResult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.query(sql, [req.params.id], (err, result) => {
                if (err) {
                    res.render('singlenews', {news: sqlResult})
                    throw err;
                } else {
                    //console.log(result[0]);
                    //console.log(newsID)
                    res.render('singlenews', {news: result[0]});
                }
            });
        }
    });    
}); */

//app.get('/news/read/:id/:lang', (req, res)=>{
    //res.render('readnews')
    //console.log(req.params); //jj
    //console.log(req.query); //http://greeny.cs.tlu.ee:5128/news/read/100/est?color=red&imp=high
    //res.send('Tahame uudist, mille id on: ' + req.params.id);
//});

app.get('/photoupload', checkLogin, (req, res) => { //checkLogin on vahevara e tarkvara mis läheb tööle requesti tulekul enne kui ülejäänud osa(app.get marsruut) jõuab tööle minna
    console.log('Sessiooni userId: ' + req.session.userId);
    res.render('photoupload');
});

app.post('/photoupload', upload.single('photoInput'), (req, res)=>{ //multeri upload, single ehk üks pilt, photoinput ejs failist
    let notice = '';
    console.log(req.file);
    console.log(req.body); //ilma pildi infota
    //image/jpeg image/png image/gif
    const fileName = 'vp_' + Date.now() + '.jpg';
    //fs.rename(req.file.path, './public/gallery/orig/' + req.file.originalname, (err, result)=>{
        //console.log('faili laadimise viga: ' + err)
    fs.rename(req.file.path, './public/gallery/orig/' + fileName, (err)=>{
        console.log('faili laadimise viga: ' + err)
    });
    //loome kaks väiksema mõõduga pildi varianti
    sharp('./public/gallery/orig/' + fileName).resize(800,600).jpeg({quality : 90}).toFile('./public/gallery/normal/' + fileName);
    sharp('./public/gallery/orig/' + fileName).resize(100,100).jpeg({quality : 90}).toFile('./public/gallery/thumbs/' + fileName)

    //foto andmed andmetabelisse
    let sql = 'INSERT INTO vpgallery (filename, originalname, alttext, privacy, user_id) VALUES (?, ?, ?, ?, ?)';
    //const user_id = 1;
    //andmebaasi osa algab
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.execute(sql, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, req.session.userId], (err, result)=>{
                if(err) {
                    throw err;
                    notice = 'Foto andmete salvestamine ebaõnnestus!';
                    res.render('photoupload', {notice: notice});
                } else {
                    notice = 'Foto ' + req.file.originalname + ' laeti edukalt üles!';
                    res.render('photoupload', {notice: notice});
                    //conn.release();
                }
            }); //andmebaasi osa lõppeb
        }
    });
});

app.get('/photogallery', (req, res)=>{
    //andmebaasist tuleb lugeda piltide id, filename ja alttext
    let sql = 'SELECT id,filename,alttext,privacy FROM vpgallery WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
    let privacy = 3;
    if(req.session.userId){
        privacy = 2;
    }
    let sqlResult = [];

    //andmebaasi ühendus pool'i kaudu
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            connection.release();
        } else {
            connection.execute(sql, [privacy], (err, result)=>{
                if (err){
                    console.log("photogalerii error");
                    res.render('photogallery', {photos: sqlResult});
                } else {
                    console.log("photogalerii else blokk");
                    console.log(result);
                    res.render('photogallery', {photos: result})
                    //connection.release();
                }
            });
        } //pool.getConn callback else lõppeb
    }); //pool.getConn lõppeb
});

function checkLogin(req, res, next) {
    console.log('Kontrollime sisselogimist');
    if (mySession != null) {
        if (mySession.userName) {
            console.log('Täitsa sees on');
            next(); //tähendab, et vahevara annab ülesande tagasi
        } else {
            console.log('Ei ole üldse sees');
            res.redirect('/');
        } 
    } else {
        res.redirect('/');
    }

}

app.listen(5128);