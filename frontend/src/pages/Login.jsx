import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import './Login.css';

const Login = () => {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system for background animation
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 60}%)`;
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw floating shapes
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = 'white';
      
      // Floating circles
      const time = Date.now() * 0.001;
      for (let i = 0; i < 5; i++) {
        const x = (Math.sin(time * 0.2 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * canvas.height;
        const radius = 50 + Math.sin(time * 0.5 + i) * 20;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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
    <div className="login-page">
      <canvas 
        ref={canvasRef} 
        className="animated-background"
      />
      
      <div className="login-container">
        <div className="login-content">
          <div className="login-card">
            <div className="card-header">
              <div className="logo">
                <span className="logo-icon">👗</span>
                <span className="logo-text">Spaising's</span>
              </div>
              <h2 className="welcome-title">Welcome Back</h2>
              <p className="welcome-subtitle">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-alert">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              <div className="input-group">
                <Input
                  ref={emailRef}
                  label="Email"
                  type="email"
                  required
                  className="auth-input"
                />
              </div>
              
              <div className="input-group">
                <Input
                  ref={passwordRef}
                  label="Password"
                  type="password"
                  required
                  className="auth-input"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="login-button"
              >
                <span className="button-text">
                  {loading ? 'Logging in...' : 'Login'}
                </span>
                <span className="button-loader"></span>
              </button>
              
              <div className="auth-footer">
                <p className="footer-text">
                  Don't have an account? 
                  <Link to="/register" className="auth-link">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;