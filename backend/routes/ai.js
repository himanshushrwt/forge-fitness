const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// POST /api/ai/chat - General AI assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    const systemPrompt = `You are FORGE AI, an elite personal fitness and nutrition coach embedded in the Forge Fitness platform. You are knowledgeable, motivating, and evidence-based.

User Profile:
- Name: ${userContext.name || 'Athlete'}
- Fitness Level: ${userContext.fitnessLevel || 'Not specified'}
- Goal: ${userContext.goal || 'Not specified'}
- Age: ${userContext.age || 'Not specified'}
- Weight: ${userContext.weight || 'Not specified'} kg
- Height: ${userContext.height || 'Not specified'} cm

Your capabilities:
1. Create personalized workout plans
2. Design nutrition plans and suggest meals
3. Analyze progress and body composition
4. Provide exercise form corrections and tips
5. Set and track goals
6. Motivate and support the user
7. Answer questions about supplements (evidence-based only)
8. Suggest recovery strategies

Always be:
- Encouraging but realistic
- Evidence-based (cite exercise science when relevant)
- Specific with numbers (sets, reps, calories, macros)
- Safety-conscious (always remind about proper form)
- Concise but thorough

Format responses with emojis for readability. Use bullet points for lists. Keep responses under 300 words unless a detailed plan is requested.`;

    const messages = [
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('AI chat error:', err);
    // Fallback response if API key not configured
    res.json({ 
      response: `💪 I'm FORGE AI, your personal fitness coach! To enable full AI capabilities, add your Anthropic API key to the backend .env file.\n\nFor now, I can tell you that consistency is the #1 key to fitness success. Whether your goal is muscle gain, fat loss, or improved endurance — show up every day, track your progress, and trust the process!\n\n**Quick tip:** Your first workout this week should focus on compound movements — squats, deadlifts, and push-ups work multiple muscle groups and give you the most bang for your buck. 🔥`
    });
  }
});

// POST /api/ai/analyze-photo - Analyze progress photo
router.post('/analyze-photo', auth, async (req, res) => {
  try {
    const { imageBase64, mediaType = 'image/jpeg', notes = '' } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            {
              type: 'text',
              text: `This is a fitness progress photo. Please analyze it and provide:
1. **Visible muscle development**: What muscle groups are visible and how developed do they appear?
2. **Body composition estimate**: Rough estimate of physique stage (e.g., lean, moderate, building phase)
3. **Strengths**: What physical attributes stand out positively?
4. **Areas for improvement**: Which muscle groups could benefit from more work?
5. **Progress suggestions**: 2-3 specific training tips based on what you see
6. **Motivational note**: An encouraging message

User notes: ${notes}

Keep the response professional, constructive, and motivating. Focus on fitness, not appearance criticism.`
            }
          ]
        }]
      })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    res.json({ analysis: data.content[0].text });
  } catch (err) {
    console.error('Photo analysis error:', err);
    res.json({ 
      analysis: `📸 **Photo Analysis**\n\nTo enable AI photo analysis, add your Anthropic API key to the backend configuration.\n\n**What this feature does:**\n- Analyzes muscle definition and development\n- Tracks visual progress over time\n- Provides targeted training recommendations\n- Offers encouraging milestone recognition\n\nGreat job taking a progress photo! Consistency in photo tracking is a proven method for staying motivated. 💪`
    });
  }
});

// POST /api/ai/generate-plan - Generate workout or diet plan
router.post('/generate-plan', auth, async (req, res) => {
  try {
    const { type, userProfile, preferences } = req.body;
    
    const prompt = type === 'workout' 
      ? `Create a detailed 7-day workout plan for:
Goals: ${userProfile.goal}
Fitness Level: ${userProfile.fitnessLevel}
Available Days: ${preferences.daysPerWeek || 4} days/week
Equipment: ${preferences.equipment || 'Full gym'}
Time per session: ${preferences.timePerSession || '60'} minutes

Format as JSON with structure:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "focus": "muscle group",
      "exercises": [
        {"name": "", "sets": 0, "reps": "0-0", "rest": "0s", "notes": ""}
      ],
      "duration": "X min"
    }
  ],
  "nutritionTips": ["tip1", "tip2"],
  "progressionStrategy": "how to progress over weeks"
}`
      : `Create a detailed 7-day meal plan for:
Goals: ${userProfile.goal}
Weight: ${userProfile.weight}kg
Height: ${userProfile.height}cm
Age: ${userProfile.age}
Dietary preferences: ${preferences.dietary || 'No restrictions'}
Daily calorie target: ${preferences.calories || 'Calculate based on goals'}

Format as JSON with daily meals including calories and macros.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    let planText = data.content[0].text;
    
    // Try to parse as JSON
    try {
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0]);
        return res.json({ plan, raw: planText });
      }
    } catch {}
    
    res.json({ plan: null, raw: planText });
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Could not generate plan. Check API key configuration.' });
  }
});

module.exports = router;
