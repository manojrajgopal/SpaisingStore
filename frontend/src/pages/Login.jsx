import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';

const Login = () => {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const credentials = {
      email: emailRef.current.getValue(),
      password: passwordRef.current.getValue(),
    };

    try {
      await login(credentials).unwrap();
      navigate('/');
    } catch (err) {
      // Error handled by auth slice
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        
        {error && <div className="error-alert">{error}</div>}
        
        <Input
          ref={emailRef}
          label="Email"
          type="email"
          required
        />
        
        <Input
          ref={passwordRef}
          label="Password"
          type="password"
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;