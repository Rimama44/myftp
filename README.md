# 📋 Description

Project created in node.js v16.13.1 with :

- net
- readlines
- process
- path
- fs
- babel
- nodemon

The goal was to create an ftp server with a client. The client should be able to send commands to the server.

# 📥 Installation

1) Download or clone the git
2) Unzip the file

# 👨‍💻 Usage

#### To login to the FTP server you can use the usernames and passwords in the user.json file

# ⌨️ Commands

- USER [username] : check if the user exist | # Use the usernames in the .json file
- PASS [password] : authenticate the user with a password | # Use the passwords in the .json file
- LIST : list the current directory of the server
- CWD [directory] : change the current directory of the server | # No folder is provided, it must be created first.
- RETR [filename] : transfer a copy of the file FILE from the server to the client | # Use test.txt
- STOR [filename] : transfer a copy of the file FILE from the client to the server | # Use test.txt
- PWD: display the name of the current directory of the server
- HELP: send helpful information to the client
- QUIT: close the connection and stop the program