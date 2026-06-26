from datetime import datetime, timedelta, timezone
from app import app, db, InputRecord, AIOutputRecord, RatingRecord, HistoryRecord, get_mock_furniture_set
import json

def seed():
    with app.app_context():
        # Clear existing data to start fresh
        db.drop_all()
        db.create_all()
        
        now = datetime.now(timezone.utc)
        
        # Scenario 1: 3 days ago
        time_1 = now - timedelta(days=3)
        inp_1 = InputRecord(room_type="Living Room", color_palette="Ocean Breeze", budget=3000.0, created_at=time_1)
        db.session.add(inp_1)
        db.session.commit()
        
        mock_set_1 = get_mock_furniture_set("Living Room", "Ocean Breeze", 3000.0)
        out_1 = AIOutputRecord(input_id=inp_1.id, furniture_set_data=json.dumps(mock_set_1["furniture_set"]), styling_notes=mock_set_1["styling_notes"], created_at=time_1)
        db.session.add(out_1)
        db.session.commit()
        
        rat_1 = RatingRecord(output_id=out_1.id, rating=5, comment="Fabulous layout suggestion. Fits perfectly within the color guidelines.", created_at=time_1)
        db.session.add(rat_1)
        db.session.commit()
        
        hist_1 = HistoryRecord(input_id=inp_1.id, output_id=out_1.id, rating_id=rat_1.id, created_at=time_1)
        db.session.add(hist_1)
        
        # Scenario 2: 2 days ago
        time_2 = now - timedelta(days=2)
        inp_2 = InputRecord(room_type="Bedroom", color_palette="Sunset Glow", budget=4500.0, created_at=time_2)
        db.session.add(inp_2)
        db.session.commit()
        
        mock_set_2 = get_mock_furniture_set("Bedroom", "Sunset Glow", 4500.0)
        out_2 = AIOutputRecord(input_id=inp_2.id, furniture_set_data=json.dumps(mock_set_2["furniture_set"]), styling_notes=mock_set_2["styling_notes"], created_at=time_2)
        db.session.add(out_2)
        db.session.commit()
        
        rat_2 = RatingRecord(output_id=out_2.id, rating=4, comment="Very solid wood materials. The bench dimensions were slightly off but coordination is top tier.", created_at=time_2)
        db.session.add(rat_2)
        db.session.commit()
        
        hist_2 = HistoryRecord(input_id=inp_2.id, output_id=out_2.id, rating_id=rat_2.id, created_at=time_2)
        db.session.add(hist_2)
        
        # Scenario 3: 2 days ago
        inp_3 = InputRecord(room_type="Dining Room", color_palette="Forest Sanctuary", budget=6000.0, created_at=time_2)
        db.session.add(inp_3)
        db.session.commit()
        
        mock_set_3 = get_mock_furniture_set("Dining Room", "Forest Sanctuary", 6000.0)
        out_3 = AIOutputRecord(input_id=inp_3.id, furniture_set_data=json.dumps(mock_set_3["furniture_set"]), styling_notes=mock_set_3["styling_notes"], created_at=time_2)
        db.session.add(out_3)
        db.session.commit()
        
        rat_3 = RatingRecord(output_id=out_3.id, rating=5, comment="Love the green velvet dining chairs. Standard-setting design suggestions.", created_at=time_2)
        db.session.add(rat_3)
        db.session.commit()
        
        hist_3 = HistoryRecord(input_id=inp_3.id, output_id=out_3.id, rating_id=rat_3.id, created_at=time_2)
        db.session.add(hist_3)
        
        # Scenario 4: 1 day ago
        time_3 = now - timedelta(days=1)
        inp_4 = InputRecord(room_type="Home Office", color_palette="Minimalist Monochrome", budget=2000.0, created_at=time_3)
        db.session.add(inp_4)
        db.session.commit()
        
        mock_set_4 = get_mock_furniture_set("Home Office", "Minimalist Monochrome", 2000.0)
        out_4 = AIOutputRecord(input_id=inp_4.id, furniture_set_data=json.dumps(mock_set_4["furniture_set"]), styling_notes=mock_set_4["styling_notes"], created_at=time_3)
        db.session.add(out_4)
        db.session.commit()
        
        rat_4 = RatingRecord(output_id=out_4.id, rating=5, comment="Clean layout, very practical workspace suggestions.", created_at=time_3)
        db.session.add(rat_4)
        db.session.commit()
        
        hist_4 = HistoryRecord(input_id=inp_4.id, output_id=out_4.id, rating_id=rat_4.id, created_at=time_3)
        db.session.add(hist_4)
        
        # Scenario 5: Today
        inp_5 = InputRecord(room_type="Bedroom", color_palette="Warm Autumn", budget=3000.0, created_at=now)
        db.session.add(inp_5)
        db.session.commit()
        
        mock_set_5 = get_mock_furniture_set("Bedroom", "Warm Autumn", 3000.0)
        out_5 = AIOutputRecord(input_id=inp_5.id, furniture_set_data=json.dumps(mock_set_5["furniture_set"]), styling_notes=mock_set_5["styling_notes"], created_at=now)
        db.session.add(out_5)
        db.session.commit()
        
        # Unrated yet (representing new run)
        hist_5 = HistoryRecord(input_id=inp_5.id, output_id=out_5.id, rating_id=None, created_at=now)
        db.session.add(hist_5)
        
        db.session.commit()
        print("Database seeded successfully with 5 design scenarios!")

if __name__ == '__main__':
    seed()
