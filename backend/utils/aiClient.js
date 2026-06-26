// Input Sanitizer Helper
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[$\{\}]/g, '') // Remove symbols that could interfere with interpolation
    .trim()
    .substring(0, 200);      // Limit length to prevent buffer bloating
};

// Generates extremely realistic dynamic content for Demo Mode
const getMockSuggestion = (roomType, colourPreference, budget) => {
  const parsedBudget = Number(budget) || 100000;
  
  // List of possible items by room type with price factors
  const catalog = {
    "Living Room": [
      { name: "SVS Teak Wood Sofa Set", material: "Solid Teak Wood & Premium Fabric", priceFactor: 0.4 },
      { name: "SVS Premium Coffee Table", material: "Sheesham Wood with Glass Inlay", priceFactor: 0.15 },
      { name: "SVS Luxury Accent Lounge Chair", material: "Teak Wood & Upholstered Velvet", priceFactor: 0.2 },
      { name: "SVS Elegance TV Media Unit", material: "Teak Veneer & High-Quality MDF", priceFactor: 0.2 }
    ],
    "Bedroom": [
      { name: "SVS Classic Poster Bed Frame", material: "Solid Teak Wood", priceFactor: 0.45 },
      { name: "SVS Modern Bedside Lockers (Pair)", material: "Sheesham Wood", priceFactor: 0.15 },
      { name: "SVS Royal Wardrobe", material: "Teak Plywood & Laminate Finish", priceFactor: 0.3 },
      { name: "SVS Comfort Dressing Mirror Table", material: "Solid Wood & Mirror Glass", priceFactor: 0.1 }
    ],
    "Office": [
      { name: "SVS Solid Walnut Study/Work Desk", material: "Walnut Wood & Steel Base", priceFactor: 0.4 },
      { name: "SVS Ergonomic Spine-Support Chair", material: "Pneumatic Lift & Breathable Mesh", priceFactor: 0.25 },
      { name: "SVS Library Bookshelf Cabinet", material: "Walnut Veneer & Glass Doors", priceFactor: 0.25 },
      { name: "SVS Mobile Filing Cabinet drawers", material: "Engineered Wood", priceFactor: 0.1 }
    ],
    "Dining Room": [
      { name: "SVS Royal Dining Table", material: "Solid Teak Wood Top", priceFactor: 0.45 },
      { name: "SVS Matching Dining Chairs (Set of 6)", material: "Solid Teak & Cushioned Seat", priceFactor: 0.35 },
      { name: "SVS Dining Room Crockery Console", material: "Teak Wood Veneer", priceFactor: 0.2 }
    ],
    "Kitchen": [
      { name: "SVS Modular Counter Storage Set", material: "Marine Grade Plywood & Acrylic Finish", priceFactor: 0.5 },
      { name: "SVS Tall Kitchen Pantry Cabinet", material: "Marine Grade Plywood & Laminate", priceFactor: 0.35 },
      { name: "SVS Swivel Counter Breakfast Stools (Set of 2)", material: "Steel frame & Leather upholstery", priceFactor: 0.15 }
    ]
  };

  const selectedSet = catalog[roomType] || catalog["Living Room"];
  
  // Distribute the budget among the furniture pieces
  let totalCost = 0;
  const furnitureSet = selectedSet.map((item, idx) => {
    // For the last item, take the balance to hit target factor, or scale exactly
    let price = Math.round(parsedBudget * item.priceFactor);
    // Round to nearest hundred
    price = Math.round(price / 100) * 100;
    
    // Safety guard
    if (price < 3000) price = 3000;
    
    totalCost += price;
    return {
      name: item.name,
      material: item.material,
      price: price
    };
  });

  // If totalCost exceeds budget, scale down
  if (totalCost > parsedBudget) {
    const scaleFactor = (parsedBudget * 0.95) / totalCost;
    totalCost = 0;
    furnitureSet.forEach(item => {
      item.price = Math.round((item.price * scaleFactor) / 100) * 100;
      if (item.price < 2000) item.price = 2000;
      totalCost += item.price;
    });
  }

  const remaining = parsedBudget - totalCost;
  const colorText = colourPreference || "Earth tones";

  return {
    furnitureSet,
    colourStyleNotes: `The design utilizes your preferred ${colorText} color scheme to elevate the natural charm of the solid wooden pieces. For a ${roomType}, we focus on balancing functional storage and comfortable seating. The warm tones of teak or sheesham wood interact perfectly with ${colorText} paint accents, resulting in an upscale, personalized environment designed specifically by Sri Venkata Sai Furniture Works.`,
    stylingTips: [
      `Anchor the room by making the ${furnitureSet[0].name} the focal point of the layout.`,
      `Incorporate secondary light sources (like accent floor lamps or shelf LED strips) to enhance the warm hues of the ${colorText} palette.`,
      `Accessorize using soft cotton or linen textiles that echo the natural materials of the furniture.`
    ],
    budgetSummary: {
      totalCost,
      remaining,
      notes: `We successfully created a complete ${roomType} suggestion utilizing ₹${totalCost.toLocaleString('en-IN')} out of your ₹${parsedBudget.toLocaleString('en-IN')} budget, leaving a balance of ₹${remaining.toLocaleString('en-IN')} which is perfect for transport, assembly, or matching curtains.`
    }
  };
};

