const express = require('express');
const app = express(); //lõime rakenduse (enamvähem nagu create server nodeis)

app.set('view engine', 'ejs'); //tuleb määrata ära mis mootoriga express app tööle hakkab

app.get('/', (req, res)=>{
    //res.send('see töötab');
    //res.download('index.js')
    res.render('index');
});

app.get('/test', (req, res)=>{
    res.send('test toimib');
    //res.download('index.js')
});

app.listen(5128);