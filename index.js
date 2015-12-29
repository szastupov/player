var express = require('express');
var request = require('request');

const BOT_URL = "http://localhost:8080"

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static(__dirname + '/dist'));

app.get("/tracks", (req, res) => {
  request.get({
    url: BOT_URL + '/tracks',
    qs: req.query
  }).pipe(res);
})

app.get("/files/:file_id", (req, res) => {
  request.get(BOT_URL + '/files/' + req.params.file_id)
         .pipe(res);
})

app.listen(app.get('port'));
console.log('Server is listening on port', app.get('port'));
