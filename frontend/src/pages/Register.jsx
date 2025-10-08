import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';

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
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        
        {error && <div className="error-alert">{error}</div>}
        
        <Input
          ref={firstNameRef}
          label="First Name"
          required
        />
        
        <Input
          ref={lastNameRef}
          label="Last Name"
          required
        />
        
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
          minLength="6"
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;