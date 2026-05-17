import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CandidateList({ refresh }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/candidates');
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCandidates(); }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/candidates/${id}`);
      fetchCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="card">
      <h2>All Candidates ({candidates.length})</h2>
      <input className="search-input" type="text" placeholder="Search by name or skill..." value={search} onChange={e => setSearch(e.target.value)} />
      {loading ? <p>Loading...</p> : filtered.length === 0 ? <p>No candidates found.</p> : (
        <div className="candidate-grid">
          {filtered.map(c => (
            <div key={c._id} className="candidate-card">
              <div className="candidate-header">
                <h3>{c.name}</h3>
                <button className="btn-delete" onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
              <p className="email">{c.email}</p>
              <p className="experience">{c.experience} year{c.experience !== 1 ? 's' : ''} experience</p>
              <div className="skills-list">
                {c.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
              {c.bio && <p className="bio">{c.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateList;
