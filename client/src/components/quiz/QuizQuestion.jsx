const QuizQuestion = ({ question, selectedOptionId, onSelect, questionNumber, totalQuestions, isReview = false, correctOptionId, userAnswerOptionId }) => {
  const progress = Math.round((questionNumber / totalQuestions) * 100)
  return (
    <div className="card border-0 shadow" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted small fw-semibold">Question {questionNumber} of {totalQuestions}</span>
          <span className="badge bg-primary bg-opacity-10 text-primary">{progress}%</span>
        </div>
        <div className="progress mb-3" style={{ height: 4 }}>
          <div className="progress-bar bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="card-body px-4 pb-4">
        <h5 className="fw-semibold mb-4" style={{ lineHeight: 1.5 }}>{question.questionText}</h5>
        <div className="d-flex flex-column gap-2">
          {(question.options || []).map((option) => {
            let cls = 'option-card p-3 rounded-3'
            if (isReview) {
              if (option.id === correctOptionId) cls += ' correct'
              else if (option.id === userAnswerOptionId && option.id !== correctOptionId) cls += ' incorrect'
            } else {
              if (option.id === selectedOptionId) cls += ' selected'
            }
            return (
              <div
                key={option.id}
                className={cls}
                onClick={() => !isReview && onSelect && onSelect(option.id)}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className={`rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0 ${option.id === selectedOptionId && !isReview ? 'border-primary bg-primary' : 'border-secondary'}`}
                    style={{ width: 20, height: 20 }}>
                    {option.id === selectedOptionId && !isReview && (
                      <div className="rounded-circle bg-white" style={{ width: 8, height: 8 }} />
                    )}
                    {isReview && option.id === correctOptionId && <i className="bi bi-check text-success" style={{ fontSize: '0.7rem' }} />}
                    {isReview && option.id === userAnswerOptionId && option.id !== correctOptionId && <i className="bi bi-x text-danger" style={{ fontSize: '0.7rem' }} />}
                  </div>
                  <span className="small">{option.text}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
export default QuizQuestion
