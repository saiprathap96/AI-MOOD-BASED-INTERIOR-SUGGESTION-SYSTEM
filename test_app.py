import unittest
import json
import os
from app import app, db, InputRecord, AIOutputRecord, RatingRecord, HistoryRecord

class SVSFurnitureWorksTestCase(unittest.TestCase):
    
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use in-memory DB for tests
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        self.app_client = app.test_client()
        
        # Initialize database tables
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_homepage(self):
        response = self.app_client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_get_templates(self):
        response = self.app_client.get('/api/templates')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) > 0)
        self.assertEqual(data[0]['room_type'], 'Living Room')

    def test_generate_invalid_input(self):
        # Test missing keys
        payload = {"room_type": "Bedroom"}
        response = self.app_client.post('/api/generate', json=payload)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn("error", data)

        # Test negative budget
        payload = {"room_type": "Bedroom", "color_palette": "Ocean Breeze", "budget": -50}
        response = self.app_client.post('/api/generate', json=payload)
        self.assertEqual(response.status_code, 400)

        # Test string budget that is not a number
        payload = {"room_type": "Bedroom", "color_palette": "Ocean Breeze", "budget": "abc"}
        response = self.app_client.post('/api/generate', json=payload)
        self.assertEqual(response.status_code, 400)

    def test_generate_success(self):
        payload = {
            "room_type": "Living Room",
            "color_palette": "Ocean Breeze",
            "budget": 3500.00
        }
        
        response = self.app_client.post('/api/generate', json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn("history_id", data)
        self.assertIn("output_id", data)
        self.assertEqual(data["room_type"], "Living Room")
        self.assertEqual(data["color_palette"], "Ocean Breeze")
        self.assertEqual(data["budget"], 3500.00)
        self.assertIsInstance(data["furniture_set"], list)
        self.assertTrue(len(data["furniture_set"]) > 0)
        self.assertIn("styling_notes", data)
        self.assertTrue(data["total_set_cost"] <= 3500.00)

        # Check database records
        with app.app_context():
            inputs = InputRecord.query.all()
            outputs = AIOutputRecord.query.all()
            histories = HistoryRecord.query.all()
            
            self.assertEqual(len(inputs), 1)
            self.assertEqual(len(outputs), 1)
            self.assertEqual(len(histories), 1)
            
            self.assertEqual(inputs[0].room_type, "Living Room")
            self.assertEqual(outputs[0].input_id, inputs[0].id)
            self.assertEqual(histories[0].input_id, inputs[0].id)
            self.assertEqual(histories[0].output_id, outputs[0].id)

    def test_feedback_submit(self):
        # 1. First generate a mood board
        gen_payload = {
            "room_type": "Bedroom",
            "color_palette": "Sunset Glow",
            "budget": 4000.00
        }
        gen_res = self.app_client.post('/api/generate', json=gen_payload)
        gen_data = json.loads(gen_res.data.decode('utf-8'))
        output_id = gen_data["output_id"]

        # 2. Submit rating feedback
        feedback_payload = {
            "output_id": output_id,
            "rating": 5,
            "comment": "Perfect color alignment!"
        }
        feed_res = self.app_client.post('/api/feedback', json=feedback_payload)
        self.assertEqual(feed_res.status_code, 200)
        
        feed_data = json.loads(feed_res.data.decode('utf-8'))
        self.assertTrue(feed_data["success"])
        self.assertIn("rating_id", feed_data)

        # Check ratings and history table update
        with app.app_context():
            ratings = RatingRecord.query.all()
            histories = HistoryRecord.query.all()
            
            self.assertEqual(len(ratings), 1)
            self.assertEqual(ratings[0].rating, 5)
            self.assertEqual(ratings[0].comment, "Perfect color alignment!")
            self.assertEqual(histories[0].rating_id, ratings[0].id)

    def test_feedback_invalid_rating(self):
        # Test out of range rating (e.g. 6 stars)
        payload = {"output_id": 1, "rating": 6}
        response = self.app_client.post('/api/feedback', json=payload)
        self.assertEqual(response.status_code, 400)

        # Test non-integer rating
        payload = {"output_id": 1, "rating": "awesome"}
        response = self.app_client.post('/api/feedback', json=payload)
        self.assertEqual(response.status_code, 400)

    def test_history_list_and_detail(self):
        # Generate two items
        self.app_client.post('/api/generate', json={"room_type": "Bedroom", "color_palette": "Sunset Glow", "budget": 4000})
        self.app_client.post('/api/generate', json={"room_type": "Living Room", "color_palette": "Ocean Breeze", "budget": 3500})
        
        # Test list
        res_list = self.app_client.get('/api/history')
        self.assertEqual(res_list.status_code, 200)
        history_data = json.loads(res_list.data.decode('utf-8'))
        self.assertEqual(len(history_data), 2)
        
        # Ordered newest first, so first element is the living room one
        self.assertEqual(history_data[0]["room_type"], "Living Room")
        self.assertEqual(history_data[1]["room_type"], "Bedroom")

        # Test individual detail retrieval
        hist_id = history_data[0]["history_id"]
        res_detail = self.app_client.get(f'/api/history/{hist_id}')
        self.assertEqual(res_detail.status_code, 200)
        detail_data = json.loads(res_detail.data.decode('utf-8'))
        self.assertEqual(detail_data["room_type"], "Living Room")

    def test_analytics(self):
        # 1. Test empty analytics first
        res_empty = self.app_client.get('/api/analytics')
        self.assertEqual(res_empty.status_code, 200)
        data_empty = json.loads(res_empty.data.decode('utf-8'))
        self.assertEqual(data_empty["total_generations"], 0)
        self.assertEqual(data_empty["avg_budget"], 0.0)
        self.assertEqual(data_empty["avg_rating"], 0.0)

        # 2. Generate two records with different budgets
        r1 = self.app_client.post('/api/generate', json={"room_type": "Bedroom", "color_palette": "Sunset Glow", "budget": 4000})
        r2 = self.app_client.post('/api/generate', json={"room_type": "Living Room", "color_palette": "Ocean Breeze", "budget": 3000})
        
        d1 = json.loads(r1.data.decode('utf-8'))
        d2 = json.loads(r2.data.decode('utf-8'))
        
        # 3. Submit ratings: 5 stars and 4 stars
        self.app_client.post('/api/feedback', json={"output_id": d1["output_id"], "rating": 5})
        self.app_client.post('/api/feedback', json={"output_id": d2["output_id"], "rating": 4})

        # 4. Fetch analytics and verify counts and averages
        res_analytics = self.app_client.get('/api/analytics')
        self.assertEqual(res_analytics.status_code, 200)
        data = json.loads(res_analytics.data.decode('utf-8'))
        
        self.assertEqual(data["total_generations"], 2)
        self.assertEqual(data["avg_budget"], 3500.00) # (4000 + 3000) / 2
        self.assertEqual(data["avg_rating"], 4.5)     # (5 + 4) / 2
        
        self.assertEqual(data["room_types_popularity"]["Bedroom"], 1)
        self.assertEqual(data["room_types_popularity"]["Living Room"], 1)
        self.assertEqual(data["color_palettes_popularity"]["Sunset Glow"], 1)
        self.assertEqual(data["color_palettes_popularity"]["Ocean Breeze"], 1)

if __name__ == '__main__':
    unittest.main()
