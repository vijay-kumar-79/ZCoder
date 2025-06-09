
# ZCoder

A interactive coding community platform to practise and scale up your skills.

## Live Demo
[Website](https://z-coder-tan.vercel.app/) | [Video Demo](https://drive.google.com/file/d/10rNcX1oot6aYd_PbwZib2L2BYr8D3DxZ/view?usp=sharing)

## How to Run locally
### first clone the repo
``` bash
git clone https://github.com/vijay-kumar-79/ZCoder.git
cd ZCoder
```
### run backend
``` bash
cd backend
npm i 
nodemon index.js
```
also create a new file called .env in the backend folder at the same level of index.js. The format for it is
```
GROQ_API_KEY = your_api_key
```
(Create your own key at https://console.groq.com/keys)

### run frontend
then open a new terminal and
```bash
cd frontend
npm i
npm run dev
```
also create a new file called .env in the frontend folder at the same level of src,public. The format for it is
```
REACT_APP_API_URL = https://alfa-leetcode-api.onrender.com
REACT_APP_BACKEND_URL = http://localhost:5000
REACT_APP_JUDGE = https://emkc.org/api/v2/piston/execute
```
Then visit http://localhost:3000
## Features

**User Authentication**  
- Register and login system with hashed passwords using bcrypt and jwt

**Practice Problems**  
- with over 600+ problems to practise and run code and check

**Interactive rooms**  
- Rooms where people can join and interact with each other with realtime messages and common code editor

**Ask AI**  
- Using GroqAI API developed a fully functional chat bot that can help with doubts

**Discussions**  
- Area for a community to upload their solutions helping eachother and voting them

**Profile**
- Profile page to check your progress and also stalk your friends.

**Bookmarks**
- Page to bookmark important questions so that you can visit again.

## Technologies Used

| Tech | Description |
|------|-------------|
| **React** | Frontend UI framework |
| **Node/Express** | Backend API server |
| **Socket.IO** | Real-time communication |
| **MongoDB / Mongoose** | Database for storing users and messages |
| **Bcrypt** | Password hashing |
| **JWT** | Token based Authentication |

###  Contact
If you have any questions or want help improving the app, feel free to reach out to any contributor of this website
