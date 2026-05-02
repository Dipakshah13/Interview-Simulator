import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global state for a live mock app
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar: null,
    preferences: {
      difficulty: 'Intermediate',
      targetRoles: ['Frontend Engineer']
    },
    settings: {
      notifications: true,
      dataSharing: false
    },
    linkedAccounts: {
      google: false
    }
  });
  const [themeMode, setThemeMode] = useState('light');
  
  // Load from localStorage so data survives page refresh / direct URL navigation
  const [interviewHistory, setInterviewHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('interviewHistory');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [activeInterview, setActiveInterview] = useState(() => {
    try {
      const stored = localStorage.getItem('activeInterview');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('interviewHistory', JSON.stringify(interviewHistory));
  }, [interviewHistory]);

  useEffect(() => {
    if (activeInterview) {
      localStorage.setItem('activeInterview', JSON.stringify(activeInterview));
    } else {
      localStorage.removeItem('activeInterview');
    }
  }, [activeInterview]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
      return newTheme;
    });
  };

  const startInterview = (details) => {
    setActiveInterview({
      ...details,
      startTime: new Date(),
      qa: [] // Initialize empty Q&A for live sync
    });
  };

  const finishInterview = (score, qaData) => {
    // Use activeInterview details if available, otherwise use safe defaults
    // (handles the case where user navigated directly to /interview/session)
    const session = activeInterview || {};

    const newSession = {
      id: Date.now(),
      role: session.role || 'General Interview',
      company: session.company || 'Practice Session',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: score,
      duration: session.startTime
        ? `${Math.floor((new Date() - new Date(session.startTime)) / 60000)} min`
        : '—',
      topics: session.topics || ['Behavioral', 'Communication'],
      qa: qaData,
    };

    setInterviewHistory(prev => [newSession, ...prev]);
    setActiveInterview(null);
  };

  const contextValue = {
    userProfile, setUserProfile,
    interviewHistory, setInterviewHistory,
    activeInterview, startInterview, finishInterview,
    themeMode, toggleTheme
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