// Main Generation Function
const generateSuggestion = async (roomType, colourPreference, budget) => {
  // 1. Sanitize
  const cleanRoom = sanitizeInput(roomType) || 'Living Room';
  const cleanColour = sanitizeInput(colourPreference) || 'Warm Neutral';
  const cleanBudget = Number(budget) || 100000;

  // 2. Detect API Keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasOpenAI && !hasAnthropic && !hasGemini) {
    // Demo Mock Mode
    console.log(`Running in Demo Mock Mode for: Room: ${cleanRoom}, Colour: ${cleanColour}, Budget: ${cleanBudget}`);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockSuggestion(cleanRoom, cleanColour, cleanBudget);
  }

  const systemPrompt = `You are an expert interior designer and furniture consultant for Sri Venkata Sai Furniture Works. Suggest a complete complementary furniture set based on customer inputs.
Respond ONLY in structured JSON format matching this exact schema:
{
  "furnitureSet": [
    {
      "name": "Exact Name of Furniture (e.g. SVS Teak Wood 3-Seater Sofa)",
      "material": "Material used (e.g. Solid Teak Wood & Velvet)",
      "price": 45000 // Integer price in INR (no decimals, no currency symbol, no commas)
    }
  ],
  "colourStyleNotes": "Brief paragraph describing how the colour preference works with the recommended pieces and materials",
  "stylingTips": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3..."
  ],
  "budgetSummary": {
    "totalCost": 95000, // Total cost of all items in set (integer, no symbols)
    "remaining": 5000, // Remaining budget (budget - totalCost)
    "notes": "A brief sentence summarizing the budget usage"
  }
}
CRITICAL RULES:
- The totalCost must not exceed the customer's budget. Choose appropriate materials (e.g. Teak wood for high budget, Engineered wood / MDF for low budget) and set sizes to fit the budget.
- The furniture must form a complete room set.
- Return ONLY the JSON object. Do not include markdown code blocks, explanatory text, or greetings.`;

  const userPrompt = `Room Type: ${cleanRoom}, Colour Preference: ${cleanColour}, Budget: ₹${cleanBudget}. Suggest the best complete furniture set.`;

  // Try API calls in order of available keys: Gemini -> OpenAI -> Anthropic
  try {
    if (hasGemini) {
      console.log('Generating suggestion using Gemini API...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser: ${userPrompt}` }]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const jsonRes = await response.json();
      const text = jsonRes.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    }

    if (hasOpenAI) {
      console.log('Generating suggestion using OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}: ${await response.text()}`);
      }

      const jsonRes = await response.json();
      const text = jsonRes.choices[0].message.content;
      return JSON.parse(text);
    }

    if (hasAnthropic) {
      console.log('Generating suggestion using Anthropic Claude API...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API returned status ${response.status}: ${await response.text()}`);
      }

      const jsonRes = await response.json();
      const text = jsonRes.content[0].text;
      
      // Extract JSON if model wrapped it in markdown codeblocks
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7, cleanText.length - 3).trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3, cleanText.length - 3).trim();
      }
      
      return JSON.parse(cleanText);
    }

  } catch (error) {
    console.error('AI generation failed, falling back to mock generator:', error);
    // If external AI call fails due to credentials or rate-limiting, gracefully return a mock suggestion
    return getMockSuggestion(cleanRoom, cleanColour, cleanBudget);
  }
};

module.exports = {
  generateSuggestion
};
