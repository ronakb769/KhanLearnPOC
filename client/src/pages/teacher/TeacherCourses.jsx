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
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1d3557' }}>My Courses</h2>
          <p className="text-muted mb-0">Manage, edit, and track your educational content.</p>
        </div>
        <Link to="/teacher/courses/new" className="btn btn-primary px-4 py-2 shadow-sm rounded-3">
          <i className="bi bi-plus-lg me-2" />Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon="bi-journal-plus"
          title="No courses found"
          description="You haven't created any courses yet. Start sharing your knowledge today!"
          actionLabel="Create My First Course"
          actionTo="/teacher/courses/new"
        />
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3 border-0 text-uppercase small fw-bold text-muted">Course Details</th>
                    <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Category</th>
                    <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Status</th>
                    <th className="py-3 border-0 text-uppercase small fw-bold text-muted text-center">Stats</th>
                    <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Created</th>
                    <th className="pe-4 py-3 border-0 text-uppercase small fw-bold text-muted text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3 rounded-3 overflow-hidden border" style={{ width: 50, height: 35 }}>
                            <img src={course.thumbnail || 'https://via.placeholder.com/50x35'} alt="" className="w-100 h-100 object-fit-cover" />
                          </div>
                          <div className="fw-bold text-dark" style={{ maxWidth: 250 }}>{course.title}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-light text-dark border fw-medium px-2 py-1 rounded-2">{course.category}</span>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${STATUS_BADGE[course.status] || 'secondary'} bg-opacity-10 text-${STATUS_BADGE[course.status] || 'secondary'} px-3 py-2 rounded-pill text-capitalize fw-bold`} style={{ fontSize: '0.75rem' }}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex flex-column align-items-center small">
                          <span className="text-dark fw-bold">{course.enrollmentCount || 0} Students</span>
                          <span className="text-muted">{course.lessonCount || 0} Lessons</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted small">{formatDate(course.createdAt)}</td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Link to={`/teacher/courses/${course._id}/edit`} className="btn btn-sm btn-outline-primary rounded-3" title="Edit Course">
                            <i className="bi bi-pencil" />
                          </Link>
                          <Link to={`/teacher/courses/${course._id}/progress`} className="btn btn-sm btn-outline-success rounded-3" title="Analytics">
                            <i className="bi bi-graph-up" />
                          </Link>
                          {course.status === 'draft' && (
                            <button className="btn btn-sm btn-outline-warning rounded-3" title="Submit" onClick={() => handleSubmit(course._id)}>
                              <i className="bi bi-send" />
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-danger rounded-3" title="Delete" onClick={() => setDeleteTarget(course)}>
                            <i className="bi bi-trash" />
                          </button>
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
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated lessons and quizzes will be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Delete Course"
      />
    </div>
  )
}

export default TeacherCourses
