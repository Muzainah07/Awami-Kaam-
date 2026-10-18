import React, { useState, useEffect } from 'react';
import { UserRole, UserSession } from './types';
import { api } from './services/api';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { PinAuthScreen } from './components/auth/PinAuthScreen';
import { GetStartedScreen } from './components/auth/GetStartedScreen';
import { isDemoMode, getAuthMode } from './config/demo';
import { WorkerApp } from './components/worker/WorkerApp';
import { HirerApp } from './components/hirer/HirerApp';
import { DemoRoute } from './components/demo/DemoRoute';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [session, setSession] = useState<UserSession | null>(() => api.getCurrentSession());
  const [pendingAuthRole, setPendingAuthRole] = useState<UserRole | null>(null);

  // Sync with browser URL & history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  // Handle role selection from Welcome Screen
  const handleSelectRole = (role: UserRole) => {
    // If existing session matches, go directly; otherwise prompt auth
    if (session && session.role === role) {
      navigate(`/${role}`);
    } else {
      setPendingAuthRole(role);
    }
  };

  const handleAuthSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setPendingAuthRole(null);
    navigate(`/${newSession.role}`);
  };

  const handleLogout = async () => {
    await api.logout();
    setSession(null);
    setPendingAuthRole(null);
    navigate('/');
  };

  const handleSwitchAccount = async (targetRole?: UserRole) => {
    const nextRole: UserRole = targetRole || (session?.role === 'worker' ? 'hirer' : 'worker');
    const newSession = await api.switchAccount(nextRole);
    setSession(newSession);
    navigate(`/${nextRole}`);
  };

  // ROUTE 1: /demo - Hidden dev route
  if (currentPath === '/demo') {
    return <DemoRoute />;
  }

  // If user is undergoing phone/OTP authentication
  if (pendingAuthRole) {
    if (isDemoMode()) {
        return (
            <GetStartedScreen
                role={pendingAuthRole}
                onSuccess={handleAuthSuccess}
                onBack={() => setPendingAuthRole(null)}
            />
        );
    }
    if (getAuthMode() === 'pin') {
        return (
            <PinAuthScreen
                role={pendingAuthRole}
                onSuccess={handleAuthSuccess}
                onBack={() => setPendingAuthRole(null)}
            />
        );
    }
    return (
      <AuthScreen
        role={pendingAuthRole}
        onSuccess={handleAuthSuccess}
        onBack={() => setPendingAuthRole(null)}
      />
    );
  }

  // ROUTE 2: /worker - Dedicated Worker App (with strict route guard)
  if (currentPath.startsWith('/worker')) {
    // Route guard: hirers cannot open /worker/*
    if (session && session.role === 'hirer') {
      navigate('/hirer');
      return null;
    }
    if (!session || session.role !== 'worker') {
      // Must authenticate as worker first
      return getAuthMode() === 'pin' ? (
        <PinAuthScreen
          role="worker"
          onSuccess={handleAuthSuccess}
          onBack={() => navigate('/')}
        />
      ) : (
        <AuthScreen
          role="worker"
          onSuccess={handleAuthSuccess}
          onBack={() => navigate('/')}
        />
      );
    }
    return (
      <WorkerApp
        onLogout={handleLogout}
        onSwitchAccount={() => handleSwitchAccount('hirer')}
      />
    );
  }

  // ROUTE 3: /hirer - Dedicated Hirer App (with strict route guard)
  if (currentPath.startsWith('/hirer')) {
    // Route guard: workers cannot open /hirer/*
    if (session && session.role === 'worker') {
      navigate('/worker');
      return null;
    }
    if (!session || session.role !== 'hirer') {
      // Must authenticate as hirer first
      return getAuthMode() === 'pin' ? (
        <PinAuthScreen
          role="hirer"
          onSuccess={handleAuthSuccess}
          onBack={() => navigate('/')}
        />
      ) : (
        <AuthScreen
          role="hirer"
          onSuccess={handleAuthSuccess}
          onBack={() => navigate('/')}
        />
      );
    }
    return (
      <HirerApp
        onLogout={handleLogout}
        onSwitchAccount={() => handleSwitchAccount('worker')}
      />
    );
  }

  // ROUTE 4: / - Welcome Screen
  return (
    <WelcomeScreen onSelectRole={handleSelectRole} onSuccess={handleAuthSuccess} />
  );
}
