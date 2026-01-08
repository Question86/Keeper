import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'keeper.db')

  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      last_message_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER DEFAULT (strftime('%s', 'now')),
      platform_message_id TEXT,
      author_name TEXT,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS snippet_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id TEXT NOT NULL,
      snippet_text TEXT NOT NULL,
      input_text TEXT NOT NULL,
      output_text TEXT NOT NULL,
      final_text TEXT NOT NULL,
      edit_distance INTEGER,
      user_rating INTEGER,
      conversation_id TEXT,
      timestamp INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversation_id, timestamp DESC);

    CREATE INDEX IF NOT EXISTS idx_conversations_last_message 
      ON conversations(last_message_at DESC);

    CREATE INDEX IF NOT EXISTS idx_snippet_usage_timestamp 
      ON snippet_usage(timestamp DESC);
  `)

  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

// Database helper functions

export function saveConversation(conv: {
  id: string
  platform: string
  display_name: string
  avatar_url?: string
  last_message_at?: number
}) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO conversations (id, platform, display_name, avatar_url, last_message_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      last_message_at = COALESCE(excluded.last_message_at, last_message_at)
  `)
  stmt.run(conv.id, conv.platform, conv.display_name, conv.avatar_url || null, conv.last_message_at || null)
}

export function saveMessage(msg: {
  id: string
  conversation_id: string
  direction: 'incoming' | 'outgoing'
  content: string
  timestamp?: number
  platform_message_id?: string
  author_name?: string
}) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO messages (id, conversation_id, direction, content, timestamp, platform_message_id, author_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET content = excluded.content
  `)
  stmt.run(
    msg.id,
    msg.conversation_id,
    msg.direction,
    msg.content,
    msg.timestamp || Math.floor(Date.now() / 1000),
    msg.platform_message_id || null,
    msg.author_name || null
  )

  // Update conversation last_message_at
  const updateConv = db.prepare(`
    UPDATE conversations 
    SET last_message_at = ? 
    WHERE id = ?
  `)
  updateConv.run(msg.timestamp || Math.floor(Date.now() / 1000), msg.conversation_id)
}

export function getConversations() {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT * FROM conversations 
    ORDER BY last_message_at DESC NULLS LAST, created_at DESC
  `)
  return stmt.all()
}

export function getMessages(conversation_id: string, limit = 100) {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY timestamp ASC
    LIMIT ?
  `)
  return stmt.all(conversation_id, limit)
}

export function saveSnippetUsage(usage: {
  snippet_id: string
  snippet_text: string
  input_text: string
  output_text: string
  final_text: string
  edit_distance: number
  user_rating?: number
  conversation_id?: string
}) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO snippet_usage (
      snippet_id, snippet_text, input_text, output_text, 
      final_text, edit_distance, user_rating, conversation_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    usage.snippet_id,
    usage.snippet_text,
    usage.input_text,
    usage.output_text,
    usage.final_text,
    usage.edit_distance,
    usage.user_rating || null,
    usage.conversation_id || null
  )
}

export function clearAllData(): void {
  const db = getDatabase()
  
  // Delete all data (foreign keys will cascade)
  db.prepare('DELETE FROM conversations').run()
  db.prepare('DELETE FROM messages').run()
  db.prepare('DELETE FROM snippet_usage').run()
  
  // Vacuum to reclaim space
  db.prepare('VACUUM').run()
}
