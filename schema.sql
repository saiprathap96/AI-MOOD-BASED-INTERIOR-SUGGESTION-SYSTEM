-- Sri Venkata Sai Furniture Works - Database Schema DDL
-- This file defines the relational schema for SVS AI Mood Board Generator.

-- 1. Inputs Table: Captures user form selections
CREATE TABLE IF NOT EXISTS inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_type VARCHAR(50) NOT NULL,
    color_palette VARCHAR(50) NOT NULL,
    budget REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. AI Outputs Table: Stores coordinate suggestions returned from the AI engine
CREATE TABLE IF NOT EXISTS ai_outputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_id INTEGER NOT NULL,
    furniture_set_data TEXT NOT NULL, -- JSON formatted array of items
    styling_notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (input_id) REFERENCES inputs(id) ON DELETE CASCADE
);

-- 3. Ratings Table: Holds user star-rating and text feedback
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    output_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (output_id) REFERENCES ai_outputs(id) ON DELETE CASCADE
);

-- 4. History Table: Unified audit trail mapping input, output, and rating
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_id INTEGER NOT NULL,
    output_id INTEGER NOT NULL,
    rating_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (input_id) REFERENCES inputs(id) ON DELETE CASCADE,
    FOREIGN KEY (output_id) REFERENCES ai_outputs(id) ON DELETE CASCADE,
    FOREIGN KEY (rating_id) REFERENCES ratings(id) ON DELETE SET NULL
);
