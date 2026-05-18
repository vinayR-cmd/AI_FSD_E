const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

router.post('/recommend', protect, async (req, res, next) => {
  try {
    const { department, minExperience = 0, context = '' } = req.body;

    let query = { experience: { $gte: minExperience } };
    if (department) query.department = { $regex: department, $options: 'i' };

    const employees = await Employee.find(query).sort({ performanceScore: -1 });

    if (employees.length === 0) {
      return res.json({ total: 0, results: [], aiSummary: 'No employees found matching the criteria.' });
    }

    const employeeList = employees.map((e, i) =>
      `${i + 1}. Name: ${e.name} | Department: ${e.department} | Skills: ${e.skills.join(', ')} | Performance Score: ${e.performanceScore}/100 | Experience: ${e.experience} years`
    ).join('\n');

    const prompt = `You are an expert HR analytics AI. Analyze these employees and provide detailed recommendations.

CONTEXT: ${context || 'General performance review'}
FILTERS APPLIED: Department: ${department || 'All'}, Min Experience: ${minExperience} years

EMPLOYEES:
${employeeList}

Respond ONLY with a valid JSON object, no extra text, no markdown:
{
  "rankings": [
    {
      "name": "exact employee name",
      "department": "exact department",
      "rank": 1,
      "performanceScore": 85,
      "recommendation": "Promotion",
      "recommendationLevel": "Promote",
      "strengths": "what this employee does well",
      "improvements": "areas needing improvement",
      "trainingNeeded": ["skill 1", "skill 2"],
      "aiFeedback": "detailed 2-3 sentence AI feedback about this employee",
      "interviewQuestions": ["question 1", "question 2"]
    }
  ],
  "summary": "2 sentence overall summary of the team",
  "topPerformer": "name of best employee",
  "teamInsights": "one key insight about the overall team"
}

Rules:
- recommendationLevel must be exactly one of: "Promote", "Retain", "Train", "Review"
- Promote = score >= 80, Retain = score 60-79, Train = score 40-59, Review = score < 40
- rank 1 is the best employee
- Include ALL employees
- Return pure JSON only`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Employee Performance Analytics'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenRouter API failed' });
    }

    const rawText = data.choices[0].message.content.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'AI response parsing failed' });
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    const enriched = aiResult.rankings.map(r => {
      const emp = employees.find(e => e.name === r.name);
      return {
        ...r,
        skills: emp ? emp.skills : [],
        experience: emp ? emp.experience : 0,
        _id: emp ? emp._id : null
      };
    });

    res.json({
      total: enriched.length,
      results: enriched,
      aiSummary: aiResult.summary,
      topPerformer: aiResult.topPerformer,
      teamInsights: aiResult.teamInsights
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
