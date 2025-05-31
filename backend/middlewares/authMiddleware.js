
const authMiddleware = (req, res, next) => {
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

module.exports = authMiddleware;