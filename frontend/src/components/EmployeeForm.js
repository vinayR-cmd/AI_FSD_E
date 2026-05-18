import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import { authHeader } from '../utils/auth';

function EmployeeForm({ onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', department: '', skills: '', performanceScore: '', experience: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await axios.post(`${BASE_URL}/api/employees`, {
        name: form.name,
        email: form.email,
        department: form.department,
        skills: skillsArray,
        performanceScore: Number(form.performanceScore),
        experience: Number(form.experience)
      }, { headers: authHeader() });
      setMessage('Employee added successfully!');
      setForm({ name: '', email: '', department: '', skills: '', performanceScore: '', experience: '' });
      setTimeout(() => onAdded(), 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error adding employee');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Add New Employee</h2>
      {message && <div className={message.includes('Error') || message.includes('error') ? 'error-msg' : 'success-msg'}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="e.g. Aman Verma" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="e.g. aman@gmail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} required>
              <option value="">Select Department</option>
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
            <label>Experience (years)</label>
            <input type="number" placeholder="e.g. 3" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} required min="0" />
          </div>
        </div>
        <div className="form-group">
          <label>Skills (comma separated)</label>
          <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Performance Score (0-100)</label>
          <input type="number" placeholder="e.g. 85" value={form.performanceScore} onChange={e => setForm({...form, performanceScore: e.target.value})} required min="0" max="100" />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Employee'}
        </button>
      </form>
    </div>
  );
}

export default EmployeeForm;
