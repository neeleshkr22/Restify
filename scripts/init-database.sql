-- Initialize the database schema for REST Client
-- This will be automatically handled by MikroORM, but here's the schema for reference

CREATE TABLE IF NOT EXISTS request_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  headers TEXT NOT NULL DEFAULT '{}',
  body TEXT NOT NULL DEFAULT '',
  response TEXT NOT NULL DEFAULT '',
  status_code INTEGER NOT NULL DEFAULT 0,
  response_time INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_history_method ON request_history(method);
CREATE INDEX IF NOT EXISTS idx_request_history_status_code ON request_history(status_code);
