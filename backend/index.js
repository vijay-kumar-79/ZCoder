const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const Scholarship = require('./Models/scholarship-model')
const User = require('./Models/user-model')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
app.use(cors({
  origin: '*'
}))

async function main() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zcoder");
    console.log("Connected to DB")
}

main().catch(err => console.log(err))
app.listen(3000, () => {
  console.log('Server Running at http://localhost:3000/')
})

const midwareFunc = (req, res, next) => {
  let jwtoken
  const auth = req.headers['authorization']
  if (auth !== undefined) {
    jwtoken = auth.split(' ')[1]
  }
  if (jwtoken === undefined) {
    res.status(401)
    res.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtoken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        res.status(401)
        res.send('Invalid JWT Token')
      } else {
        req.user_id = payload.user_id
        next()
      }
    })
  }
}

app.post('/register/', async (request, response) => {
  const {username, password, email} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const dbUsername = await User.find({ Username: username })
  const dbEmail = await User.find({ Email: email })
  if (dbUsername.length === 0 && dbEmail.length === 0) {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const newUser = new User({
        Username: username,
        HashedPassword: hashedPassword,
        Email: email
      })
      const dbResponse = await User.create(newUser)
      response.status(200)
      response.send(`User created successfully`)
    }
  } else {
    response.status(400)
    if(dbUsername.length !== 0){
      response.send('Username already exists')
    }else if(dbEmail.length !== 0){
      response.send('Email already exists')
    }
  }
})

app.post('/login/', async (req, res) => {
  const {username, password} = req.body
  const dbuser = await User.find({ Username: username })
  console.log(dbuser);
  if (dbuser.length === 0) {
    res.status(400).send('*Username does not exist')
  } else {
    const checkPw = await bcrypt.compare(password, dbuser[0].HashedPassword)
    if (checkPw) {
      const payload = {
        username: username,
        user_id: dbuser.user_id,
      }
      const jwtoken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      res.send(jwtoken)
    } else {
      res.status(400)
      res.send('*Incorrect Password')
    }
    // res.status(200).send(dbuser[0]);
  }
})

app.get('/', (req, res) => {
    res.send('Welcome to the Scholarship Finder API')
})

app.get('/scholarships/', async (req, res) => {
    try {
        // Fetch scholarships from the database
        const scholarships = await Scholarship.find()
        let links = []
        scholarships.forEach(scholarship => {
            if (scholarship.Links) {
                links.push(JSON.parse(scholarship.Links.replace(/'/g, '"')))
            }
        })
        res.status(200).json(scholarships)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scholarships' })
    }
})