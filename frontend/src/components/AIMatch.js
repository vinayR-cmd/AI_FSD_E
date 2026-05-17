import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';

function AIMatch() {
  const [form, setForm] = useState({ requiredSkills: '', minExperience: '', preferredSkills: '', jobDescription: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const payload = {
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minExperience: Number(form.minExperience) || 0,
        preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        jobDescription: form.jobDescription
      };
      const res = await axios.post(`${BASE_URL}/api/ai/shortlist`, payload);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI matching failed. Check your OpenRouter API key.');
    }
    setLoading(false);
  };

  const getBadgeClass = (level) => {
    if (level === 'High') return 'badge-high';
    if (level === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div>
      <div className="card">
        <h2>AI-Powered Candidate Matching</h2>
        <p style={{color:'#666', marginBottom:'20px', fontSize:'0.9rem'}}>Uses OpenRouter AI to intelligently rank candidates</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Required Skills (comma separated)</label>
            <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Minimum Experience (years)</label>
            <input type="number" placeholder="e.g. 1" value={form.minExperience} onChange={e => setForm({...form, minExperience: e.target.value})} min="0" />
          </div>
          <div className="form-group">
            <label>Preferred Skills (optional)</label>
            <input type="text" placeholder="e.g. AWS, Docker" value={form.preferredSkills} onChange={e => setForm({...form, preferredSkills: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Job Description (optional)</label>
            <textarea placeholder="Describe the role..." value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} rows={3} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'AI is analyzing candidates...' : 'Run AI Matching'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="card" style={{textAlign:'center', padding:'40px'}}>
          <div style={{fontSize:'2rem', marginBottom:'12px'}}>🤖</div>
          <p style={{color:'#667eea', fontWeight:600}}>AI is analyzing all candidates...</p>
          <p style={{color:'#888', fontSize:'0.85rem', marginTop:'8px'}}>This may take a few seconds</p>
        </div>
      )}

      {results && (
        <div className="card">
          <h2>AI Ranking Results ({results.total} candidates)</h2>
          {results.aiSummary && (
            <div style={{background:'#f3f0ff', border:'1px solid #d1c4e9', borderRadius:'8px', padding:'14px', marginBottom:'20px'}}>
              <strong style={{color:'#512da8'}}>AI Summary:</strong>
              <p style={{color:'#555', marginTop:'6px', fontSize:'0.92rem'}}>{results.aiSummary}</p>
            </div>
          )}
          <div className="results-list">
            {results.results.map((c, i) => (
              <div key={i} className="result-card">
                <div className="result-header">
                  <div className="rank">#{c.rank}</div>
                  <div className="result-info">
                    <h3>{c.name}</h3>
                    <p>{c.email} — {c.experience} year{c.experience !== 1 ? 's' : ''} experience</p>
                  </div>
                  <div className="result-score">
                    <div className="score-number">{c.matchScore}%</div>
                    <span className={`badge ${getBadgeClass(c.matchLevel)}`}>{c.matchLevel} Match</span>
                  </div>
                </div>
                <div className="skills-row">
                  <span className="label">Skills:</span>
                  {c.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
                <div style={{marginTop:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                  <div style={{background:'#e8f5e9', borderRadius:'8px', padding:'10px'}}>
                    <strong style={{color:'#2e7d32', fontSize:'0.8rem'}}>STRENGTHS</strong>
                    <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{c.strengths}</p>
                  </div>
                  <div style={{background:'#fff8e1', borderRadius:'8px', padding:'10px'}}>
                    <strong style={{color:'#f57f17', fontSize:'0.8rem'}}>GAPS</strong>
                    <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{c.gaps}</p>
                  </div>
                </div>
                <div style={{marginTop:'10px', background:'#f5f5f5', borderRadius:'8px', padding:'10px'}}>
                  <strong style={{color:'#444', fontSize:'0.8rem'}}>RECOMMENDATION</strong>
                  <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{c.recommendation}</p>
                </div>
                {c.interviewQuestions && c.interviewQuestions.length > 0 && (
                  <div style={{marginTop:'10px'}}>
                    <strong style={{color:'#444', fontSize:'0.8rem'}}>INTERVIEW QUESTIONS</strong>
                    <ul style={{marginTop:'6px', paddingLeft:'18px'}}>
                      {c.interviewQuestions.map((q, qi) => (
                        <li key={qi} style={{color:'#555', fontSize:'0.85rem', marginBottom:'4px'}}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIMatch;
