const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Candidate = require('../models/Candidate');

router.post('/shortlist', async (req, res) => {
  try {
    const { requiredSkills, minExperience = 0, preferredSkills = [], jobDescription = '' } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ error: 'requiredSkills is required' });
    }

    const candidates = await Candidate.find({ experience: { $gte: minExperience } });

    if (candidates.length === 0) {
      return res.json({ total: 0, results: [], aiSummary: 'No candidates found matching the experience criteria.' });
    }

    const candidateList = candidates.map((c, i) =>
      `${i + 1}. Name: ${c.name} | Email: ${c.email} | Skills: ${c.skills.join(', ')} | Experience: ${c.experience} years${c.bio ? ' | Bio: ' + c.bio : ''}`
    ).join('\n');

    const prompt = `You are an expert technical recruiter. Analyze these candidates for a job opening and rank them.

JOB REQUIREMENTS:
- Required Skills: ${requiredSkills.join(', ')}
- Minimum Experience: ${minExperience} years
- Preferred Skills: ${preferredSkills.length > 0 ? preferredSkills.join(', ') : 'None'}
- Job Description: ${jobDescription || 'Not provided'}

CANDIDATES:
${candidateList}

Respond ONLY with a valid JSON object in this exact format, no extra text, no markdown:
{
  "rankings": [
    {
      "name": "candidate name exactly as given",
      "email": "candidate email exactly as given",
      "rank": 1,
      "matchScore": 85,
      "matchLevel": "High",
      "strengths": "why this candidate is good for this role",
      "gaps": "what this candidate is missing",
      "recommendation": "one line hiring recommendation",
      "interviewQuestions": ["question 1", "question 2", "question 3"]
    }
  ],
  "summary": "overall summary of the candidate pool in 2 sentences"
}

Rules:
- matchLevel must be exactly "High", "Medium", or "Low"
- matchScore must be a number between 0 and 100
- rank 1 is the best candidate
- Include ALL candidates sorted best to worst
- Return pure JSON only, no extra text`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Candidate Shortlisting System'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter error:', data);
      return res.status(500).json({ error: data.error?.message || 'OpenRouter API failed' });
    }

    const rawText = data.choices[0].message.content.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'AI response parsing failed' });
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    const enriched = aiResult.rankings.map(r => {
      const candidate = candidates.find(c => c.email === r.email);
      return {
        ...r,
        skills: candidate ? candidate.skills : [],
        experience: candidate ? candidate.experience : 0,
        _id: candidate ? candidate._id : null
      };
    });

    res.json({
      total: enriched.length,
      results: enriched,
      aiSummary: aiResult.summary
    });

  } catch (err) {
    console.error('AI shortlist error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
