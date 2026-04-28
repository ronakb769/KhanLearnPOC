const jwt = require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return error(res, 'Name, email and password are required', 400)
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return error(res, 'Email already in use', 409)
  }

  const user = await User.create({ name, email, password, role })

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  return success(
    res,
    {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    },
    'Registered',
    201
  )
})

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return error(res, 'Email and password are required', 400)
  }

  const user = await User.findByEmail(email)
  if (!user || !user.isActive) {
    return error(res, 'Invalid credentials', 401)
  }

  const match = await user.comparePassword(password)
  if (!match) {
    return error(res, 'Invalid credentials', 401)
  }

  user.lastLogin = new Date()

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  return success(res, {
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  })
})

// POST /api/v1/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    return error(res, 'No refresh token', 401)
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== token) {
    return error(res, 'Invalid refresh token', 401)
  }

  const accessToken = generateAccessToken(user._id)

  return success(res, { accessToken })
})

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    const user = await User.findById(req.user._id)
    if (user) {
      user.refreshToken = undefined
      await user.save({ validateBeforeSave: false })
    }
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })

  return success(res, {}, 'Logged out')
})

// GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, { user: req.user })
})

// PUT /api/v1/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, avatar },
    { new: true, runValidators: true }
  ).select('-password -refreshToken')

  return success(res, { user })
})

// PUT /api/v1/auth/password
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return error(res, 'Current and new passwords are required', 400)
  }

  const user = await User.findById(req.user._id).select('+password')

  const match = await user.comparePassword(currentPassword)
  if (!match) {
    return error(res, 'Current password is incorrect', 400)
  }

  user.password = newPassword
  await user.save()

  return success(res, {}, 'Password updated')
})

module.exports = { register, login, refresh, logout, getMe, updateProfile, updatePassword }
