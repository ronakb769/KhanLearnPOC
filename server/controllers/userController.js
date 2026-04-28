const mongoose = require('mongoose')
const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

// GET /api/v1/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 10 } = req.query

  const filter = {}
  if (role) filter.role = role
  if (isActive !== undefined) filter.isActive = isActive === 'true'
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(+limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ])

  return success(res, {
    users,
    total,
    page: +page,
    pages: Math.ceil(total / limit)
  })
})

// GET /api/v1/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken')
  if (!user) return error(res, 'User not found', 404)

  return success(res, { user })
})

// PUT /api/v1/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password -refreshToken')

  if (!user) return error(res, 'User not found', 404)

  return success(res, { user })
})

// DELETE /api/v1/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password -refreshToken')

  if (!user) return error(res, 'User not found', 404)

  return success(res, { message: 'User deactivated' })
})

// GET /api/v1/users/:id/stats
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id

  const [coursesCreated, coursesEnrolled, quizAttempts] = await Promise.all([
    Course.countDocuments({ teacher: userId }),
    Enrollment.countDocuments({ student: userId }),
    Progress.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$quizAttempts' },
      { $count: 'total' }
    ])
  ])

  return success(res, {
    coursesCreated,
    coursesEnrolled,
    quizAttempts: quizAttempts[0]?.total || 0
  })
})

module.exports = { getUsers, getUserById, updateUserStatus, deleteUser, getUserStats }
