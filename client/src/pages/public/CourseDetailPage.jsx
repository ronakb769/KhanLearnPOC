import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Loader from '../../components/common/Loader';
import { useGetCourseByIdQuery, useGetCourseFullDetailQuery } from '../../services/courseApi';
import { useGetMyEnrollmentsQuery, useEnrollMutation } from '../../services/enrollmentApi';
import { useGetQuizzesByCourseQuery } from '../../services/quizApi';
import { useToast } from '../../hooks/useToast';
import { formatDuration, getCategoryBadgeClass } from '../../utils/formatters';

const LEVEL_COLORS = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' };

export default function CourseDetailPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = !!auth?.accessToken;

  const [activeTab, setActiveTab] = useState('content');

  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: fullDetailData } = useGetCourseFullDetailQuery(courseId, {
    skip: !isAuthenticated,
  });
  const { data: quizzesData } = useGetQuizzesByCourseQuery(courseId);
  const [enroll, { isLoading: enrolling }] = useEnrollMutation();

  const course = courseData?.data?.course || courseData?.data || null;
  const enrollments = enrollmentsData?.data?.enrollments || enrollmentsData?.data || enrollmentsData || [];
  const isEnrolled = enrollments.some((e) => {
    const cId = typeof e.course === 'object' ? e.course?._id : e.course;
    return String(cId) === String(courseId) && e.status !== 'dropped';
  });
  const fullDetail = fullDetailData?.data || null;
  const lessons = fullDetail?.lessons || [];
  const quizzes = quizzesData?.data?.quizzes || quizzesData?.data || [];

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await enroll(courseId).unwrap();
      showToast('Successfully enrolled!', 'success');
    } catch (err) {
      showToast(err?.data?.message || 'Enrollment failed', 'danger');
    }
  };

  if (courseLoading) return <><Navbar /><Loader /></>;
  if (!course) return <><Navbar /><div className="container py-5 text-center text-muted">Course not found.</div></>;

  const shortDesc =
    course.description?.length > 200
      ? course.description.slice(0, 200) + '…'
      : course.description;

  const teacher = course.teacher || {};
  const teacherName = teacher.name || 'Unknown Instructor';
  const teacherAvatar = teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=1d3557&color=fff`;

  // Placeholder lessons if not enrolled
  const lessonCount = course.lessonCount || course.lessons?.length || 0;
  const placeholderLessons = Array.from({ length: lessonCount }, (_, i) => ({
    _id: `placeholder-${i}`,
    title: `Lesson ${i + 1}`,
    duration: null,
  }));

  const displayLessons = isEnrolled && lessons.length > 0 ? lessons : placeholderLessons;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-dark text-white py-5">
        <div className="container">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/" className="text-white-50 text-decoration-none">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/courses" className="text-white-50 text-decoration-none">Courses</Link>
              </li>
              <li className="breadcrumb-item active text-white" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="row g-4 align-items-start">
            {/* Left: Course Info */}
            <div className="col-md-8">
              <span
                className={`badge bg-${getCategoryBadgeClass(course.category)} mb-2`}
              >
                {course.category}
              </span>
              <h1 className="fw-bold display-6 mb-3">{course.title}</h1>
              <p className="text-white-50 mb-4" style={{ fontSize: '1.05rem' }}>
                {shortDesc}
              </p>

              {/* Instructor */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <img
                  src={teacherAvatar}
                  alt={teacherName}
                  className="rounded-circle"
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover' }}
                />
                <div>
                  <small className="text-white-50 d-block">Created by</small>
                  <span className="fw-semibold">{teacherName}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="d-flex flex-wrap gap-3 text-white-50 small">
                <span>
                  <span
                    className={`badge bg-${LEVEL_COLORS[course.level] || 'secondary'} me-1`}
                  >
                    {course.level}
                  </span>
                  Level
                </span>
                <span>
                  <i className="bi bi-play-circle me-1"></i>
                  {lessonCount} Lessons
                </span>
                {course.totalDuration > 0 && (
                  <span>
                    <i className="bi bi-clock me-1"></i>
                    {formatDuration(course.totalDuration)}
                  </span>
                )}
                <span>
                  <i className="bi bi-people me-1"></i>
                  {(course.enrollmentCount || 0).toLocaleString()} Students
                </span>
              </div>
            </div>

            {/* Right: Enroll Card */}
            <div className="col-md-4">
              <div className="card border-0 shadow-lg" style={{ position: 'sticky', top: 80 }}>
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="card-img-top rounded-top"
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                )}
                <div className="card-body p-4">
                  {isEnrolled ? (
                    <Link
                      to={`/student/courses/${courseId}/lessons/${lessons[0]?._id || ''}`}
                      className="btn btn-success btn-lg w-100 mb-3"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Continue Learning
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg w-100 mb-3"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Enrolling…</>
                      ) : (
                        'Enroll Now — It\'s Free'
                      )}
                    </button>
                  )}

                  <ul className="list-unstyled mb-0">
                    {[
                      { icon: 'bi-infinity', text: 'Self-paced learning' },
                      { icon: 'bi-award', text: 'Certificate upon completion' },
                      { icon: 'bi-lock-fill', text: 'Lifetime access' },
                    ].map((item) => (
                      <li key={item.text} className="d-flex align-items-center gap-2 mb-2 small text-muted">
                        <i className={`bi ${item.icon} text-primary`}></i>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-5">
        <div className="container">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'content' ? 'active fw-semibold' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                <i className="bi bi-list-ul me-1"></i>Course Content
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'instructor' ? 'active fw-semibold' : ''}`}
                onClick={() => setActiveTab('instructor')}
              >
                <i className="bi bi-person-circle me-1"></i>About Instructor
              </button>
            </li>
          </ul>

          {/* Tab: Course Content */}
          {activeTab === 'content' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">{lessonCount} Lessons</h5>
                {!isEnrolled && (
                  <small className="text-muted">
                    <i className="bi bi-lock me-1"></i>Enroll to unlock all lessons
                  </small>
                )}
              </div>
              <div className="list-group">
                {displayLessons.map((lesson, idx) => {
                  const isPlaceholder = lesson._id?.startsWith('placeholder-');
                  return (
                    <div
                      key={lesson._id}
                      className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold"
                        style={{ width: 36, height: 36, flexShrink: 0, fontSize: '0.85rem' }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-grow-1">
                        {isEnrolled && !isPlaceholder ? (
                          <Link
                            to={`/student/courses/${courseId}/lessons/${lesson._id}`}
                            className="text-decoration-none fw-semibold"
                          >
                            {lesson.title}
                          </Link>
                        ) : (
                          <span className="fw-semibold text-muted">{lesson.title}</span>
                        )}
                        {lesson.duration > 0 && (
                          <small className="text-muted d-block">{formatDuration(lesson.duration)}</small>
                        )}
                      </div>
                      {!isEnrolled ? (
                        <i className="bi bi-lock text-muted"></i>
                      ) : (
                        <i className="bi bi-play-circle text-primary"></i>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quizzes */}
              {quizzes.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-patch-question me-1 text-warning"></i>
                    Quizzes ({quizzes.length})
                  </h6>
                  <div className="list-group">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="list-group-item d-flex align-items-center gap-3"
                      >
                        <i className="bi bi-question-circle text-warning fs-5"></i>
                        <div className="flex-grow-1">
                          <span className="fw-semibold">{quiz.title}</span>
                          {quiz.questions?.length > 0 && (
                            <small className="text-muted d-block">
                              {quiz.questions.length} questions
                            </small>
                          )}
                        </div>
                        {!isEnrolled ? (
                          <i className="bi bi-lock text-muted"></i>
                        ) : (
                          <Link
                            to={`/student/courses/${courseId}/quiz/${quiz._id}`}
                            className="btn btn-sm btn-outline-warning"
                          >
                            Take Quiz
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: About Instructor */}
          {activeTab === 'instructor' && (
            <div className="row">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-4 mb-4">
                  <img
                    src={teacherAvatar}
                    alt={teacherName}
                    className="rounded-circle"
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <h4 className="fw-bold mb-1">{teacherName}</h4>
                    {teacher.email && (
                      <p className="text-muted mb-0 small">
                        <i className="bi bi-envelope me-1"></i>{teacher.email}
                      </p>
                    )}
                  </div>
                </div>

                {teacher.bio ? (
                  <p className="text-muted">{teacher.bio}</p>
                ) : (
                  <p className="text-muted fst-italic">
                    This instructor is passionate about teaching and helping students achieve their
                    learning goals. With expertise in {course.category}, they bring real-world
                    knowledge and engaging teaching methods to every lesson.
                  </p>
                )}

                <div className="row row-cols-3 g-3 mt-2">
                  {[
                    { icon: 'bi-book', label: 'Course', value: 1 },
                    { icon: 'bi-people', label: 'Students', value: (course.enrollmentCount || 0).toLocaleString() },
                    { icon: 'bi-play-circle', label: 'Lessons', value: lessonCount },
                  ].map((stat) => (
                    <div className="col text-center" key={stat.label}>
                      <div className="card border-0 bg-light p-3">
                        <i className={`bi ${stat.icon} fs-4 text-primary mb-1`}></i>
                        <div className="fw-bold">{stat.value}</div>
                        <small className="text-muted">{stat.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
