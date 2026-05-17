import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';

function MatchForm({ setMatchResults }) {
  const [form, setForm] = useState({ requiredSkills: '', minExperience: '', preferredSkills: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minExperience: Number(form.minExperience) || 0,
        preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await axios.post(`${BASE_URL}/api/match`, payload);
      setMatchResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error matching candidates');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Job Requirement Matching</h2>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Required Skills (comma separated)</label>
          <input type="text" placeholder="e.g. React, Node.js" value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Minimum Experience (years)</label>
          <input type="number" placeholder="e.g. 1" value={form.minExperience} onChange={e => setForm({...form, minExperience: e.target.value})} min="0" />
        </div>
        <div className="form-group">
          <label>Preferred Skills (optional)</label>
          <input type="text" placeholder="e.g. AWS, Docker" value={form.preferredSkills} onChange={e => setForm({...form, preferredSkills: e.target.value})} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Matching...' : 'Find Matching Candidates'}
        </button>
      </form>
    </div>
  );
}

export default MatchForm;
