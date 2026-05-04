import { Link } from 'react-router-dom'
import { getCategoryBadgeClass, formatDuration } from '../../utils/formatters'

const CourseCard = ({ course, isEnrolled, onEnroll }) => {
 
  
  const thumb = course.thumbnail || `https://picsum.photos/seed/${course._id}/800/450`
  return (
    <div className="card course-card border-0 shadow-sm h-100">
      <div className="position-relative">
        <img src={thumb} className="card-img-top" alt={course.title} style={{ height: 180, objectFit: 'cover' }} />
        <span className={`badge position-absolute top-0 end-0 m-2 ${getCategoryBadgeClass(course.category)}`} style={{ fontSize: '0.7rem' }}>
          {course.category}
        </span>
      </div>
      <div className="card-body d-flex flex-column">
        <h6 className="fw-bold text-clamp-2 mb-2" style={{ lineHeight: 1.4 }}>{course.title}</h6>
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style={{ width: 24, height: 24, fontSize: '0.7rem', flexShrink: 0 }}>
            {course.teacher?.name?.[0]?.toUpperCase() || 'T'}
          </div>
          <small className="text-muted">{course.teacher?.name || 'Instructor'}</small>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-auto">
          {course.level && <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>{course.level}</span>}
          {course.lessonCount != null && (
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-book me-1" />{course.lessonCount} lessons
            </span>
          )}
          {course.totalDuration > 0 && (
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-clock me-1" />{formatDuration(course.totalDuration)}
            </span>
          )}
        </div>
      </div>
      <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
        <div className="small text-muted text-truncate mb-2 border-top pt-2" style={{ fontSize: '0.7rem' }}>
          {course.title}
        </div>
        {isEnrolled ? (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              <i className="bi bi-check-circle me-1" />Enrolled
            </span>
            <Link to="/student/dashboard" className="btn btn-sm btn-outline-primary ms-auto">Continue</Link>
          </div>
        ) : (
          <button className="btn btn-sm btn-primary w-100" onClick={() => onEnroll && onEnroll(course._id)}>
            Enroll Now
          </button>
        )}
      </div>
    </div>
  )
}
export default CourseCard
