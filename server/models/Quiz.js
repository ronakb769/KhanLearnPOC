const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    },
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    description: {
      type: String
    },
    questions: [
      {
        _id: false,
        id: { type: String },
        questionText: { type: String, required: true },
        options: [
          {
            _id: false,
            id: { type: String },
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false }
          }
        ],
        explanation: { type: String }
      }
    ],
    passingScore: {
      type: Number,
      default: 70
    },
    timeLimit: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

const Quiz = mongoose.model('Quiz', quizSchema)
module.exports = Quiz
