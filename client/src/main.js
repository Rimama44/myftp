import { createConnection } from "net";

let currentCommand = '';
let isAuthenticated = false;

const fs = require('fs')
const net = require('net')
const client = createConnection({ port: 4242 }, () => {
  console.log("client connected.");
});
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

client.on("data", (data) => {
  const message = data.toString();
  console.log("Message received:", message);

  const [status, ...args] = message.trim().split(" ");
  if (status == 230 && currentCommand === "USER") {
    isAuthenticated = true;
  }


  rl.question('>> ', (answer) => {
    let arg = answer.split(' ')
    switch (arg[0]) {

      case 'STOR':
        let data = fs.readFileSync(arg[1], { encoding: 'utf8', flag: 'r' })
        let myArray = [arg[0], arg[1], data]
        client.write(myArray.join(' '))
        break;

      default:
        client.write(`${answer}`)
    }
  })
});