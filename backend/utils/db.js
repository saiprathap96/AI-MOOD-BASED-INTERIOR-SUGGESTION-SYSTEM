const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'suggestions.db');

// Check if Supabase configuration is set
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
};

let dbInstance = null;

// Helper to open connection to SQLite
const getDb = async () => {
  if (!dbInstance) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    dbInstance = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
  }
  return dbInstance;
};

// Seed data to make the dashboard look populated and premium immediately
const seedSuggestions = [
  {
    id: "seed-1",
    roomType: "Living Room",
    colourPreference: "Warm Terracotta and Cream",
    budget: 120000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Teak Wood 3-Seater Sofa", material: "Solid Teak & Premium Fabric", price: 48000 },
        { name: "Classic Wooden Coffee Table", material: "Teak Wood", price: 15000 },
        { name: "Matching Teak Wood Armchair", material: "Solid Teak & Premium Fabric", price: 22000 },
        { name: "SVS Premium TV Unit", material: "Teak Veneer & MDF", price: 28000 }
      ],
      colourStyleNotes: "A rich blend of warm terracotta accents against a neutral cream canvas, anchored by the deep natural grains of polished teak wood. This creates a cozy, inviting, and traditional yet modern setting.",
      stylingTips: [
        "Position the 3-seater sofa against the primary wall and place the TV unit directly opposite.",
        "Add a textured cream rug under the coffee table to define the seating zone.",
        "Use warm-toned overhead lighting (2700K) to highlight the rich amber tones of the teak wood."
      ],
      budgetSummary: {
        totalCost: 113000,
        remaining: 7000,
        notes: "Excellent selection utilizing 94% of the budget. Remaining amount is perfect for decorative pillows or a small indoor plant."
      }
    },
    rating: 5,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: "seed-2",
    roomType: "Bedroom",
    colourPreference: "Olive Green and Gold",
    budget: 85000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Royal King Size Bed", material: "Sheesham Wood", price: 42000 },
        { name: "Dual Sheesham Bedside Tables", material: "Sheesham Wood", price: 12000 },
        { name: "SVS Elegance 3-Door Wardrobe", material: "Engineered Wood & Laminate", price: 26000 }
      ],
      colourStyleNotes: "Olive green walls combined with brass or gold-finished accents create an organic, luxurious bedroom escape. The deep tones of Sheesham wood ground the space with earthy warmth.",
      stylingTips: [
        "Place the bed centered on the olive green accent wall.",
        "Position the wardrobe in a corner to optimize floor space.",
        "Use brass table lamps on the bedside tables to incorporate the gold accent theme."
      ],
      budgetSummary: {
        totalCost: 80000,
        remaining: 5000,
        notes: "Comfortably within the ₹85,000 budget. The savings can cover bedding or matching curtains."
      }
    },
    rating: 4,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: "seed-3",
    roomType: "Office",
    colourPreference: "Midnight Blue and Walnut",
    budget: 50000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Executive Walnut Desk", material: "Walnut Veneer & Steel Frame", price: 22000 },
        { name: "Ergonomic Mesh Swivel Chair", material: "Nylon & Breathable Mesh", price: 12000 },
        { name: "Walnut 4-Tier Bookshelf", material: "Walnut Veneer & Steel Frame", price: 13000 }
      ],
      colourStyleNotes: "Midnight blue creates a high-focus environment that minimizes distractions. Walnut furniture provides a warm, sophisticated professional look.",
      stylingTips: [
        "Place the desk near a window to receive natural light but avoid screen glare.",
        "Use the bookshelf to organize folders and display personal achievements.",
        "Add a small table lamp with a soft white LED on the desk for late-evening work."
      ],
      budgetSummary: {
        totalCost: 47000,
        remaining: 3000,
        notes: "Under budget, allowing for organizer trays or cable management accessories."
      }
    },
    rating: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: "seed-4",
    roomType: "Dining Room",
    colourPreference: "Teal and Natural Oak",
    budget: 150000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Heritage 6-Seater Dining Table", material: "Teak Wood", price: 65000 },
        { name: "SVS Cushioned Dining Chairs (Set of 6)", material: "Teak Wood & Velvet Fabric", price: 48000 },
        { name: "SVS Premium Buffet Sideboard", material: "Teak Veneer & MDF", price: 32000 }
      ],
      colourStyleNotes: "Vibrant teal upholstery brings energy and style to family meals, beautifully contrasted by natural oak or polished teak wood grains.",
      stylingTips: [
        "Hang a warm-toned chandelier directly above the center of the dining table.",
        "Use the sideboard buffet to store crockery and serve food during gatherings.",
        "Keep the tabletop simple with a runners matching the teal chairs."
      ],
      budgetSummary: {
        totalCost: 145000,
        remaining: 5000,
        notes: "Utilized ₹145,000. Under budget by ₹5,000 which is perfect for dining linen."
      }
    },
    rating: 4,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },
  {
    id: "seed-5",
    roomType: "Kitchen",
    colourPreference: "Charcoal Grey and Rose Gold",
    budget: 220000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Modular Island Cabinet", material: "BWP Plywood & Acrylic Finish", price: 95000 },
        { name: "Rose Gold Accent Bar Stools (Set of 3)", material: "Steel with Rose Gold plating", price: 24000 },
        { name: "SVS High-Capacity Pantry Unit", material: "BWP Plywood & Laminate", price: 85000 }
      ],
      colourStyleNotes: "Modern industrial luxury. Deep charcoal grey cabinet doors offset by gleaming rose gold handles and bar stools create an ultra-modern aesthetic.",
      stylingTips: [
        "Line the 3 bar stools along the kitchen island for casual dining.",
        "Ensure task lighting is installed under the overhead cabinets.",
        "Incorporate rose-gold utensil hangers or canisters on open shelves."
      ],
      budgetSummary: {
        totalCost: 204000,
        remaining: 16000,
        notes: "Under budget by ₹16,000. Perfect for premium sink fixtures or storage trays."
      }
    },
    rating: 5,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: "seed-6",
    roomType: "Living Room",
    colourPreference: "Charcoal and Cream",
    budget: 250000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Luxury Sectional L-Shape Sofa", material: "Solid Hardwood & Premium Velvet", price: 120000 },
        { name: "SVS Gold Accent Marble Coffee Table", material: "Iron Frame & Italian Marble Top", price: 35000 },
        { name: "SVS Modern TV Console Unit", material: "Teak Veneer & High Gloss MDF", price: 45000 },
        { name: "Matching Velvet Accent Chairs (Set of 2)", material: "Velvet & Gold-plated legs", price: 38000 }
      ],
      colourStyleNotes: "A dramatic charcoal accent wall juxtaposed with plush cream upholstery and rich gold details. This creates a high-contrast luxury living room vibe.",
      stylingTips: [
        "Float the sectional sofa in the center of the room if space permits.",
        "Accessorize the coffee table with hardcover design books and a gold candle holder.",
        "Maintain neutral cream drapes to prevent the dark charcoal from feeling heavy."
      ],
      budgetSummary: {
        totalCost: 238000,
        remaining: 12000,
        notes: "Total cost is ₹238,000. Remaining ₹12,000 is excellent for accent rug and art prints."
      }
    },
    rating: 4,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  },
  {
    id: "seed-7",
    roomType: "Bedroom",
    colourPreference: "Blush Pink and Grey",
    budget: 110000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Tufted Queen Size Bed", material: "MDF & Soft Velvet Fabric", price: 45000 },
        { name: "Elegance 2-Door Wardrobe", material: "Engineered Wood", price: 28000 },
        { name: "SVS Velvet Dressing Table with Mirror", material: "MDF & Glass", price: 22000 },
        { name: "Plush Velvet Bedside Benches", material: "Teak Legs & Velvet", price: 12000 }
      ],
      colourStyleNotes: "Soft blush pink brings a calming, romantic ambience, balanced by sleek cool-grey furniture elements and neutral walls.",
      stylingTips: [
        "Use grey sheets and pink accent pillows to pull the color scheme together.",
        "Install warm pendant lights on either side of the bed for a cozy feel.",
        "Keep the dressing table clutter-free with small storage boxes."
      ],
      budgetSummary: {
        totalCost: 107000,
        remaining: 3000,
        notes: "Very close to the budget of ₹110,000. Excellent utilization of space and value."
      }
    },
    rating: 3,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: "seed-8",
    roomType: "Office",
    colourPreference: "Sage Green and Oak",
    budget: 75000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Organic Oak Study Desk", material: "Solid Oak Wood", price: 32000 },
        { name: "Premium Mesh Task Chair", material: "Nylon & Fabric", price: 15000 },
        { name: "SVS 3-Tier Storage Cabinet", material: "Oak Veneer", price: 18000 },
        { name: "Oak wood floating shelves (Set of 3)", material: "Solid Oak", price: 6000 }
      ],
      colourStyleNotes: "Sage green is scientifically proven to reduce eye strain. Oak wood coordinates naturally for a Scandinavian, light, and airy workplace.",
      stylingTips: [
        "Place the floating shelves above the desk for books and small plants.",
        "Position the storage cabinet within arm's reach of your chair.",
        "Add a small green plant (like pothos) to drape down the shelves."
      ],
      budgetSummary: {
        totalCost: 71000,
        remaining: 4000,
        notes: "Comfortably within the ₹75,000 budget. Perfect for a desk pad and organizer."
      }
    },
    rating: 5,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
  },
  {
    id: "seed-9",
    roomType: "Living Room",
    colourPreference: "Beige and Dark Walnut",
    budget: 90000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Compact 3-Seater Sofa", material: "Hardwood & Linen Fabric", price: 38000 },
        { name: "SVS Mid-Century Coffee Table", material: "Solid Walnut Wood", price: 16000 },
        { name: "SVS Retro Walnut TV Console", material: "Walnut Veneer", price: 24000 },
        { name: "Matching Walnut Accent Side Table", material: "Solid Walnut Wood", price: 8000 }
      ],
      colourStyleNotes: "A classic warm palette. Creamy beige linen fabric on seating contrasts beautifully against the rich, chocolatey tones of walnut wood.",
      stylingTips: [
        "Ideal for compact living spaces. Position the TV console flat against the wall.",
        "Use a beige jute rug to add organic texture to the floor.",
        "Incorporate neutral throw blankets to layer textures."
      ],
      budgetSummary: {
        totalCost: 86000,
        remaining: 4000,
        notes: "Under budget by ₹4,000, leaving room for lighting or throw cushions."
      }
    },
    rating: 4,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 days ago
  },
  {
    id: "seed-10",
    roomType: "Kitchen",
    colourPreference: "Navy Blue and White Marble",
    budget: 350000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Luxury Modular Kitchen Cabinets", material: "BWP Plywood & Matte PU Finish", price: 195000 },
        { name: "White Italian Quartz Countertop", material: "Quartz", price: 75000 },
        { name: "SVS Luxury Kitchen Island Base", material: "PU Finished Plywood", price: 48000 },
        { name: "Elegant Leather Counter Stools (Set of 4)", material: "Leather & Metal Frame", price: 24000 }
      ],
      colourStyleNotes: "Sophisticated nautical luxury. Deep navy blue base cabinets ground the room, while bright white quartz and upper cabinets keep the space bright.",
      stylingTips: [
        "Incorporate under-cabinet LED strip lights to highlight the quartz vein detail.",
        "Use gold handles on the navy cabinets for a premium metallic accent.",
        "Arrange the 4 leather stools neatly under the island overhang."
      ],
      budgetSummary: {
        totalCost: 342000,
        remaining: 8000,
        notes: "Under budget by ₹8,000. Suggest using the remainder for cabinet organizers."
      }
    },
    rating: 5,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  },
  {
    id: "seed-11",
    roomType: "Dining Room",
    colourPreference: "Mustard Yellow and Dark Grey",
    budget: 95000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Urban 4-Seater Dining Table", material: "Sheesham Wood", price: 42000 },
        { name: "Mustard Velvet Dining Chairs (Set of 4)", material: "Sheesham & Velvet", price: 34000 },
        { name: "SVS Sleek Credenza Cabinet", material: "Engineered Wood & Laminate", price: 16000 }
      ],
      colourStyleNotes: "Mustard yellow velvet chairs inject energy and pop into the dining room, balanced by dark charcoal or grey walls and natural wood table.",
      stylingTips: [
        "Hang a modern metal geometric pendant lamp over the dining table.",
        "Keep the dining table clear of heavy centerpieces to make the space feel open.",
        "Use the credenza cabinet to store dinnerware and napkins."
      ],
      budgetSummary: {
        totalCost: 92000,
        remaining: 3000,
        notes: "Utilized ₹92,000. Under budget by ₹3,000 which is perfect for table placement mats."
      }
    },
    rating: 4,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() // 11 days ago
  },
  {
    id: "seed-12",
    roomType: "Bedroom",
    colourPreference: "Dusty Rose and Walnut",
    budget: 180000,
    recommendation: {
      furnitureSet: [
        { name: "SVS Majestic Walnut King Bed", material: "Solid Walnut Wood", price: 78000 },
        { name: "SVS Dual Walnut Bedside Drawers", material: "Solid Walnut Wood", price: 22000 },
        { name: "SVS Premium 4-Door Wardrobe", material: "Walnut Veneer & Mirror Panel", price: 62000 },
        { name: "Upholstered Dressing Stool", material: "Solid Walnut & Fabric", price: 8000 }
      ],
      colourStyleNotes: "Deep, chocolatey walnut wood provides a structural, heavy baseline, beautifully softened by dusty rose bed linen and accent wall paints.",
      stylingTips: [
        "Center the wardrobe on the sidewall to give the bed clearance.",
        "Arrange bed pillows in alternating dusty rose and white colors.",
        "Place a soft, neutral-colored rug half-under the bed."
      ],
      budgetSummary: {
        totalCost: 170000,
        remaining: 10000,
        notes: "Under budget by ₹10,000. This is excellent for adding curtains and light fixtures."
      }
    },
    rating: 5,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
  }
];

