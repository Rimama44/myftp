"use strict";

var _net = require("net");

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var currentCommand = '';
var isAuthenticated = false;

var fs = require('fs');

var net = require('net');

var client = (0, _net.createConnection)({
  port: 4242
}, function () {
  console.log("client connected.");
});

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
client.on("data", function (data) {
  var message = data.toString();
  console.log("Message received:", message);

  var _message$trim$split = message.trim().split(" "),
      _message$trim$split2 = _toArray(_message$trim$split),
      status = _message$trim$split2[0],
      args = _message$trim$split2.slice(1);

  if (status == 230 && currentCommand === "USER") {
    isAuthenticated = true;
  }

  rl.question('>> ', function (answer) {
    var arg = answer.split(' ');

    switch (arg[0]) {
      case 'STOR':
        var _data = fs.readFileSync(arg[1], {
          encoding: 'utf8',
          flag: 'r'
        });

        var myArray = [arg[0], arg[1], _data];
        client.write(myArray.join(' '));
        break;

      default:
        client.write("".concat(answer));
    }
  });
});