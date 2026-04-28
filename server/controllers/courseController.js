const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Quiz = require('../models/Quiz')
const Enrollment = require('../models/Enrollment')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

// GET /api/v1/courses
const getCourses = asyncHandler(async (req, res) => {
  const { category, level, search, page = 1, limit = 9, sort = 'newest' } = req.query

  const filter = { status: 'approved' }
  if (category) filter.category = category
  if (level) filter.level = level
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  const sortObj = sort === 'popular' ? {} : { createdAt: -1 }
  const skip = (page - 1) * limit

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('teacher', 'name avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(+limit),
    Course.countDocuments(filter)
  ])

  const coursesWithCount = await Promise.all(
    courses.map(async (c) => {
      const [lessonCount, enrollmentCount] = await Promise.all([
        Lesson.countDocuments({ course: c._id, isPublished: true }),
        Enrollment.countDocuments({ course: c._id })
      ])
      return { ...c.toObject(), lessonCount, enrollmentCount }
    })
  )

  return success(res, {
    courses: coursesWithCount,
    total,
    page: +page,
    pages: Math.ceil(total / limit)
  })
})

// GET /api/v1/courses/:id
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name avatar bio')
  if (!course) return error(res, 'Course not found', 404)

  const [lessonCount, enrollmentCount] = await Promise.all([
    Lesson.countDocuments({ course: course._id, isPublished: true }),
    Enrollment.countDocuments({ course: course._id })
  ])

  return success(res, { course: { ...course.toObject(), lessonCount, enrollmentCount } })
})

// GET /api/v1/courses/:id/full  (requires auth)
const getCourseFullDetail = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name avatar bio')
  if (!course) return error(res, 'Course not found', 404)

  const isOwner = course.teacher._id.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.id,
    status: 'active'
  })

  if (!enrollment && !isOwner && !isAdmin) {
    return error(res, 'Not enrolled in this course', 403)
  }

  const lessons = await Lesson.find({ course: req.params.id, isPublished: true }).sort({ order: 1 })
  let quizzes = await Quiz.find({ course: req.params.id })

  if (req.user.role === 'student') {
    quizzes = quizzes.map((q) => ({
      ...q.toObject(),
      questions: q.questions.map((qq) => ({
        ...qq,
        options: qq.options.map((o) => ({ id: o.id, text: o.text }))
      }))
    }))
  }

  return success(res, { course, lessons, quizzes })
})

// POST /api/v1/courses
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, level, thumbnail, tags } = req.body

  const course = await Course.create({
    title,
    description,
    category,
    level,
    thumbnail,
    tags,
    teacher: req.user._id
  })

  return success(res, { course }, 'Course created', 201)
})

// PUT /api/v1/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return error(res, 'Course not found', 404)

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  return success(res, { course: updated })
})

// DELETE /api/v1/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return error(res, 'Course not found', 404)

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  await Course.findByIdAndDelete(req.params.id)
  await Lesson.deleteMany({ course: req.params.id })
  await Quiz.deleteMany({ course: req.params.id })

  return success(res, {}, 'Course deleted')
})

// PUT /api/v1/courses/:id/submit
const submitForApproval = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return error(res, 'Course not found', 404)

  if (course.teacher.toString() !== req.user._id.toString()) {
    return error(res, 'Not authorized', 403)
  }

  if (!['draft', 'rejected'].includes(course.status)) {
    return error(res, 'Course cannot be submitted', 400)
  }

  course.status = 'pending'
  await course.save()

  return success(res, { course })
})

// PUT /api/v1/courses/:id/approve
const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', rejectionReason: undefined },
    { new: true }
  )

  if (!course) return error(res, 'Course not found', 404)

  return success(res, { course })
})

// PUT /api/v1/courses/:id/reject
const rejectCourse = asyncHandler(async (req, res) => {
  const { reason } = req.body
  if (!reason) return error(res, 'Rejection reason required', 400)

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  )

  if (!course) return error(res, 'Course not found', 404)

  return success(res, { course })
})

// GET /api/v1/courses/my
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 })

  const coursesWithStats = await Promise.all(
    courses.map(async (c) => {
      const [lessonCount, enrollmentCount] = await Promise.all([
        Lesson.countDocuments({ course: c._id }),
        Enrollment.countDocuments({ course: c._id, status: 'active' })
      ])
      return { ...c.toObject(), lessonCount, enrollmentCount }
    })
  )

  return success(res, { courses: coursesWithStats })
})

module.exports = {
  getCourses,
  getCourseById,
  getCourseFullDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  submitForApproval,
  approveCourse,
  rejectCourse,
  getMyCourses
}
