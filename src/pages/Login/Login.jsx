import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // login başarılıysa yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignup) {
      dispatch(registerUser({ name, email, password }));
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-section">
            <span className="logo-icon">🤑</span>
            <h1 className="logo-text">ŞakaGibiYa</h1>
          </div>
          <p className="welcome-text">
            {isSignup 
              ? "Hesabınızı oluşturun ve indirimleri kaçırmayın!" 
              : "Hoş geldiniz! Hesabınıza giriş yapın"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* TABS */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`tab-button ${!isSignup ? "active" : ""}`}
              onClick={() => {
                setIsSignup(false);
                setName("");
                setEmail("");
                setPassword("");
              }}
            >
              <span className="tab-icon">🔐</span>
              <span>Giriş Yap</span>
            </button>

            <button
              type="button"
              className={`tab-button ${isSignup ? "active" : ""}`}
              onClick={() => {
                setIsSignup(true);
                setName("");
                setEmail("");
                setPassword("");
              }}
            >
              <span className="tab-icon">✨</span>
              <span>Kayıt Ol</span>
            </button>
          </div>

          <div className="form-content">
            {/* NAME */}
            {isSignup && (
              <div className="input-group">
                <label>
                  <span className="label-icon">👤</span>
                  <span>İsim</span>
                </label>
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="input-group">
              <label>
                <span className="label-icon">📧</span>
                <span>Email</span>
              </label>
              <input
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label>
                <span className="label-icon">🔒</span>
                <span>Şifre</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>{isSignup ? "Kayıt yapılıyor..." : "Giriş yapılıyor..."}</span>
                </>
              ) : (
                <>
                  <span className="button-icon">
                    {isSignup ? "✨" : "🚀"}
                  </span>
                  <span>{isSignup ? "Kayıt Ol" : "Giriş Yap"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
