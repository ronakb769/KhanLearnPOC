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
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const rawCourses = data?.data?.courses || data || []

  // Filter and Sort logic
  const filteredCourses = rawCourses
    .filter((course) => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'students') return (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
      return 0
    })

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

      {/* Search and Sort Controls */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select shadow-sm" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="students">Most Popular</option>
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={searchQuery ? "bi-search" : "bi-journal-plus"}
          title={searchQuery ? "No matching courses" : "No courses yet"}
          description={searchQuery ? "Try a different search term." : "Create your first course to get started!"}
          actionLabel={searchQuery ? "Clear Search" : "Create Course"}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
          actionTo={searchQuery ? undefined : "/teacher/courses/new"}
        />
      ) : (
        <div className="card shadow-sm border-0">
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
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div className="fw-semibold" style={{ maxWidth: 220 }}>{course.title}</div>
                      </td>
                      <td><span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">{course.category}</span></td>
                      <td>
                        <span className={`badge bg-${STATUS_BADGE[course.status] || 'secondary'} bg-opacity-10 text-${STATUS_BADGE[course.status] || 'secondary'} border border-${STATUS_BADGE[course.status] || 'secondary'} border-opacity-25`}>
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
