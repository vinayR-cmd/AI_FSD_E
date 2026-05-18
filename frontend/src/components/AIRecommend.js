import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import { authHeader } from '../utils/auth';

function AIRecommend() {
  const [form, setForm] = useState({ department: '', minExperience: '', context: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await axios.post(`${BASE_URL}/api/ai/recommend`, {
        department: form.department,
        minExperience: Number(form.minExperience) || 0,
        context: form.context
      }, { headers: authHeader() });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI recommendation failed.');
    }
    setLoading(false);
  };

  const getBadgeClass = (level) => {
    if (level === 'Promote') return 'badge-promote';
    if (level === 'Retain') return 'badge-retain';
    if (level === 'Train') return 'badge-train';
    return 'badge-review';
  };

  return (
    <div>
      <div className="card">
        <h2>AI Performance Recommendations</h2>
        <p style={{color:'#666', marginBottom:'20px', fontSize:'0.9rem'}}>AI analyzes employee performance and recommends promotions, training, and improvements</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Department (optional)</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                <option value="">All Departments</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            <div className="form-group">
              <label>Min Experience (years)</label>
              <input type="number" placeholder="e.g. 2" value={form.minExperience} onChange={e => setForm({...form, minExperience: e.target.value})} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label>Context / Focus Area (optional)</label>
            <textarea placeholder="e.g. Quarterly promotion review, identify employees ready for leadership roles..." value={form.context} onChange={e => setForm({...form, context: e.target.value})} rows={2} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'AI is analyzing...' : 'Generate AI Recommendations'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="card" style={{textAlign:'center', padding:'40px'}}>
          <div style={{fontSize:'2rem', marginBottom:'12px'}}>🤖</div>
          <p style={{color:'#667eea', fontWeight:600}}>AI is analyzing employee performance...</p>
          <p style={{color:'#888', fontSize:'0.85rem', marginTop:'8px'}}>This may take a few seconds</p>
        </div>
      )}

      {results && (
        <div className="card">
          <h2>AI Recommendations ({results.total} employees)</h2>
          {results.aiSummary && (
            <div className="ai-summary-box">
              <div><strong>Team Summary:</strong> {results.aiSummary}</div>
              {results.topPerformer && <div style={{marginTop:'8px'}}><strong>Top Performer:</strong> {results.topPerformer}</div>}
              {results.teamInsights && <div style={{marginTop:'8px'}}><strong>Key Insight:</strong> {results.teamInsights}</div>}
            </div>
          )}
          <div className="results-list" style={{marginTop:'20px'}}>
            {results.results.map((emp, i) => (
              <div key={i} className="result-card">
                <div className="result-header">
                  <div className="rank">#{emp.rank}</div>
                  <div className="result-info">
                    <h3>{emp.name}</h3>
                    <p>{emp.department} — {emp.experience} year{emp.experience !== 1 ? 's' : ''} experience</p>
                  </div>
                  <div className="result-score">
                    <div className="score-number">{emp.performanceScore}</div>
                    <span className={`badge ${getBadgeClass(emp.recommendationLevel)}`}>{emp.recommendationLevel}</span>
                  </div>
                </div>
                <div className="skills-row">
                  <span className="label">Skills:</span>
                  {emp.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
                {emp.trainingNeeded && emp.trainingNeeded.length > 0 && (
                  <div className="skills-row" style={{marginTop:'6px'}}>
                    <span className="label">Training Needed:</span>
                    {emp.trainingNeeded.map((s, i) => <span key={i} className="skill-tag" style={{background:'#fff8e1', color:'#f57f17'}}>{s}</span>)}
                  </div>
                )}
                <div style={{marginTop:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                  <div style={{background:'#e8f5e9', borderRadius:'8px', padding:'10px'}}>
                    <strong style={{color:'#2e7d32', fontSize:'0.8rem'}}>STRENGTHS</strong>
                    <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{emp.strengths}</p>
                  </div>
                  <div style={{background:'#fff8e1', borderRadius:'8px', padding:'10px'}}>
                    <strong style={{color:'#f57f17', fontSize:'0.8rem'}}>IMPROVEMENTS</strong>
                    <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{emp.improvements}</p>
                  </div>
                </div>
                <div style={{marginTop:'10px', background:'#f3f0ff', borderRadius:'8px', padding:'10px'}}>
                  <strong style={{color:'#512da8', fontSize:'0.8rem'}}>AI FEEDBACK</strong>
                  <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{emp.aiFeedback}</p>
                </div>
                <div style={{marginTop:'10px', background:'#f5f5f5', borderRadius:'8px', padding:'10px'}}>
                  <strong style={{color:'#444', fontSize:'0.8rem'}}>RECOMMENDATION</strong>
                  <p style={{color:'#555', fontSize:'0.85rem', marginTop:'4px'}}>{emp.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIRecommend;
