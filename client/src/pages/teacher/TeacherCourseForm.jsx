import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useGetCourseByIdQuery,
} from '../../services/courseApi'
import Loader from '../../components/common/Loader'
import { useToast } from '../../hooks/useToast'

const CATEGORIES = [
  'Mathematics', 'Science', 'History', 'Computer Science',
  'Language Arts', 'Economics', 'Arts', 'Other',
]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  level: 'Beginner',
  thumbnail: '',
  price: 0,
}

const TeacherCourseForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: courseData, isLoading: fetchLoading } = useGetCourseByIdQuery(id, { skip: !isEdit })
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit && courseData) {
      const c = courseData?.data || courseData
      setForm({
        title: c.title || '',
        description: c.description || '',
        category: c.category || '',
        level: c.level || 'Beginner',
        thumbnail: c.thumbnail || '',
        price: c.price ?? 0,
      })
    }
  }, [courseData, isEdit])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category) e.category = 'Category is required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      if (isEdit) {
        await updateCourse({ id, ...form }).unwrap()
        showToast('Course updated!', 'success')
      } else {
        const res = await createCourse(form).unwrap()
        const newId = res?.data?._id || res?._id
        showToast('Course created!', 'success')
        navigate(`/teacher/courses/${newId}/lessons`)
        return
      }
      navigate('/teacher/courses')
    } catch (err) {
      showToast(err?.data?.message || 'Save failed', 'danger')
    }
  }

  if (isEdit && fetchLoading) return <Loader />

  const isSaving = creating || updating

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </h3>
        <p className="text-muted mb-0">Fill in the details below to {isEdit ? 'update' : 'create'} a course.</p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold">Course Title *</label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Algebra"
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description *</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Category *</label>
                <select
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Level</label>
                <select className="form-select" name="level" value={form.level} onChange={handleChange}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Thumbnail URL</label>
              <input
                type="url"
                className="form-control"
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Price (0 = Free)</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={form.price}
                min={0}
                step={0.01}
                onChange={handleChange}
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary px-4" disabled={isSaving}>
                {isSaving ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                ) : isEdit ? 'Update Course' : 'Create Course'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/teacher/courses')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TeacherCourseForm
