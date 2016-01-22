// Styles
require("./styles/style.less")

// Polyfills
require("whatwg-fetch")
require('fastclick').attach(document.body)

var React = require("react")
var ReactDOM = require("react-dom")
var Player = require("./player").Player

ReactDOM.render(<Player/>, document.getElementById('viewport'))
