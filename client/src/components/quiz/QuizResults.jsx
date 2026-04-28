const QuizResults = ({ score = 0, passed = false, total = 0, correct = 0, results = [], questions = [], onRetake, onBack, passingScore = 70 }) => {
  const ringColor = passed ? '#2d6a4f' : '#dc3545'
  return (
    <div>
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{ width: 140, height: 140, border: `8px solid ${ringColor}`, background: passed ? 'rgba(45,106,79,0.08)' : 'rgba(220,53,69,0.08)' }}>
          <span className="fw-bold" style={{ fontSize: '2.2rem', color: ringColor }}>{score}%</span>
        </div>
        <div className={`badge px-4 py-2 fs-5 ${passed ? 'bg-success' : 'bg-danger'} mb-3 d-block`} style={{ maxWidth: 200, margin: '0 auto' }}>
          {passed ? '🎉 PASSED!' : 'FAILED'}
        </div>
        <div className="row justify-content-center g-3 mb-4">
          <div className="col-auto">
            <div className="card border-0 bg-light text-center px-4 py-3">
              <div className="fw-bold fs-4">{correct}/{total}</div>
              <div className="text-muted small">Correct</div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card border-0 bg-light text-center px-4 py-3">
              <div className="fw-bold fs-4">{score}%</div>
              <div className="text-muted small">Score</div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card border-0 bg-light text-center px-4 py-3">
              <div className="fw-bold fs-4">{passingScore}%</div>
              <div className="text-muted small">Passing</div>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center gap-3">
          {onRetake && <button className="btn btn-outline-secondary" onClick={onRetake}><i className="bi bi-arrow-repeat me-2" />Retake Quiz</button>}
          {onBack && <button className="btn btn-primary" onClick={onBack}><i className="bi bi-arrow-left me-2" />Back to Course</button>}
        </div>
      </div>

      {results.length > 0 && (
        <div>
          <h5 className="fw-bold mb-3">Question Review</h5>
          <div className="accordion" id="reviewAccordion">
            {results.map((r, i) => {
              const q = questions.find(q => q.id === r.questionId) || {}
              return (
                <div key={i} className="accordion-item border mb-2 rounded-3 overflow-hidden">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target={`#review-${i}`}>
                      <span className={`badge me-2 ${r.correct ? 'bg-success' : 'bg-danger'}`}>
                        <i className={`bi bi-${r.correct ? 'check' : 'x'}`} />
                      </span>
                      Q{i + 1}: {(q.questionText || r.questionText || '').slice(0, 60)}…
                    </button>
                  </h2>
                  <div id={`review-${i}`} className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <p className="fw-semibold mb-2">{q.questionText || r.questionText}</p>
                      {(q.options || []).map(o => (
                        <div key={o.id} className={`p-2 rounded mb-1 small ${o.id === r.correctOptionId ? 'bg-success bg-opacity-10 border border-success' : o.id === r.selectedOptionId && o.id !== r.correctOptionId ? 'bg-danger bg-opacity-10 border border-danger' : 'bg-light'}`}>
                          {o.id === r.correctOptionId && <i className="bi bi-check-circle-fill text-success me-2" />}
                          {o.id === r.selectedOptionId && o.id !== r.correctOptionId && <i className="bi bi-x-circle-fill text-danger me-2" />}
                          {o.text}
                        </div>
                      ))}
                      {r.explanation && <div className="alert alert-info mt-2 mb-0 small"><i className="bi bi-lightbulb me-2" />{r.explanation}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
export default QuizResults
