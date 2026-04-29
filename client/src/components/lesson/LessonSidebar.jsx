import { Link, useLocation } from 'react-router-dom'
import CourseProgressBar from '../course/CourseProgressBar'
import { useGetQuizzesByCourseQuery } from '../../services/quizApi'

const LessonSidebar = ({ lessons = [], currentLessonId, completedLessons = [], courseId, percentComplete = 0 }) => {
  const completedIds = completedLessons.map((l) => (typeof l === 'object' ? l._id?.toString() : l?.toString()))
  const { data: quizzesData } = useGetQuizzesByCourseQuery(courseId, { skip: !courseId })
  const quizzes = quizzesData?.data?.quizzes || quizzesData?.data || quizzesData || []
  const location = useLocation()

  return (
    <div className="lesson-sidebar bg-white border-end" style={{ width: '100%' }}>
      <div className="p-3 border-bottom">
        <p className="small fw-semibold text-muted mb-2">Course Progress</p>
        <CourseProgressBar percentage={percentComplete} />
      </div>
      <div className="py-2">
        {lessons.map((lesson, idx) => {
          const isCompleted = completedIds.includes(lesson._id?.toString())
          const isCurrent = lesson._id?.toString() === currentLessonId?.toString()
          return (
            <Link
              key={lesson._id}
              to={`/student/courses/${courseId}/lessons/${lesson._id}`}
              className={`d-flex align-items-start gap-2 px-3 py-2 text-decoration-none ${isCurrent ? 'bg-primary bg-opacity-10 border-start border-3 border-primary' : 'border-start border-3 border-transparent'}`}
              style={{ color: 'inherit' }}
            >
              <span className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1 ${isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                style={{ width: 24, height: 24, fontSize: '0.75rem', fontWeight: 700 }}>
                {isCompleted ? <i className="bi bi-check" style={{ fontSize: '0.7rem' }} /> : idx + 1}
              </span>
              <div>
                <p className={`mb-0 small ${isCurrent ? 'fw-semibold text-primary' : ''}`} style={{ lineHeight: 1.3 }}>{lesson.title}</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.72rem' }}>{lesson.duration} min</p>
              </div>
            </Link>
          )
        })}

        {quizzes.length > 0 && (
          <div className="mt-3 border-top pt-2">
            <p className="small fw-semibold text-muted px-3 mb-2">Quizzes</p>
            {quizzes.map((quiz, idx) => {
              const isCurrentQuiz = location.pathname.includes(`/quiz/${quiz._id}`);
              return (
                <Link
                  key={quiz._id}
                  to={`/student/courses/${courseId}/quiz/${quiz._id}`}
                  className={`d-flex align-items-center gap-2 px-3 py-2 text-decoration-none ${isCurrentQuiz ? 'bg-warning bg-opacity-10 border-start border-3 border-warning' : 'border-start border-3 border-transparent'}`}
                  style={{ color: 'inherit' }}
                >
                  <span className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${isCurrentQuiz ? 'bg-warning text-white' : 'bg-light text-muted'}`}
                    style={{ width: 24, height: 24, fontSize: '0.75rem', fontWeight: 700 }}>
                    <i className="bi bi-patch-question-fill" style={{ fontSize: '1rem' }} />
                  </span>
                  <div>
                    <p className={`mb-0 small ${isCurrentQuiz ? 'fw-semibold text-warning' : ''}`} style={{ lineHeight: 1.3 }}>{quiz.title}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default LessonSidebar
