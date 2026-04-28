import { Link } from 'react-router-dom'
import CourseProgressBar from '../course/CourseProgressBar'

const LessonSidebar = ({ lessons = [], currentLessonId, completedLessons = [], courseId, percentComplete = 0 }) => {
  const completedIds = completedLessons.map((l) => (typeof l === 'object' ? l._id?.toString() : l?.toString()))

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
      </div>
    </div>
  )
}
export default LessonSidebar
