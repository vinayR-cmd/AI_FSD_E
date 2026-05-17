const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

router.post('/', async (req, res) => {
  try {
    const { requiredSkills, minExperience = 0, preferredSkills = [] } = req.body;
    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ error: 'requiredSkills is required' });
    }
    const candidates = await Candidate.find({ experience: { $gte: minExperience } });
    const scored = candidates.map(candidate => {
      const skillsLower = candidate.skills.map(s => s.toLowerCase());
      const requiredLower = requiredSkills.map(s => s.toLowerCase());
      const preferredLower = preferredSkills.map(s => s.toLowerCase());
      const matchedRequired = requiredLower.filter(s => skillsLower.includes(s));
      const matchedPreferred = preferredLower.filter(s => skillsLower.includes(s));
      const requiredScore = matchedRequired.length / requiredSkills.length;
      const preferredScore = preferredSkills.length > 0 ? matchedPreferred.length / preferredSkills.length : 0;
      const totalScore = (requiredScore * 0.8) + (preferredScore * 0.2);
      let matchLevel = 'Low';
      if (totalScore >= 0.8) matchLevel = 'High';
      else if (totalScore >= 0.4) matchLevel = 'Medium';
      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        matchScore: Math.round(totalScore * 100),
        matchedRequired,
        matchLevel
      };
    });
    const sorted = scored.filter(c => c.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    res.json({ total: sorted.length, results: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
