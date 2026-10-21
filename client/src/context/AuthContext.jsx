import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedName = localStorage.getItem('omegle_user_name') || 'You';
    const savedAvatar = localStorage.getItem('omegle_user_avatar') || 'you';
    const savedPro = localStorage.getItem('omegle_user_pro') === 'true';
    const userToken = localStorage.getItem('omegle_access_token');
    let guestToken = sessionStorage.getItem('omegle_guest_token');

    // If an authenticated account is stored
    if (userToken) {
      try {
        const profile = await api.getProfile();
        if (profile) {
          setUser({
            ...profile,
            displayName: savedName || profile.email.split('@')[0],
            avatar: savedAvatar,
            isPro: savedPro
          });
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem('omegle_access_token');
      }
    }

    // Guest session isolated per browser tab
    if (!guestToken) {
      try {
        const guestData = await api.startGuestSession();
        guestToken = guestData.accessToken;
        sessionStorage.setItem('omegle_guest_token', guestToken);
        setUser({
          id: guestData.userId,
          email: guestData.email,
          displayName: savedName,
          avatar: savedAvatar,
          isGuest: true,
          isModerator: false,
          isPro: savedPro
        });
      } catch (err) {
        console.error('Guest session init failed', err);
      }
    } else {
      setUser({
        id: 'guest_' + Math.random().toString(36).substring(2, 9),
        displayName: savedName,
        avatar: savedAvatar,
        isGuest: true,
        isModerator: false,
        isPro: savedPro
      });
    }
    setLoading(false);
    return;
  };

  const updateProfile = ({ displayName, avatar }) => {
    setUser(prev => {
      const updated = {
        ...prev,
        displayName: displayName || prev.displayName,
        avatar: avatar || prev.avatar
      };
      if (displayName) localStorage.setItem('omegle_user_name', displayName);
      if (avatar) localStorage.setItem('omegle_user_avatar', avatar);
      return updated;
    });
  };

  const togglePro = () => {
    setUser(prev => {
      const newPro = !prev?.isPro;
      localStorage.setItem('omegle_user_pro', String(newPro));
      return { ...prev, isPro: newPro };
    });
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('omegle_access_token', res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem('omegle_refresh_token', res.refreshToken);
    }
    const name = email.split('@')[0];
    localStorage.setItem('omegle_user_name', name);
    const savedAvatar = localStorage.getItem('omegle_user_avatar') || 'beanie';
    setUser({
      id: res.userId,
      email: res.email,
      displayName: name,
      avatar: savedAvatar,
      isModerator: res.isModerator,
      isGuest: false,
      isPro: false
    });
    setIsAuthModalOpen(false);
    return res;
  };

  const register = async (email, password, ageConfirmed, termsAccepted) => {
    const res = await api.register({ email, password, ageConfirmed, termsAccepted });
    localStorage.setItem('omegle_access_token', res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem('omegle_refresh_token', res.refreshToken);
    }
    const name = email.split('@')[0];
    localStorage.setItem('omegle_user_name', name);
    const savedAvatar = localStorage.getItem('omegle_user_avatar') || 'beanie';
    setUser({
      id: res.userId,
      email: res.email,
      displayName: name,
      avatar: savedAvatar,
      isModerator: res.isModerator,
      isGuest: false,
      isPro: false
    });
    setIsAuthModalOpen(false);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('omegle_access_token');
    localStorage.removeItem('omegle_refresh_token');
    setUser(null);
    checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        togglePro,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isProModalOpen,
        setIsProModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
