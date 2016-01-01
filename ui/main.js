require("./style.less");
require("whatwg-fetch");
var FastClick = require('fastclick');
var React = require("react");
var ReactDOM = require("react-dom");
var Player = require("./player").Player;

FastClick.attach(document.body);

ReactDOM.render(<Player/>, document.getElementById('viewport'))
