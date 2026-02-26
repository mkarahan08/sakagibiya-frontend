import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  // sayfa açılınca profil çek
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(getProfile());
  }, [dispatch, isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Profil bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => navigate("/login")} className="back-to-login-btn">
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
          </div>
          <h2>Profil Bilgileri</h2>
        </div>

        {user && (
          <div className="profile-info">
            <div className="profile-info-item">
              <div className="info-label">
                <span className="label-icon">👤</span>
                <span>İsim</span>
              </div>
              <div className="info-value">{user.name}</div>
            </div>

            <div className="profile-info-item">
              <div className="info-label">
                <span className="label-icon">📧</span>
                <span>Email</span>
              </div>
              <div className="info-value">{user.email}</div>
            </div>

            {user._id && (
              <div className="profile-info-item">
                <div className="info-label">
                  <span className="label-icon">🆔</span>
                  <span>Kullanıcı ID</span>
                </div>
                <div className="info-value">{user._id}</div>
              </div>
            )}
          </div>
        )}

        <div className="profile-actions">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