// Database Methods
const db = {
  // Initialize Database
  init: async () => {
    const database = await getDb();
    
    // Create Table suggestions with schema matching the requirements
    await database.exec(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id TEXT PRIMARY KEY,
        room_type TEXT NOT NULL,
        colour_preference TEXT NOT NULL,
        budget INTEGER NOT NULL,
        recommendation TEXT NOT NULL,
        rating INTEGER,
        created_at TEXT NOT NULL
      )
    `);
    console.log('SQLite database connected and suggestions table verified.');
  },

  // Save suggestion
  saveSuggestion: async (roomType, colourPreference, budget, recommendation) => {
    if (isSupabaseConfigured()) {
      try {
        const url = `${process.env.SUPABASE_URL}/rest/v1/suggestions`;
        const headers = {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        };
        const body = JSON.stringify({
          room_type: roomType,
          colour_preference: colourPreference,
          budget: Number(budget),
          recommendation: recommendation,
          created_at: new Date().toISOString()
        });

        const response = await fetch(url, { method: 'POST', headers, body });
        if (response.ok) {
          const result = await response.json();
          const savedData = result[0];
          return {
            id: savedData.id,
            roomType: savedData.room_type,
            colourPreference: savedData.colour_preference,
            budget: savedData.budget,
            recommendation: savedData.recommendation,
            rating: savedData.rating,
            createdAt: savedData.created_at
          };
        } else {
          console.error('Supabase save error:', await response.text());
        }
      } catch (err) {
        console.error('Supabase connection failed, falling back to SQLite:', err);
      }
    }

    // SQLite fallback / default
    const database = await getDb();
    const newId = uuidv4();
    const createdAt = new Date().toISOString();

    await database.run(`
      INSERT INTO suggestions (id, room_type, colour_preference, budget, recommendation, rating, created_at)
      VALUES (?, ?, ?, ?, ?, NULL, ?)
    `, [
      newId,
      roomType,
      colourPreference,
      Number(budget),
      JSON.stringify(recommendation),
      createdAt
    ]);

    return {
      id: newId,
      roomType,
      colourPreference,
      budget: Number(budget),
      recommendation,
      rating: null,
      createdAt
    };
  },

  // Get all suggestions (History)
  getAllSuggestions: async () => {
    if (isSupabaseConfigured()) {
      try {
        const url = `${process.env.SUPABASE_URL}/rest/v1/suggestions?order=created_at.desc`;
        const headers = {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
        };

        const response = await fetch(url, { method: 'GET', headers });
        if (response.ok) {
          const data = await response.json();
          return data.map(item => ({
            id: item.id,
            roomType: item.room_type,
            colourPreference: item.colour_preference,
            budget: item.budget,
            recommendation: item.recommendation,
            rating: item.rating,
            createdAt: item.created_at
          }));
        } else {
          console.error('Supabase fetch error:', await response.text());
        }
      } catch (err) {
        console.error('Supabase connection failed, falling back to SQLite:', err);
      }
    }

    // SQLite fallback
    const database = await getDb();
    const rows = await database.all('SELECT * FROM suggestions ORDER BY created_at DESC');
    return rows.map(row => ({
      id: row.id,
      roomType: row.room_type,
      colourPreference: row.colour_preference,
      budget: Number(row.budget),
      recommendation: JSON.parse(row.recommendation),
      rating: row.rating,
      createdAt: row.created_at
    }));
  },

  // Delete suggestion
  deleteSuggestion: async (id) => {
    if (isSupabaseConfigured()) {
      try {
        const url = `${process.env.SUPABASE_URL}/rest/v1/suggestions?id=eq.${id}`;
        const headers = {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
        };

        const response = await fetch(url, { method: 'DELETE', headers });
        if (response.ok) {
          return true;
        } else {
          console.error('Supabase delete error:', await response.text());
        }
      } catch (err) {
        console.error('Supabase connection failed, falling back to SQLite:', err);
      }
    }

    // SQLite fallback
    const database = await getDb();
    const result = await database.run('DELETE FROM suggestions WHERE id = ?', [id]);
    return result.changes > 0;
  },

  // Update suggestion quality rating (1-5)
  rateSuggestion: async (id, rating) => {
    if (isSupabaseConfigured()) {
      try {
        const url = `${process.env.SUPABASE_URL}/rest/v1/suggestions?id=eq.${id}`;
        const headers = {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        };
        const body = JSON.stringify({ rating: Number(rating) });

        const response = await fetch(url, { method: 'PATCH', headers, body });
        if (response.ok) {
          const result = await response.json();
          const item = result[0];
          return {
            id: item.id,
            roomType: item.room_type,
            colourPreference: item.colour_preference,
            budget: item.budget,
            recommendation: item.recommendation,
            rating: item.rating,
            createdAt: item.created_at
          };
        } else {
          console.error('Supabase rating update error:', await response.text());
        }
      } catch (err) {
        console.error('Supabase connection failed, falling back to SQLite:', err);
      }
    }

    // SQLite fallback
    const database = await getDb();
    const result = await database.run('UPDATE suggestions SET rating = ? WHERE id = ?', [Number(rating), id]);
    if (result.changes > 0) {
      const row = await database.get('SELECT * FROM suggestions WHERE id = ?', [id]);
      if (row) {
        return {
          id: row.id,
          roomType: row.room_type,
          colourPreference: row.colour_preference,
          budget: Number(row.budget),
          recommendation: JSON.parse(row.recommendation),
          rating: row.rating,
          createdAt: row.created_at
        };
      }
    }
    return null;
  },

  // Get Analytics summary
  getAnalytics: async () => {
    let suggestions = [];
    if (isSupabaseConfigured()) {
      try {
        const url = `${process.env.SUPABASE_URL}/rest/v1/suggestions`;
        const headers = {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
        };

        const response = await fetch(url, { method: 'GET', headers });
        if (response.ok) {
          const data = await response.json();
          suggestions = data.map(item => ({
            id: item.id,
            roomType: item.room_type,
            colourPreference: item.colour_preference,
            budget: item.budget,
            recommendation: item.recommendation,
            rating: item.rating,
            createdAt: item.created_at
          }));
        } else {
          console.error('Supabase analytics fetch error:', await response.text());
          suggestions = await db.getAllSuggestions();
        }
      } catch (err) {
        console.error('Supabase connection failed, falling back to SQLite:', err);
        suggestions = await db.getAllSuggestions();
      }
    } else {
      suggestions = await db.getAllSuggestions();
    }

    // Perform analysis
    const totalSuggestions = suggestions.length;
    
    // Average quality rating
    const ratedSuggestions = suggestions.filter(item => item.rating !== null && item.rating > 0);
    const averageRating = ratedSuggestions.length > 0
      ? Number((ratedSuggestions.reduce((sum, item) => sum + item.rating, 0) / ratedSuggestions.length).toFixed(1))
      : 0.0;

    // Most popular room types (bar chart data)
    const roomTypeCounts = {};
    suggestions.forEach(item => {
      roomTypeCounts[item.roomType] = (roomTypeCounts[item.roomType] || 0) + 1;
    });
    const popularRoomTypes = Object.keys(roomTypeCounts).map(type => ({
      name: type,
      count: roomTypeCounts[type]
    })).sort((a, b) => b.count - a.count);

    // Budget range distribution (pie chart data)
    // Ranges: < 50k, 50k - 100k, 100k - 200k, 200k+
    const budgetRanges = {
      'Budget (< ₹50k)': 0,
      'Mid-Range (₹50k - ₹100k)': 0,
      'Premium (₹100k - ₹200k)': 0,
      'Luxury (₹200k+)': 0
    };
    suggestions.forEach(item => {
      const budget = item.budget;
      if (budget < 50000) {
        budgetRanges['Budget (< ₹50k)']++;
      } else if (budget <= 100000) {
        budgetRanges['Mid-Range (₹50k - ₹100k)']++;
      } else if (budget <= 200000) {
        budgetRanges['Premium (₹100k - ₹200k)']++;
      } else {
        budgetRanges['Luxury (₹200k+)']++;
      }
    });
    const budgetDistribution = Object.keys(budgetRanges).map(range => ({
      label: range,
      value: budgetRanges[range]
    }));

    // Daily usage trend (last 7 days line chart data)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dateLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); // DD MMM

      // Count suggestions on this day
      const count = suggestions.filter(item => {
        const itemDateString = item.createdAt.split('T')[0];
        return itemDateString === dateString;
      }).length;

      dailyTrend.push({
        date: dateString,
        label: dateLabel,
        count: count
      });
    }

    return {
      totalSuggestions,
      averageRating,
      popularRoomTypes,
      budgetDistribution,
      dailyTrend
    };
  }
};

module.exports = db;
