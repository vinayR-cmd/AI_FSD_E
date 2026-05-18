import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import AIRecommend from './components/AIRecommend';
import { isLoggedIn, clearAuth, getUser } from './utils/auth';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [activeTab, setActiveTab] = useState('list');
  const [refreshList, setRefreshList] = useState(false);
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    setUser(getUser());
  };

  const handleLogout = () => {
    clearAuth();
    setLoggedIn(false);
    setUser(null);
  };

  const handleEmployeeAdded = () => {
    setRefreshList(prev => !prev);
    setActiveTab('list');
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Employee Performance Analytics</h1>
          <p>AI-powered HR management system</p>
        </div>
        <div className="header-user">
          <span>Welcome, {user?.name || 'User'}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <nav className="nav">
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>All Employees</button>
        <button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>Add Employee</button>
        <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>AI Recommendations</button>
      </nav>
      <main className="main">
        {activeTab === 'list' && <EmployeeList refresh={refreshList} />}
        {activeTab === 'add' && <EmployeeForm onAdded={handleEmployeeAdded} />}
        {activeTab === 'ai' && <AIRecommend />}
      </main>
    </div>
  );
}

export default App;
