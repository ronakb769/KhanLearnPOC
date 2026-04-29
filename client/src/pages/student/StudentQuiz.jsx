import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetQuizByIdQuery, useAttemptQuizMutation } from '../../services/quizApi'
import QuizQuestion from '../../components/quiz/QuizQuestion'
import QuizResults from '../../components/quiz/QuizResults'
import Loader from '../../components/common/Loader'
import { useToast } from '../../hooks/useToast'

const StudentQuiz = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: quizData, isLoading } = useGetQuizByIdQuery(quizId)
  const [attemptQuiz, { isLoading: submitting }] = useAttemptQuizMutation()

  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const quiz = quizData?.data?.quiz
  const questions = quiz?.questions || []

  const handleSelect = (questionId, selectedOptionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOptionId }))
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)

  const handleSubmit = async () => {
    if (!allAnswered) {
      showToast('Please answer all questions before submitting.', 'warning')
      return
    }
    const formatted = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id],
    }))
    try {
      const res = await attemptQuiz({ id: quizId, answers: formatted }).unwrap()
      setResult(res?.data || res)
    } catch (err) {
      showToast(err?.data?.message || 'Failed to submit quiz', 'danger')
    }
  }

  if (isLoading) return <Loader />
  if (!quiz) return <div className="alert alert-danger">Quiz not found.</div>

  if (result) {
    return (
      <div className="py-4" style={{ maxWidth: 720, margin: '0 auto' }}>
        <QuizResults
          score={result.score}
          passed={result.passed}
          total={result.total}
          correct={result.correct}
          results={result.results}
          questions={questions}
          passingScore={result.passingScore ?? quiz.passingScore}
          onRetake={() => { setResult(null); setAnswers({}) }}
          onBack={() => navigate(-1)}
        />
      </div>
    )
  }

  return (
    <div className="py-4" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link text-decoration-none p-0 me-3" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left fs-5" />
        </button>
        <div>
          <h4 className="fw-bold mb-0">{quiz.title}</h4>
          <small className="text-muted">{questions.length} question{questions.length !== 1 ? 's' : ''}</small>
        </div>
      </div>

      {quiz.description && (
        <div className="alert alert-info mb-4">{quiz.description}</div>
      )}

      <div className="d-flex flex-column gap-4">
        {questions.map((question, i) => {
          const qKey = question.id || question._id || i
          return (
            <QuizQuestion
              key={qKey}
              question={question}
              questionNumber={i + 1}
              totalQuestions={questions.length}
              selectedOptionId={answers[qKey]}
              onSelect={(optionId) => handleSelect(qKey, optionId)}
            />
          )
        })}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
        <small className="text-muted">{Object.keys(answers).length} / {questions.length} answered</small>
        <button
          className="btn btn-primary px-4"
          onClick={handleSubmit}
          disabled={submitting || !allAnswered}
        >
          {submitting ? (
            <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
          ) : (
            'Submit Quiz'
          )}
        </button>
      </div>
    </div>
  )
}

export default StudentQuiz
