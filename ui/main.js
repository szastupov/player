require("./style.less");
require("whatwg-fetch");
var React = require("react");
var ReactDOM = require("react-dom");
var Player = require("./player").Player;

ReactDOM.render(<Player/>, document.getElementById('viewport'))
