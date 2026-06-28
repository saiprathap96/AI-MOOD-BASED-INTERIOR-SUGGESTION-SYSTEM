import os
import json
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///svs_furniture.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==========================================
# Database Models
# ==========================================

class InputRecord(db.Model):
    __tablename__ = 'inputs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    room_type = db.Column(db.String(50), nullable=False)
    color_palette = db.Column(db.String(50), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    outputs = db.relationship('AIOutputRecord', backref='input_ref', cascade='all, delete-orphan')

class AIOutputRecord(db.Model):
    __tablename__ = 'ai_outputs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_id = db.Column(db.Integer, db.ForeignKey('inputs.id', ondelete='CASCADE'), nullable=False)
    furniture_set_data = db.Column(db.Text, nullable=False) # JSON text containing array of items
    styling_notes = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    ratings = db.relationship('RatingRecord', backref='output_ref', cascade='all, delete-orphan')

class RatingRecord(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    output_id = db.Column(db.Integer, db.ForeignKey('ai_outputs.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class HistoryRecord(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_id = db.Column(db.Integer, db.ForeignKey('inputs.id', ondelete='CASCADE'), nullable=False)
    output_id = db.Column(db.Integer, db.ForeignKey('ai_outputs.id', ondelete='CASCADE'), nullable=False)
    rating_id = db.Column(db.Integer, db.ForeignKey('ratings.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    input_rel = db.relationship('InputRecord', foreign_keys=[input_id])
    output_rel = db.relationship('AIOutputRecord', foreign_keys=[output_id])
    rating_rel = db.relationship('RatingRecord', foreign_keys=[rating_id])

# Initialize the Database
with app.app_context():
    db.create_all()

# ==========================================
# AI Prompts & Service Logic
# ==========================================

SYSTEM_PROMPT = """You are an AI interior design consultant for "Sri Venkata Sai Furniture Works".
Your goal is to increase average order values by dynamically suggesting complete, cohesive room furniture sets instead of individual pieces.
You must recommend a full matching set of furniture items that coordinates beautifully under the specified room type and color palette.
The sum of estimated prices of the items in the set should be close to but must NOT exceed the specified budget constraint.

You MUST return your response as a single, raw JSON object (do not wrap it in markdown backticks or formatting like ```json ... ```).
The JSON object must follow this EXACT structure:
{
  "furniture_set": [
    {
      "name": "Name of the furniture piece (e.g., Solid Teak Dining Table)",
      "category": "Category of the piece (e.g., Table, Seating, Storage, Decor)",
      "price": 1200.00,
      "description": "Detailed description of the piece, detailing materials, dimensions, and visual coordination.",
      "dimensions": "Width x Depth x Height (e.g., 72W x 36D x 30H)"
    }
  ],
  "styling_notes": "A cohesive design note describing the room layout, lighting placement, textiles, and accessories to coordinate the set.",
  "total_set_cost": 1200.00
}
"""

USER_PROMPT_TEMPLATE = """Generate a furniture set suggestion mood board for:
- Room Type: {room_type}
- Color Palette Preference: {color_palette}
- Budget Constraint: {budget} (Suggest a complete set whose total price fits within this limit)
"""

def get_mock_furniture_set(room_type, color_palette, budget):
    budget = float(budget)
    materials_map = {
        "Warm Autumn": "Premium Teak Wood with terracotta upholstery",
        "Ocean Breeze": "Oak wood with navy blue and seafoam green fabric",
        "Forest Sanctuary": "Dark walnut wood with sage green velvet cushions",
        "Minimalist Monochrome": "Black steel frames and white leather",
        "Sunset Glow": "Rosewood with dusty rose linen and gold brass accents"
    }
    
    material = materials_map.get(color_palette, "Premium Solid Wood")
    items = []
    
    if room_type == "Living Room":
        sofa_price = round(budget * 0.48, 2)
        coffee_table_price = round(budget * 0.16, 2)
        accent_chair_price = round(budget * 0.20, 2)
        media_console_price = round(budget * 0.12, 2)
        
        items = [
            {
                "name": f"SVS Signature {color_palette} 3-Seater Sofa",
                "category": "Seating",
                "price": sofa_price,
                "description": f"Crafted from seasoned timber frame, upholstered in luxurious {color_palette.lower()}-toned fabric. Built with high-density foam for premium seating comfort.",
                "dimensions": "86\"W x 36\"D x 34\"H"
            },
            {
                "name": f"SVS Live-Edge Oval Coffee Table",
                "category": "Tables",
                "price": coffee_table_price,
                "description": f"A beautiful live-edge tabletop styled in seasoned wood, pairing excellently with the {color_palette.lower()} mood. Includes a powder-coated support stand.",
                "dimensions": "48\"W x 24\"D x 18\"H"
            },
            {
                "name": f"SVS Accent Lounge Chair",
                "category": "Seating",
                "price": accent_chair_price,
                "description": f"A single seating accent chair upholstered in a contrasting hue matching the {color_palette.lower()} palette, with tapered legs.",
                "dimensions": "32\"W x 30\"D x 38\"H"
            },
            {
                "name": f"SVS Solid Timber Media Console",
                "category": "Storage",
                "price": media_console_price,
                "description": f"Spacious media console with soft-closing drawers and open shelving for media devices, styled in matching wood textures.",
                "dimensions": "60\"W x 18\"D x 22\"H"
            }
        ]
    elif room_type == "Bedroom":
        bed_price = round(budget * 0.50, 2)
        dresser_price = round(budget * 0.25, 2)
        nightstands_price = round(budget * 0.15, 2)
        bench_price = round(budget * 0.08, 2)
        
        items = [
            {
                "name": f"SVS Royal {color_palette} King Bed Frame",
                "category": "Beds",
                "price": bed_price,
                "description": f"Stunning king bed frame with an upholstered headboard in {color_palette.lower()} fabric, featuring solid wood side railings and reinforced structural support.",
                "dimensions": "82\"W x 88\"D x 52\"H"
            },
            {
                "name": f"SVS 6-Drawer Chest Dresser",
                "category": "Storage",
                "price": dresser_price,
                "description": f"Elegant, spacious vertical dresser crafted in matching {material.split(' with ')[0]} to keep your bedroom organized.",
                "dimensions": "36\"W x 18\"D x 48\"H"
            },
            {
                "name": f"SVS Nightstand Pair",
                "category": "Storage",
                "price": nightstands_price,
                "description": f"A matching set of two bedside drawers with brass drawer pulls and open shelves, coordinating with the bed frame.",
                "dimensions": "22\"W x 16\"D x 24\"H"
            },
            {
                "name": f"SVS Cushioned Bed-End Bench",
                "category": "Seating",
                "price": bench_price,
                "description": f"Placed at the end of the bed, this bench provides accent seating with matching cushion padding.",
                "dimensions": "48\"W x 16\"D x 18\"H"
            }
        ]
    elif room_type == "Dining Room":
        dining_table_price = round(budget * 0.40, 2)
        chairs_price = round(budget * 0.35, 2)
        credenza_price = round(budget * 0.20, 2)
        
        items = [
            {
                "name": f"SVS Solid Timber 6-Seater Dining Table",
                "category": "Tables",
                "price": dining_table_price,
                "description": f"Heavy-duty rectangular dining table designed for family gatherings, highlighting natural wood grains polished in theme with {color_palette}.",
                "dimensions": "72\"W x 36\"D x 30\"H"
            },
            {
                "name": f"SVS Cushioned Dining Chairs (Set of 6)",
                "category": "Seating",
                "price": chairs_price,
                "description": f"Six ergonomic high-back dining chairs, padded with {color_palette.lower()}-colored fabrics to provide cozy dining sessions.",
                "dimensions": "18\"W x 20\"D x 38\"H each"
            },
            {
                "name": f"SVS Handcrafted Sideboard Credenza",
                "category": "Storage",
                "price": credenza_price,
                "description": f"Buffet unit with geometric door carvings, perfect for storing china and dinnerware.",
                "dimensions": "64\"W x 18\"D x 32\"H"
            }
        ]
    elif room_type == "Home Office":
        desk_price = round(budget * 0.45, 2)
        office_chair_price = round(budget * 0.25, 2)
        bookshelf_price = round(budget * 0.25, 2)
        
        items = [
            {
                "name": f"SVS Executive Study Desk",
                "category": "Tables",
                "price": desk_price,
                "description": f"Spacious wooden writing desk with built-in cable management and three side drawers, matching the {color_palette} vibe.",
                "dimensions": "60\"W x 28\"D x 30\"H"
            },
            {
                "name": f"SVS Ergonomic Leather Swivel Chair",
                "category": "Seating",
                "price": office_chair_price,
                "description": f"High-back office desk chair with adjustable lumbar support, 3D armrests, and premium upholstery coordinating with the palette.",
                "dimensions": "26\"W x 26\"D x 42\"-46\"H"
            },
            {
                "name": f"SVS Accent Shelving Bookshelf",
                "category": "Storage",
                "price": bookshelf_price,
                "description": f"Tall open shelf bookcase utilizing a wood-metal hybrid construction to store reference books and display design objects.",
                "dimensions": "32\"W x 12\"D x 72\"H"
            }
        ]
    else: # Default/Guest Room
        bed_price = round(budget * 0.45, 2)
        side_table_price = round(budget * 0.15, 2)
        armchair_price = round(budget * 0.25, 2)
        luggage_rack_price = round(budget * 0.10, 2)
        
        items = [
            {
                "name": f"SVS Cozy Queen Bed Frame",
                "category": "Beds",
                "price": bed_price,
                "description": f"Minimalist queen bed frame built with a sturdy slatted support system, styled in {material.split(' with ')[0]}.",
                "dimensions": "64\"W x 84\"D x 48\"H"
            },
            {
                "name": f"SVS Single Drawer Bedside Drawer",
                "category": "Storage",
                "price": side_table_price,
                "description": f"Compact bedside stand featuring a single drawer and storage cabinet, styled to suit {color_palette}.",
                "dimensions": "20\"W x 16\"D x 24\"H"
            },
            {
                "name": f"SVS Classic Comfort Armchair",
                "category": "Seating",
                "price": armchair_price,
                "description": f"Comfortable reading chair positioned by the window, upholstered in cohesive {color_palette.lower()}-toned fabric.",
                "dimensions": "30\"W x 32\"D x 36\"H"
            },
            {
                "name": f"SVS Foldable Wooden Luggage Rack",
                "category": "Storage",
                "price": luggage_rack_price,
                "description": f"Solid wood folding stand with heavy-duty fabric straps, facilitating guest luggage packing.",
                "dimensions": "26\"W x 18\"D x 20\"H"
            }
        ]
        
    total_cost = sum(item["price"] for item in items)
    styling_notes = f"For this {room_type.lower()} setup in {color_palette}, we recommend using {material.lower()} as the base theme. "
    if color_palette == "Warm Autumn":
        styling_notes += "Incorporate soft yellow warm lighting (2700K) to highlight the rich timber grains. Use solid cream curtains and add linen terracotta throw cushions on the seating to create a cozy, layered environment."
    elif color_palette == "Ocean Breeze":
        styling_notes += "Integrate natural light from large windows. Use white or beige rugs to ground the blue items. Keep walls in high-reflectance matte white to emphasize the fresh oceanic vibes."
    elif color_palette == "Forest Sanctuary":
        styling_notes += "Pair this green-themed setting with active indoor houseplants (like Monstera or Snake plants). Use warm metallic details (such as brushed gold lamp stands or brass handles) to create a luxurious contrast."
    elif color_palette == "Minimalist Monochrome":
        styling_notes += "Emphasize clean lines and negative space. Use linear track lights on the ceiling. Contrast the black steel frames with abstract black-and-white canvas art on the main wall."
    else: # Sunset Glow
        styling_notes += "Use dimmable decorative floor lamps to evoke a sunset ambience. Add soft textures with a dusty rose accent rug, and dress tables or desks with gold accents."

    return {
        "furniture_set": items,
        "styling_notes": styling_notes,
        "total_set_cost": round(total_cost, 2)
    }

def call_ai_api(room_type, color_palette, budget):
    ai_provider = os.getenv('AI_PROVIDER', 'mock').lower()
    
    # Auto fallback if API keys are missing
    if ai_provider == 'gemini' and not os.getenv('GEMINI_API_KEY'):
        ai_provider = 'mock'
    elif ai_provider == 'openai' and not os.getenv('OPENAI_API_KEY'):
        ai_provider = 'mock'
        
    if ai_provider == 'gemini':
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": SYSTEM_PROMPT},
                            {"text": USER_PROMPT_TEMPLATE.format(room_type=room_type, color_palette=color_palette, budget=budget)}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                res_data = res.json()
                text_out = res_data['candidates'][0]['content']['parts'][0]['text']
                # clean enclosing backticks if any
                text_out = text_out.strip()
                if text_out.startswith("```"):
                    lines = text_out.splitlines()
                    if lines[0].startswith("```json"):
                        text_out = "\n".join(lines[1:-1])
                    else:
                        text_out = "\n".join(lines[1:-1])
                return json.loads(text_out)
            else:
                print(f"Gemini API Error: {res.status_code} - {res.text}")
                return get_mock_furniture_set(room_type, color_palette, budget)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return get_mock_furniture_set(room_type, color_palette, budget)
            
    elif ai_provider == 'openai':
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            payload = {
                "model": "gpt-4o",
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_PROMPT_TEMPLATE.format(room_type=room_type, color_palette=color_palette, budget=budget)}
                ]
            }
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                res_data = res.json()
                text_out = res_data['choices'][0]['message']['content']
                return json.loads(text_out)
            else:
                print(f"OpenAI API Error: {res.status_code} - {res.text}")
                return get_mock_furniture_set(room_type, color_palette, budget)
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return get_mock_furniture_set(room_type, color_palette, budget)
            
    else:
        return get_mock_furniture_set(room_type, color_palette, budget)

# ==========================================
# Web & API Endpoints
# ==========================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    room_type = data.get('room_type')
    color_palette = data.get('color_palette')
    budget = data.get('budget')
    
    if not room_type or not color_palette or not budget:
        return jsonify({"error": "Missing required fields (room_type, color_palette, budget)"}), 400
        
    try:
        budget = float(budget)
        if budget <= 0:
            return jsonify({"error": "Budget must be greater than zero"}), 400
    except ValueError:
        return jsonify({"error": "Invalid budget value"}), 400
        
    # Save user inputs
    inp_record = InputRecord(room_type=room_type, color_palette=color_palette, budget=budget)
    db.session.add(inp_record)
    db.session.commit() # Commit to get input record ID
    
    # Call AI
    ai_resp = call_ai_api(room_type, color_palette, budget)
    furniture_json = json.dumps(ai_resp.get("furniture_set", []))
    styling_notes = ai_resp.get("styling_notes", "")
    
    # Save output
    out_record = AIOutputRecord(
        input_id=inp_record.id,
        furniture_set_data=furniture_json,
        styling_notes=styling_notes
    )
    db.session.add(out_record)
    db.session.commit() # Commit to get output record ID
    
    # Save History link
    hist_record = HistoryRecord(
        input_id=inp_record.id,
        output_id=out_record.id
    )
    db.session.add(hist_record)
    db.session.commit()
    
    return jsonify({
        "history_id": hist_record.id,
        "input_id": inp_record.id,
        "output_id": out_record.id,
        "room_type": room_type,
        "color_palette": color_palette,
        "budget": budget,
        "furniture_set": ai_resp.get("furniture_set", []),
        "styling_notes": styling_notes,
        "total_set_cost": ai_resp.get("total_set_cost", 0.0),
        "created_at": hist_record.created_at.isoformat()
    })

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.get_json() or {}
    output_id = data.get('output_id')
    rating = data.get('rating')
    comment = data.get('comment', '')
    
    if not output_id or rating is None:
        return jsonify({"error": "Missing required fields (output_id, rating)"}), 400
        
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400
    except ValueError:
        return jsonify({"error": "Rating must be an integer"}), 400
        
    out_record = db.session.get(AIOutputRecord, output_id)
    if not out_record:
        return jsonify({"error": "AI Output record not found"}), 404
        
    # Check if a rating already exists for this output
    rat_record = RatingRecord.query.filter_by(output_id=output_id).first()
    if rat_record:
        rat_record.rating = rating
        rat_record.comment = comment
    else:
        rat_record = RatingRecord(output_id=output_id, rating=rating, comment=comment)
        db.session.add(rat_record)
        db.session.commit()
        
    # Update history link
    hist_record = HistoryRecord.query.filter_by(output_id=output_id).first()
    if hist_record:
        hist_record.rating_id = rat_record.id
        db.session.commit()
        
    return jsonify({"success": True, "rating_id": rat_record.id})

@app.route('/api/history', methods=['GET'])
def get_history():
    records = HistoryRecord.query.order_by(HistoryRecord.created_at.desc()).all()
    history_list = []
    
    for r in records:
        inp = r.input_rel
        out = r.output_rel
        rat = r.rating_rel
        
        history_list.append({
            "history_id": r.id,
            "input_id": r.input_id,
            "output_id": r.output_id,
            "room_type": inp.room_type,
            "color_palette": inp.color_palette,
            "budget": inp.budget,
            "furniture_set": json.loads(out.furniture_set_data),
            "styling_notes": out.styling_notes,
            "rating": rat.rating if rat else None,
            "feedback_comment": rat.comment if rat else None,
            "created_at": r.created_at.isoformat()
        })
        
    return jsonify(history_list)

@app.route('/api/history/<int:history_id>', methods=['GET'])
def get_history_detail(history_id):
    r = db.session.get(HistoryRecord, history_id)
    if not r:
        return jsonify({"error": "History record not found"}), 404
        
    inp = r.input_rel
    out = r.output_rel
    rat = r.rating_rel
    
    return jsonify({
        "history_id": r.id,
        "input_id": r.input_id,
        "output_id": r.output_id,
        "room_type": inp.room_type,
        "color_palette": inp.color_palette,
        "budget": inp.budget,
        "furniture_set": json.loads(out.furniture_set_data),
        "styling_notes": out.styling_notes,
        "rating": rat.rating if rat else None,
        "feedback_comment": rat.comment if rat else None,
        "created_at": r.created_at.isoformat()
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    # Overall statistics
    history_records = HistoryRecord.query.all()
    total_generations = len(history_records)
    
    avg_budget = 0.0
    if total_generations > 0:
        total_budget = sum(r.input_rel.budget for r in history_records)
        avg_budget = round(total_budget / total_generations, 2)
        
    rating_records = RatingRecord.query.all()
    avg_rating = 0.0
    if len(rating_records) > 0:
        total_rating = sum(r.rating for r in rating_records)
        avg_rating = round(total_rating / len(rating_records), 2)
        
    # Room Type Popularity
    room_types_counts = {}
    for r in history_records:
        rt = r.input_rel.room_type
        room_types_counts[rt] = room_types_counts.get(rt, 0) + 1
        
    # Color Palette Popularity
    color_palettes_counts = {}
    for r in history_records:
        cp = r.input_rel.color_palette
        color_palettes_counts[cp] = color_palettes_counts.get(cp, 0) + 1
        
    # Usage Trend over the last 7 days
    # (Since SQLite timestamps are stored as datetime, we can group them by day)
    today = datetime.now(timezone.utc).date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    days_str = [d.strftime('%Y-%m-%d') for d in days]
    
    daily_counts = {d_str: 0 for d_str in days_str}
    for r in history_records:
        date_str = r.created_at.strftime('%Y-%m-%d')
        if date_str in daily_counts:
            daily_counts[date_str] += 1
            
    # Ratings Trend over the last 7 days (daily average)
    daily_ratings_sum = {d_str: [] for d_str in days_str}
    for r in rating_records:
        date_str = r.created_at.strftime('%Y-%m-%d')
        if date_str in daily_ratings_sum:
            daily_ratings_sum[date_str].append(r.rating)
            
    daily_ratings_avg = {}
    for d_str, scores in daily_ratings_sum.items():
        if len(scores) > 0:
            daily_ratings_avg[d_str] = round(sum(scores) / len(scores), 2)
        else:
            daily_ratings_avg[d_str] = 0.0
            
    return jsonify({
        "total_generations": total_generations,
        "avg_budget": avg_budget,
        "avg_rating": avg_rating,
        "room_types_popularity": room_types_counts,
        "color_palettes_popularity": color_palettes_counts,
        "usage_trend": {
            "labels": days_str,
            "data": [daily_counts[d] for d in days_str]
        },
        "rating_trend": {
            "labels": days_str,
            "data": [daily_ratings_avg[d] for d in days_str]
        }
    })

@app.route('/api/templates', methods=['GET'])
def get_templates():
    presets = [
        {"room_type": "Living Room", "color_palette": "Ocean Breeze", "budget": 3500.0, "label": "Coastal Theme Living Room"},
        {"room_type": "Bedroom", "color_palette": "Sunset Glow", "budget": 4500.0, "label": "Cozy Sunset Master Suite"},
        {"room_type": "Dining Room", "color_palette": "Forest Sanctuary", "budget": 6000.0, "label": "Emerald Timber Dining Set"},
        {"room_type": "Home Office", "color_palette": "Minimalist Monochrome", "budget": 2000.0, "label": "Modern Executive Workspace"},
        {"room_type": "Bedroom", "color_palette": "Warm Autumn", "budget": 3000.0, "label": "Rustic Terracotta Guest Room"}
    ]
    return jsonify(presets)

# /api/suggestions/* routes are defined below (before __main__ so they register on import)

# ==========================================
# /api/suggestions/* — routes that match the React frontend
# ==========================================

@app.route('/api/suggestions/generate', methods=['POST'])
def suggestions_generate():
    """
    POST /api/suggestions/generate
    Body (camelCase from React):
        { roomType, colourPreference, budget }
    Response:
        { success: true, data: { ... } }
    """
    data = request.get_json() or {}

    # Accept both camelCase (frontend) and snake_case (legacy)
    room_type      = data.get('roomType')      or data.get('room_type')
    color_palette  = data.get('colourPreference') or data.get('color_palette')
    budget         = data.get('budget')

    if not room_type or not color_palette or not budget:
        return jsonify({
            "success": False,
            "message": "Missing required fields: roomType, colourPreference, budget"
        }), 400

    try:
        budget = float(budget)
        if budget <= 0:
            return jsonify({"success": False, "message": "Budget must be greater than zero"}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid budget value"}), 400

    # Persist input
    inp_record = InputRecord(room_type=room_type, color_palette=color_palette, budget=budget)
    db.session.add(inp_record)
    db.session.commit()

    # Generate AI suggestion
    ai_resp       = call_ai_api(room_type, color_palette, budget)
    furniture_json = json.dumps(ai_resp.get("furniture_set", []))
    styling_notes  = ai_resp.get("styling_notes", "")

    # Persist output
    out_record = AIOutputRecord(
        input_id=inp_record.id,
        furniture_set_data=furniture_json,
        styling_notes=styling_notes
    )
    db.session.add(out_record)
    db.session.commit()

    # Persist history link
    hist_record = HistoryRecord(input_id=inp_record.id, output_id=out_record.id)
    db.session.add(hist_record)
    db.session.commit()

    payload = {
        "history_id":    hist_record.id,
        "input_id":      inp_record.id,
        "output_id":     out_record.id,
        "roomType":      room_type,
        "colourPreference": color_palette,
        "budget":        budget,
        "furniture_set": ai_resp.get("furniture_set", []),
        "styling_notes": styling_notes,
        "total_set_cost": ai_resp.get("total_set_cost", 0.0),
        "created_at":    hist_record.created_at.isoformat()
    }
    return jsonify({"success": True, "data": payload})


@app.route('/api/suggestions/history', methods=['GET'])
def suggestions_history():
    """
    GET /api/suggestions/history
    Response:
        { success: true, data: [ ...records ] }
    """
    records = HistoryRecord.query.order_by(HistoryRecord.created_at.desc()).all()
    history_list = []

    for r in records:
        inp = r.input_rel
        out = r.output_rel
        rat = r.rating_rel

        history_list.append({
            "id":             r.id,          # frontend uses item.id for deletes
            "history_id":     r.id,
            "input_id":       r.input_id,
            "output_id":      r.output_id,
            "roomType":       inp.room_type,
            "colourPreference": inp.color_palette,
            "room_type":      inp.room_type,
            "color_palette":  inp.color_palette,
            "budget":         inp.budget,
            "furniture_set":  json.loads(out.furniture_set_data),
            "styling_notes":  out.styling_notes,
            "rating":         rat.rating if rat else None,
            "feedback_comment": rat.comment if rat else None,
            "created_at":     r.created_at.isoformat()
        })

    return jsonify({"success": True, "data": history_list})


@app.route('/api/suggestions/<int:history_id>', methods=['DELETE'])
def suggestions_delete(history_id):
    """
    DELETE /api/suggestions/<history_id>
    Deletes the history record (and cascades to input/output/rating via FK rules).
    Response:
        { success: true }
    """
    r = db.session.get(HistoryRecord, history_id)
    if not r:
        return jsonify({"success": False, "message": "History record not found"}), 404

    # Delete the linked input — cascade takes care of output, rating, history
    inp = db.session.get(InputRecord, r.input_id)
    if inp:
        db.session.delete(inp)
    else:
        db.session.delete(r)

    db.session.commit()
    return jsonify({"success": True})


@app.route('/api/suggestions/<int:output_id>/rate', methods=['POST'])
def suggestions_rate(output_id):
    """
    POST /api/suggestions/<output_id>/rate
    Body: { rating: 1-5 }
    Response:
        { success: true, rating_id: <id> }
    """
    data    = request.get_json() or {}
    rating  = data.get('rating')
    comment = data.get('comment', '')

    if rating is None:
        return jsonify({"success": False, "message": "Missing required field: rating"}), 400

    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            return jsonify({"success": False, "message": "Rating must be between 1 and 5"}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Rating must be an integer"}), 400

    out_record = db.session.get(AIOutputRecord, output_id)
    if not out_record:
        return jsonify({"success": False, "message": "Output record not found"}), 404

    # Upsert rating
    rat_record = RatingRecord.query.filter_by(output_id=output_id).first()
    if rat_record:
        rat_record.rating  = rating
        rat_record.comment = comment
    else:
        rat_record = RatingRecord(output_id=output_id, rating=rating, comment=comment)
        db.session.add(rat_record)

    db.session.commit()

    # Link rating to history record
    hist_record = HistoryRecord.query.filter_by(output_id=output_id).first()
    if hist_record:
        hist_record.rating_id = rat_record.id
        db.session.commit()

    return jsonify({"success": True, "rating_id": rat_record.id})


@app.route('/api/suggestions/analytics', methods=['GET'])
def suggestions_analytics():
    """
    GET /api/suggestions/analytics
    Response shape expected by AdminDashboard:
        {
          success: true,
          data: {
            totalSuggestions,
            averageRating,
            popularRoomTypes: [{ name, count }],
            budgetDistribution: [{ label, count }],
            dailyTrend: [{ date, count }]
          }
        }
    """
    history_records = HistoryRecord.query.all()
    total           = len(history_records)

    # Average rating
    rating_records = RatingRecord.query.all()
    avg_rating     = 0.0
    if rating_records:
        avg_rating = round(sum(r.rating for r in rating_records) / len(rating_records), 2)

    # Room type popularity
    room_counts = {}
    for r in history_records:
        rt = r.input_rel.room_type
        room_counts[rt] = room_counts.get(rt, 0) + 1
    popular_room_types = [{"name": k, "count": v} for k, v in
                          sorted(room_counts.items(), key=lambda x: x[1], reverse=True)]

    # Budget distribution buckets (in ₹)
    buckets = {"< ₹50K": 0, "₹50K–₹1L": 0, "₹1L–₹3L": 0, "> ₹3L": 0}
    for r in history_records:
        b = r.input_rel.budget
        if b < 50000:
            buckets["< ₹50K"] += 1
        elif b < 100000:
            buckets["₹50K–₹1L"] += 1
        elif b < 300000:
            buckets["₹1L–₹3L"] += 1
        else:
            buckets["> ₹3L"] += 1
    budget_distribution = [{"label": k, "count": v} for k, v in buckets.items()]

    # Daily trend — last 7 days
    today    = datetime.now(timezone.utc).date()
    days     = [today - timedelta(days=i) for i in range(6, -1, -1)]
    day_strs = [d.strftime('%Y-%m-%d') for d in days]
    day_map  = {d: 0 for d in day_strs}
    for r in history_records:
        ds = r.created_at.strftime('%Y-%m-%d')
        if ds in day_map:
            day_map[ds] += 1
    daily_trend = [{"date": d, "count": day_map[d]} for d in day_strs]

    return jsonify({
        "success": True,
        "data": {
            "totalSuggestions":   total,
            "averageRating":      avg_rating,
            "popularRoomTypes":   popular_room_types,
            "budgetDistribution": budget_distribution,
            "dailyTrend":         daily_trend
        }
    })
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
