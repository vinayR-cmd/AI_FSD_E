import React, { useState } from 'react';
import CandidateForm from './components/CandidateForm';
import CandidateList from './components/CandidateList';
import MatchForm from './components/MatchForm';
import MatchResults from './components/MatchResults';
import AIMatch from './components/AIMatch';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [matchResults, setMatchResults] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  const handleCandidateAdded = () => {
    setRefreshList(prev => !prev);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Candidate Shortlisting System</h1>
        <p>AI-powered candidate matching and ranking</p>
      </header>
      <nav className="nav">
        <button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>Add Candidate</button>
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>All Candidates</button>
        <button className={activeTab === 'match' ? 'active' : ''} onClick={() => setActiveTab('match')}>Basic Match</button>
        <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>AI Match</button>
      </nav>
      <main className="main">
        {activeTab === 'add' && <CandidateForm onAdded={handleCandidateAdded} />}
        {activeTab === 'list' && <CandidateList refresh={refreshList} />}
        {activeTab === 'match' && (
          <>
            <MatchForm setMatchResults={setMatchResults} />
            {matchResults && <MatchResults results={matchResults} />}
          </>
        )}
        {activeTab === 'ai' && <AIMatch />}
      </main>
    </div>
  );
}

export default App;
