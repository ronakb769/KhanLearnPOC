const jwt = require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findById(decoded.id).select('-password -refreshToken')

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' })
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' })
  }

  req.user = user
  next()
})

module.exports = { verifyAccessToken }
