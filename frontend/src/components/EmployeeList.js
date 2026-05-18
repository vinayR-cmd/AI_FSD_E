import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import { authHeader } from '../utils/auth';

function EmployeeList({ refresh }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', department: '', skill: '' });
  const [editId, setEditId] = useState(null);
  const [newScore, setNewScore] = useState('');
  const [message, setMessage] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.department) params.department = search.department;
      if (search.skill) params.skill = search.skill;
      const hasSearch = Object.keys(params).length > 0;
      const url = hasSearch ? `${BASE_URL}/api/employees/search` : `${BASE_URL}/api/employees`;
      const res = await axios.get(url, { headers: authHeader(), params: hasSearch ? params : undefined });
      setEmployees(res.data.employees);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEmployees(); }, [refresh]);

  const handleSearch = (e) => { e.preventDefault(); fetchEmployees(); };
  const handleClear = () => { setSearch({ name: '', department: '', skill: '' }); setTimeout(fetchEmployees, 100); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/employees/${id}`, { headers: authHeader() });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateScore = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/employees/${id}`, { performanceScore: Number(newScore) }, { headers: authHeader() });
      setEditId(null);
      setNewScore('');
      setMessage('Score updated successfully!');
      fetchEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Update failed');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#f57f17';
    if (score >= 40) return '#e65100';
    return '#c62828';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Review';
  };

  return (
    <div className="card">
      <h2>All Employees ({employees.length})</h2>
      {message && <div className="success-msg">{message}</div>}
      <form onSubmit={handleSearch} className="search-section">
        <div className="search-row">
          <input type="text" placeholder="Search by name..." value={search.name} onChange={e => setSearch({...search, name: e.target.value})} />
          <select value={search.department} onChange={e => setSearch({...search, department: e.target.value})}>
            <option value="">All Departments</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Sales">Sales</option>
          </select>
          <input type="text" placeholder="Search by skill..." value={search.skill} onChange={e => setSearch({...search, skill: e.target.value})} />
          <button type="submit" className="btn-search">Search</button>
          <button type="button" className="btn-clear" onClick={handleClear}>Clear</button>
        </div>
      </form>

      {loading ? <p>Loading...</p> : employees.length === 0 ? <p>No employees found.</p> : (
        <div className="employee-grid">
          {employees.map(emp => (
            <div key={emp._id} className="employee-card">
              <div className="emp-header">
                <div>
                  <h3>{emp.name}</h3>
                  <span className="dept-badge">{emp.department}</span>
                </div>
                <button className="btn-delete" onClick={() => handleDelete(emp._id)}>Delete</button>
              </div>
              <p className="emp-email">{emp.email}</p>
              <p className="emp-exp">{emp.experience} year{emp.experience !== 1 ? 's' : ''} experience</p>
              <div className="score-section">
                <span className="score-label">Performance Score:</span>
                {editId === emp._id ? (
                  <div className="score-edit">
                    <input type="number" value={newScore} onChange={e => setNewScore(e.target.value)} min="0" max="100" placeholder="New score" />
                    <button className="btn-save" onClick={() => handleUpdateScore(emp._id)}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="score-display">
                    <span className="score-value" style={{color: getScoreColor(emp.performanceScore)}}>{emp.performanceScore}/100</span>
                    <span className="score-tag" style={{background: getScoreColor(emp.performanceScore)}}>{getScoreLabel(emp.performanceScore)}</span>
                    <button className="btn-edit" onClick={() => { setEditId(emp._id); setNewScore(emp.performanceScore); }}>Edit</button>
                  </div>
                )}
              </div>
              <div className="skills-list">
                {emp.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
