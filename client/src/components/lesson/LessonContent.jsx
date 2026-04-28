const LessonContent = ({ lesson }) => {
  if (!lesson) return null
  return (
    <div>
      {lesson.videoUrl && (
        <div className="video-container mb-4 rounded-3 overflow-hidden shadow-sm">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span className="badge bg-primary bg-opacity-10 text-primary">Lesson {lesson.order}</span>
        <span className="text-muted small"><i className="bi bi-clock me-1" />{lesson.duration} min</span>
      </div>
      <h4 className="fw-bold mb-3">{lesson.title}</h4>
      {lesson.description && <p className="text-muted mb-3">{lesson.description}</p>}
      <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} style={{ lineHeight: 1.8 }} />
    </div>
  )
}
export default LessonContent
