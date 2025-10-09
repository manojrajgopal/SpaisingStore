import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import './Register.css';

const Register = () => {
  const { register, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      first_name: firstNameRef.current.getValue(),
      last_name: lastNameRef.current.getValue(),
      email: emailRef.current.getValue(),
      password: passwordRef.current.getValue(),
    };

    try {
      await register(userData).unwrap();
      navigate('/');
    } catch (err) {
      // Error handled by auth slice
    }
  };

  return (
    <div className="register-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      {/* Centered Register Container */}
      <div className="register-container">
        <div className="register-card">
          {/* Header Section */}
          <div className="register-header">
            <div className="logo">
              <span className="logo-icon">👗</span>
              <span className="logo-text">Spaising's</span>
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join us and discover amazing fashion</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <div className="name-fields">
              <div className="form-group half-width">
                <Input
                  ref={firstNameRef}
                  label="First Name"
                  required
                />
              </div>
              <div className="form-group half-width">
                <Input
                  ref={lastNameRef}
                  label="Last Name"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <Input
                ref={emailRef}
                label="Email Address"
                type="email"
                required
              />
            </div>
            
            <div className="form-group">
              <Input
                ref={passwordRef}
                label="Password"
                type="password"
                required
                minLength="6"
              />
              <div className="password-hint">
                Must be at least 6 characters long
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="register-button"
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="register-footer">
            <p className="login-link">
              Already have an account?{' '}
              <Link to="/login" className="login-text">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;