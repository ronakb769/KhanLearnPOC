import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { useLoginMutation, useGoogleLoginMutation } from '../../services/authApi';
import { useToast } from '../../hooks/useToast';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const handleLoginSuccess = (user, accessToken) => {
    dispatch(setCredentials({ user, accessToken }));
    showToast(`Welcome back, ${user.name}!`, 'success');
    
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await login(data).unwrap();
      const { user, accessToken } = result.data || result;
      handleLoginSuccess(user, accessToken);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err?.data?.message || 'Invalid credentials. Please try again.';
      setServerError(msg);
      showToast(msg, 'error');
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const result = await googleLogin({ idToken: response.credential }).unwrap();
      const { user, accessToken } = result.data || result;
      handleLoginSuccess(user, accessToken);
    } catch (err) {
      showToast(err?.data?.message || 'Google login failed', 'error');
    }
  };

  return (
    <div className="row g-0" style={{ minHeight: '100vh' }}>
      {/* ... Left Panel omitted for brevity ... */}
      <div
        className="col-md-5 d-none d-md-flex flex-column justify-content-between py-5 px-5 text-white"
        style={{ background: '#1d3557' }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-5">
            <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mb-0">KhanLearn</h2>
          </div>
          <h3 className="fw-bold mb-3" style={{ lineHeight: 1.4 }}>
            Unlock your potential with world-class education.
          </h3>
          <p className="text-white-50" style={{ lineHeight: 1.7 }}>
            Join thousands of learners who have transformed their skills and careers through
            our expert-led courses.
          </p>
        </div>

        <div
          className="card border-0 p-4 rounded-3"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <p className="fst-italic mb-3 text-white-50" style={{ lineHeight: 1.7 }}>
            "KhanLearn helped me go from zero to landing my first software engineering job in
            just 8 months. The structured courses and quizzes kept me on track every day."
          </p>
          <div className="d-flex align-items-center gap-2">
            <img
              src="https://ui-avatars.com/api/?name=Sarah+K&background=2d6a4f&color=fff"
              alt="Sarah K."
              className="rounded-circle"
              width={36}
              height={36}
            />
            <div>
              <strong className="d-block small">Sarah K.</strong>
              <small className="text-white-50">Software Engineer, Google</small>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-7 d-flex align-items-center justify-content-center py-5 px-4 bg-white">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '2rem' }}></i>
            <span className="fw-bold fs-4">KhanLearn</span>
          </div>

          <h3 className="fw-bold mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Sign in to continue your learning journey.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  {...register('rememberMe')}
                />
                <label className="form-check-label small" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-decoration-none text-muted small">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg mb-3"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="d-flex align-items-center gap-2 my-3">
              <hr className="flex-grow-1" />
              <small className="text-muted">or continue with</small>
              <hr className="flex-grow-1" />
            </div>

            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showToast('Google Login Failed', 'error')}
                useOneTap
                theme="outline"
                size="large"
                width="440"
              />
            </div>
          </form>

          <p className="text-center mt-4 mb-0 text-muted small">
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
