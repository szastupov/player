var express = require('express');
var request = require('request');
var morgan = require('morgan');

var app = express();

app.set('port', process.env.PORT || 5000);
app.set('bot', process.env.BOT_URL || "http://localhost:8080");
app.use(express.static(__dirname + '/dist'));
app.use(morgan('combined'));

app.get("/tracks", (req, res) => {
  request.get({
    url: app.get('bot') + '/tracks',
    qs: req.query
  }).pipe(res);
})

app.get("/files/:file_id", (req, res) => {
  request.get(app.get('bot') + '/files/' + req.params.file_id)
         .pipe(res);
})

app.listen(app.get('port'));
console.log('Server is listening on port', app.get('port'));
