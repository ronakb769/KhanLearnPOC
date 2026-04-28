const { randomUUID } = require('crypto')
const Course = require('../models/Course')
const Quiz = require('../models/Quiz')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

const stripCorrectAnswers = (quizzes) =>
  quizzes.map((q) => ({
    ...q.toObject(),
    questions: q.questions.map((qq) => ({
      ...qq,
      options: qq.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  }))

const getQuizzesByCourse = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ course: req.params.courseId })
  const result = req.user.role === 'student' ? stripCorrectAnswers(quizzes) : quizzes.map((q) => q.toObject())
  return success(res, { quizzes: result })
})

const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
  if (!quiz) return error(res, 'Quiz not found', 404)
  const result =
    req.user.role === 'student'
      ? {
          ...quiz.toObject(),
          questions: quiz.questions.map((q) => ({
            ...q,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
          })),
        }
      : quiz.toObject()
  return success(res, { quiz: result })
})

const createQuiz = asyncHandler(async (req, res) => {
  const { course: courseId } = req.body
  const course = await Course.findById(courseId)
  if (!course) return error(res, 'Course not found', 404)
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  const questions = (req.body.questions || []).map((q) => ({
    ...q,
    id: q.id || randomUUID(),
    options: (q.options || []).map((o) => ({ ...o, id: o.id || randomUUID() })),
  }))

  const quiz = await Quiz.create({ ...req.body, questions })
  return success(res, { quiz }, 'Quiz created', 201)
})

const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course', 'teacher')
  if (!quiz) return error(res, 'Quiz not found', 404)
  if (quiz.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  if (req.body.questions) {
    req.body.questions = req.body.questions.map((q) => ({
      ...q,
      id: q.id || randomUUID(),
      options: (q.options || []).map((o) => ({ ...o, id: o.id || randomUUID() })),
    }))
  }

  const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  return success(res, { quiz: updated })
})

const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course', 'teacher')
  if (!quiz) return error(res, 'Quiz not found', 404)
  if (quiz.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }
  await Quiz.findByIdAndDelete(req.params.id)
  return success(res, {}, 'Quiz deleted')
})

const attemptQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
  if (!quiz) return error(res, 'Quiz not found', 404)

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course, status: 'active' })
  if (!enrollment) return error(res, 'Not enrolled in this course', 403)

  const { answers = [] } = req.body

  let correct = 0
  const results = quiz.questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.id)
    const correctOption = q.options.find((o) => o.isCorrect)
    const isCorrect = userAnswer?.selectedOptionId === correctOption?.id
    if (isCorrect) correct++
    return {
      questionId: q.id,
      correct: isCorrect,
      selectedOptionId: userAnswer?.selectedOptionId || null,
      correctOptionId: correctOption?.id,
      explanation: q.explanation,
      questionText: q.questionText,
    }
  })

  const score = quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0
  const passed = score >= quiz.passingScore

  let progress = await Progress.findOne({ student: req.user._id, course: quiz.course })
  if (!progress) progress = await Progress.create({ student: req.user._id, course: quiz.course })

  progress.quizAttempts.push({
    quiz: quiz._id,
    score,
    passed,
    answers,
    attemptedAt: new Date(),
  })
  await progress.save()

  return success(res, { score, passed, total: quiz.questions.length, correct, results, passingScore: quiz.passingScore })
})

const getQuizResults = asyncHandler(async (req, res) => {
  const { id: quizId, studentId } = req.params
  const progress = await Progress.findOne({ student: studentId })
  if (!progress) return error(res, 'No progress found', 404)
  const attempts = progress.quizAttempts.filter(
    (a) => a.quiz?.toString() === quizId
  )
  return success(res, { attempts })
})

module.exports = { getQuizzesByCourse, getQuizById, createQuiz, updateQuiz, deleteQuiz, attemptQuiz, getQuizResults }
