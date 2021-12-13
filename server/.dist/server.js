"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launch = launch;

var _net = require("net");

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var net = require('net');

var process = require('process');

var testFolder = './ftp-data-img/';

var path = require('path');

var user = require('../user.json');

var fs = require('fs');

var messages;

function launch(port) {
  var server = (0, _net.createServer)(function (socket) {
    console.log("new connection.");
    var statut = false;
    var id = '-1';
    var defaultpath = process.cwd();
    var defaultfolder = path.basename(process.cwd());

    socket.reply = function (status, message, callback) {
      if (!message) message = messages[status.toString()] || 'No information';

      if (this.writable) {
        this.write(status.toString() + ' ' + message.toString() + '\r\n', callback);
      }
    };

    socket.on("data", function (data) {
      var _data$toString$trim$s = data.toString().trim().split(" "),
          _data$toString$trim$s2 = _toArray(_data$toString$trim$s),
          command = _data$toString$trim$s2[0],
          arg = _data$toString$trim$s2.slice(1);

      data = data.toString().slice(command.length + 1);

      if (arg != undefined) {
        data = data.toString().slice(arg.length + 1);
      }

      var datafile = data.toString();
      console.log(command, arg);

      switch (command) {
        case 'USER':
          for (var i = 0; i < user.users.length; i++) {
            if (arg == user.users[i].username) {
              statut = true;
              id = i;
              i = user.users.length;
              socket.reply(331);
            } else if (user.users[i].username != arg) {
              console.log('Scanning database ...');
            } else {
              i = user.users.length;
              socket.reply(430);
              socket.write('Username does not exist, try again');
            }
          }

          if (id == '-1') {
            socket.write('The user is not in the database');
          }

          break;

        case 'PASS':
          if (statut == false) {
            socket.reply(332);
            socket.write('You must first authenticate yourself with the command USER');
          } else {
            if (arg == user.users[id].password) {
              statut = true;
              socket.reply(230);
              socket.write('Successful identification, you can now use the following command : LIST, PWD, CWD, RETR, STOR');
            } else {
              csocket.reply(430);
              socket.write('Wrong password, try again');
            }
          }

          break;

        case "SYST":
          socket.write("215 \r\n");
          break;

        case "FEAT":
          socket.write("211 \r\n");
          break;

        case "PWD":
          socket.write("257 /users/marie\r\n");
          break;

        case "TYPE":
          socket.write("200 \r\n");
          break;

        case 'LIST':
          if (statut == true) {
            fs.readdir(process.cwd(), function (err, files) {
              if (err) {
                console.log('error');
              } else if (files.length == 0) {
                socket.write('No such file or directory');
              } else {
                console.log('Directory not empty.');
                socket.write(files.join('   '));
              }
            });
          } else {
            socket.reply(332);
            socket.write('You must first authenticate yourself with the command USER');
          }

          break;

        case 'CWD':
          if (statut == true) {
            var newWorkingDir = arg;
            console.log("Starting directory: ".concat(process.cwd()));

            try {
              process.chdir(newWorkingDir);
              console.log("New directory: ".concat(process.cwd()));
            } catch (err) {
              console.error("chdir: ".concat(err));
            }

            socket.write("Directory chang\xE9 pour : ".concat(newWorkingDir));
            console.log('CWD : ' + newWorkingDir);
          } else {
            socket.write("Vous \xEAtes pas connect\xE9");
          }

          break;

        /*if (statut == true) {
          process.chdir(arg)
          newpath = process.cwd().split(path.sep)
          pathid = newpath.indexOf(defaultfolder).toString()
          if (pathid == '-1') {
            socket.write('You are unable to access')
            process.chdir(defaultpath)
          } else if (pathid != '-1') {
            socket.write(' ')
          }
        } else {
          console.log('332 : Need account for login.')
          socket.write('You must first authenticate yourself with the command USER')
        }
        break;*/

        case 'STOR':
          if (statut == true) {
            fs.writeFile(arg, datafile, function (err) {
              if (err) {
                console.log('error');
              } else {
                socket.write('File transferred');
              }
            });
          } else {
            socket.reply(332);
            socket.write('You must first authenticate yourself with the command USER');
          }

          break;

        case 'HELP':
          console.log(214);

          switch (arg) {
            case 'USER':
              socket.write("USER <username>: check if the user exist");
              break;

            case 'PASS':
              socket.write("PASS <password>: authenticate the user with a password");
              break;

            case 'LIST':
              socket.write("LIST: list the current directory of the server");
              break;

            case 'CWD':
              socket.write("CWD <directory>: change the current directory of the server");
              break;

            case 'RETR':
              socket.write("RETR <filename>: transfer a copy of the file FILE from the server to the client");
              break;

            case 'STOR':
              socket.write("STOR <filename>: transfer a copy of the file FILE from the client to the server");
              break;

            case 'PWD':
              socket.write("PWD: display the name of the current directory of the server");
              break;

            case 'QUIT':
              socket.write("QUIT: close the connection and stop the program");
              break;

            default:
              socket.write("Syntaxe: HELP <nom commande>");
              break;
          }

          break;

        case 'QUIT':
          //action pour déco un client
          if (statut == true) {
            socket.reply(221);
            socket.end();
          } else {
            socket.write("You're not connected");
          }

          break;

        default:
          console.log("command not supported:", command, args);
      }
    });
    socket.write("220 Hello World \r\n");
  });
  server.listen(port, function () {
    console.log("server started at localhost:".concat(port));
  });
  messages = exports.messages = {
    "200": "Command okay.",
    "500": "Syntax error, command unrecognized.",
    // This may include errors such as command line too long.
    "501": "Syntax error in parameters or arguments.",
    "202": "Command not implemented, superfluous at this site.",
    "502": "Command not implemented.",
    "503": "Bad sequence of commands.",
    "504": "Command not implemented for that parameter.",
    "110": "Restart marker reply.",
    // In this case, the text is exact and not left to the particular implementation; it must read: MARK yyyy = mmmm Where yyyy is User-process data stream marker, and mmmm server's equivalent marker (note the spaces between markers and "=").
    "211": "System status, or system help reply.",
    "212": "Directory status.",
    "213": "File status.",
    "214": "Help message. On how to use the server or the meaning of a particular non-standard command. This reply is useful only to the human user.",
    "215": "NodeFTP server emulator.",
    // NAME system type. Where NAME is an official system name from the list in the Assigned Numbers document.
    "120": "Service ready in %s minutes.",
    "220": "Service ready for new user.",
    "221": "Service closing control connection.",
    // Logged out if appropriate.
    "421": "Service not available, closing control connection.",
    // This may be a reply to any command if the service knows it must shut down.
    "125": "Data connection already open; transfer starting.",
    "225": "Data connection open; no transfer in progress.",
    "425": "Can't open data connection.",
    "226": "Closing data connection.",
    // Requested file action successful (for example, file transfer or file abort).
    "426": "Connection closed; transfer aborted.",
    "227": "Entering Passive Mode.",
    // (h1,h2,h3,h4,p1,p2).
    "230": "User logged in, proceed.",
    "430": "Invalid username or password.",
    "530": "Not logged in.",
    "331": "User name okay, need password.",
    "332": "Need account for login.",
    "532": "Need account for storing files.",
    "150": "File status okay; about to open data connection.",
    "250": "Requested file action okay, completed.",
    "257": "\"%s\" created.",
    "350": "Requested file action pending further information.",
    "450": "Requested file action not taken.",
    // File unavailable (e.g., file busy).
    "550": "Requested action not taken.",
    // File unavailable (e.g., file not found, no access).
    "451": "Requested action aborted. Local error in processing.",
    "551": "Requested action aborted. Page type unknown.",
    "452": "Requested action not taken.",
    // Insufficient storage space in system.
    "552": "Requested file action aborted.",
    // Exceeded storage allocation (for current directory or dataset).
    "553": "Requested action not taken." // File name not allowed.

  };
}