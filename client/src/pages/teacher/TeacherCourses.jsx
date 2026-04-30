import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useGetMyCoursesQuery,
  useDeleteCourseMutation,
  useSubmitForApprovalMutation,
} from '../../services/courseApi'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

const STATUS_BADGE = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const TeacherCourses = () => {
  const { data, isLoading } = useGetMyCoursesQuery()
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation()
  const [submitForApproval, { isLoading: submitting }] = useSubmitForApprovalMutation()
  const { showToast } = useToast()

  const [deleteTarget, setDeleteTarget] = useState(null)

  
  const courses = data?.data?.courses || data || []

  const handleDelete = async () => {
    try {
      await deleteCourse(deleteTarget._id).unwrap()
      showToast('Course deleted.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err?.data?.message || 'Delete failed', 'danger')
    }
  }

  const handleSubmit = async (id) => {
    try {
      await submitForApproval(id).unwrap()
      showToast('Course submitted for approval!', 'success')
    } catch (err) {
      showToast(err?.data?.message || 'Submit failed', 'danger')
    }
  }

  if (isLoading) return <Loader />

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>My Courses</h3>
          <p className="text-muted mb-0">Manage and publish your courses.</p>
        </div>
        <Link to="/teacher/courses/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon="bi-journal-plus"
          title="No courses yet"
          description="Create your first course to get started!"
          actionLabel="Create Course"
          actionTo="/teacher/courses/new"
        />
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-center">Students</th>
                    <th className="text-center">Lessons</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div className="fw-semibold" style={{ maxWidth: 220 }}>{course.title}</div>
                      </td>
                      <td><span className="badge bg-secondary">{course.category}</span></td>
                      <td>
                        <span className={`badge bg-${STATUS_BADGE[course.status] || 'secondary'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="text-center">{course.enrollmentCount ?? 0}</td>
                      <td className="text-center">{course.lessonCount ?? 0}</td>
                      <td><small className="text-muted">{formatDate(course.createdAt)}</small></td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Link to={`/teacher/courses/${course._id}/edit`} className="btn btn-sm btn-outline-primary" title="Edit">
                            <i className="bi bi-pencil" />
                          </Link>
                          <Link to={`/teacher/courses/${course._id}/lessons`} className="btn btn-sm btn-outline-secondary" title="Lessons">
                            <i className="bi bi-list-ol" />
                          </Link>
                          <Link to={`/teacher/courses/${course._id}/quizzes`} className="btn btn-sm btn-outline-secondary" title="Quizzes">
                            <i className="bi bi-question-circle" />
                          </Link>
                          <Link to={`/teacher/courses/${course._id}/progress`} className="btn btn-sm btn-outline-info" title="Progress">
                            <i className="bi bi-bar-chart" />
                          </Link>
                          {course.status === 'draft' && (
                            <button
                              className="btn btn-sm btn-outline-warning"
                              title="Submit for Approval"
                              disabled={submitting}
                              onClick={() => handleSubmit(course._id)}
                            >
                              <i className="bi bi-send" />
                            </button>
                          )}
                          {course.status === 'draft' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              onClick={() => setDeleteTarget(course)}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default TeacherCourses
