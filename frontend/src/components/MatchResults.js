import React from 'react';

function MatchResults({ results }) {
  if (!results) return null;

  const getBadgeColor = (level) => {
    if (level === 'High') return 'badge-high';
    if (level === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div className="card">
      <h2>Match Results ({results.total} candidates found)</h2>
      {results.total === 0 ? <p>No matching candidates found.</p> : (
        <div className="results-list">
          {results.results.map((c, i) => (
            <div key={c._id} className="result-card">
              <div className="result-header">
                <div className="rank">#{i + 1}</div>
                <div className="result-info">
                  <h3>{c.name}</h3>
                  <p>{c.email} — {c.experience} year{c.experience !== 1 ? 's' : ''} experience</p>
                </div>
                <div className="result-score">
                  <div className="score-number">{c.matchScore}%</div>
                  <span className={`badge ${getBadgeColor(c.matchLevel)}`}>{c.matchLevel} Match</span>
                </div>
              </div>
              <div className="skills-row">
                <span className="label">Matched Skills:</span>
                {c.matchedRequired.map((s, i) => <span key={i} className="skill-tag matched">{s}</span>)}
              </div>
              <div className="skills-row">
                <span className="label">All Skills:</span>
                {c.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchResults;
