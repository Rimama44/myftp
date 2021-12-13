import { createServer } from "net";

const net = require('net')
const process = require('process')
let testFolder = 'ftp-data-img';
const path = require('path')
const user = require('../user.json')
const fs = require('fs')
var messages;


export function launch(port) {
  const server = createServer((socket) => {
    console.log("new connection.");
    let statut = false
    let userconnected = false
    let id = '-1'
    let defaultpath = process.cwd()
    let defaultfolder = path.basename(process.cwd())
    socket.reply = function (status, message, callback) {
      if (!message) message = messages[status.toString()] || 'No information'
      if (this.writable) {
        this.write(status.toString() + ' ' + message.toString() + '\r\n', callback)
      }
    }

    socket.on("data", (data) => {

      const [command, ...arg] = data.toString().trim().split(" ");
      data = data.toString().slice(command.length + 1)
      if (arg != undefined) {
        data = data.toString().slice(arg.length + 1)
      }
      let datafile = data.toString()
      let filename, pathToFile, pathToDestination
      console.log(command, arg);

      switch (command) {
        case 'USER':
          for (let i = 0; i < user.users.length; i++)
            if (arg == user.users[i].username) {
              id = i
              i = user.users.length
              userconnected = true
              socket.reply(331)
            } else if (user.users[i].username != arg) {
              console.log('Scanning database ...')
            } else {
              i = user.users.length
              socket.reply(430)
              socket.write('Username does not exist, try again')
            }
          if (id == '-1') {
            socket.write('The user is not in the database')
          }
          break;
        case 'PASS':
          if (userconnected == false) {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          } else {
            if (arg == user.users[id].password) {
              statut = true
              socket.reply(230)
              socket.write('Successful identification, you can now use the following command : LIST, SYST, FEAT, PWD, CWD, RETR, STOR')
            } else {
              csocket.reply(430)
              socket.write('Wrong password, try again')
            }
          }
          break;
        case "SYST":
          socket.reply(215);
          break;
        case "FEAT":
          socket.reply(211);
          break;
        case "PWD":
          if (statut == true) {
            socket.write(testFolder);
          } else {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          }
          break;
        case "TYPE":
          socket.reply(200);
          break;
        case 'LIST':
          if (statut == true) {
            fs.readdir(testFolder, (err, files) => {
              if (err) {
                console.log('error')
              } else if (files.length == 0) {
                socket.write('No such file or directory')
              } else {
                console.log('Directory not empty.')
                socket.write(files.join('   '))
              }
            })
          } else {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          }
          break;
        case 'CWD':
          if (statut == true) {
            let newWorkingDir = arg
            console.log(`Starting directory: ${testFolder}`);
            try {
              testFolder = newWorkingDir.toString();
              console.log(`New directory: ${testFolder}`);
            } catch (err) {
              console.error(`chdir: ${err}`);
            }

            socket.write(`Directory changé pour : ${newWorkingDir}`)
            console.log('CWD : ' + newWorkingDir);
          } else {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          }
          break;
        case 'RETR':
          if (statut == true) {
            filename = arg
            pathToFile = path.join(process.cwd().toString() + testFolder, filename)
            pathToDestination = path.join(value, "copy", filename)
            fs.copyFile(pathToFile, pathToDestination, callback);
            socket.write(`file ${filename} copied`)
            console.log(`file copied ${filename}`);
          } else {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          }
          break;
        case 'STOR':
          if (statut == true) {
            fs.writeFile(arg, datafile, (err) => {
              if (err) {
                console.log('error')
              } else {
                socket.write('File transferred')
              }
            })
          } else {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          }
          break;
        case 'HELP':
          console.log(214)
          switch (arg) {
            case 'USER':
              socket.write(`USER <username>: check if the user exist`)
              break;
            case 'PASS':
              socket.write(`PASS <password>: authenticate the user with a password`)
              break;
            case 'LIST':
              socket.write(`LIST: list the current directory of the server`)
              break;
            case 'CWD':
              socket.write(`CWD <directory>: change the current directory of the server`)
              break;
            case 'RETR':
              socket.write(`RETR <filename>: transfer a copy of the file FILE from the server to the client`)
              break;
            case 'STOR':
              socket.write(`STOR <filename>: transfer a copy of the file FILE from the client to the server`)
              break;
            case 'PWD':
              socket.write(`PWD: display the name of the current directory of the server`)
              break;
            case 'QUIT':
              socket.write(`QUIT: close the connection and stop the program`)
              break;
            default:
              socket.reply(214 + "\r\nUSER <username>: check if the user exist PASS <password>: authenticate the user with a password \n" +
                "LIST: list the current directory of the server\n" +
                "CWD <directory>: change the current directory of the server\n" +
                "RETR <filename>: transfer a copy of the file FILE from the server to the client\n" +
                "STOR <filename>: transfer a copy of the file FILE from the client to the server\n" +
                "PWD: display the name of the current directory of the server \n" +
                "QUIT: close the connection and stop the program")
              break;
          }
          break;
        case 'QUIT':
          //action pour déco un client
          if (statut == true) {
            socket.reply(221)
            socket.write(`You're disconnected`)
            socket.end()
            statut == false;
          } else {
            socket.reply(332)
            socket.write('You must first authenticate yourself with the command USER')
          }
          break;
        default:
          console.log("command not supported:", command, arg);
          break;
      }
    });

    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });

  messages = exports.messages = {
    "200": "Command okay.",
    "500": "Syntax error, command unrecognized.", // This may include errors such as command line too long.
    "501": "Syntax error in parameters or arguments.",
    "202": "Command not implemented, superfluous at this site.",
    "502": "Command not implemented.",
    "503": "Bad sequence of commands.",
    "504": "Command not implemented for that parameter.",
    "110": "Restart marker reply.", // In this case, the text is exact and not left to the particular implementation; it must read: MARK yyyy = mmmm Where yyyy is User-process data stream marker, and mmmm server's equivalent marker (note the spaces between markers and "=").
    "211": "System status, or system help reply.",
    "212": "Directory status.",
    "213": "File status.",
    "214": "Help message. On how to use the server or the meaning of a particular non-standard command. This reply is useful only to the human user.",
    "215": "NodeFTP server emulator.", // NAME system type. Where NAME is an official system name from the list in the Assigned Numbers document.
    "120": "Service ready in %s minutes.",
    "220": "Service ready for new user.",
    "221": "Service closing control connection.", // Logged out if appropriate.
    "421": "Service not available, closing control connection.", // This may be a reply to any command if the service knows it must shut down.
    "125": "Data connection already open; transfer starting.",
    "225": "Data connection open; no transfer in progress.",
    "425": "Can't open data connection.",
    "226": "Closing data connection.", // Requested file action successful (for example, file transfer or file abort).
    "426": "Connection closed; transfer aborted.",
    "227": "Entering Passive Mode.", // (h1,h2,h3,h4,p1,p2).
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
    "450": "Requested file action not taken.", // File unavailable (e.g., file busy).
    "550": "Requested action not taken.", // File unavailable (e.g., file not found, no access).
    "451": "Requested action aborted. Local error in processing.",
    "551": "Requested action aborted. Page type unknown.",
    "452": "Requested action not taken.", // Insufficient storage space in system.
    "552": "Requested file action aborted.", // Exceeded storage allocation (for current directory or dataset).
    "553": "Requested action not taken.", // File name not allowed.
  }
}
