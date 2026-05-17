import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';

function CandidateForm({ onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', skills: '', experience: '', bio: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await axios.post(`${BASE_URL}/api/candidates`, {
        ...form,
        skills: skillsArray,
        experience: Number(form.experience)
      });
      setMessage('Candidate added successfully!');
      setForm({ name: '', email: '', skills: '', experience: '', bio: '' });
      onAdded();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error adding candidate');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Add New Candidate</h2>
      {message && <div className={message.includes('Error') ? 'error-msg' : 'success-msg'}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="e.g. rahul@gmail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Skills (comma separated)</label>
          <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Experience (years)</label>
          <input type="number" placeholder="e.g. 2" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} required min="0" />
        </div>
        <div className="form-group">
          <label>Bio / Projects (optional)</label>
          <textarea placeholder="Brief description..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Candidate'}
        </button>
      </form>
    </div>
  );
}

export default CandidateForm;
