#!/usr/bin/env python3
"""
Local Document RAG - Semantic Search Tool
Usage: python3 rag.py [command] [options]

Commands:
  ingest <dir>           Ingest documents from a directory
  query <text>           Query the knowledge base
  search <text>          Search without AI synthesis
  stats                  Show index statistics
  clear                  Clear the knowledge base
"""

import os
import sys
import json
import sqlite3
import hashlib
import argparse
from pathlib import Path
from datetime import datetime

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import markdown
except ImportError:
    markdown = None

import numpy as np

# Config
DB_PATH = os.path.join(os.path.dirname(__file__), 'index.db')
EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

def init_db():
    """Initialize SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            chunk_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            embedding BLOB NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(filename, chunk_id)
        )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS idx_filename ON documents(filename)')
    conn.commit()
    return conn

def parse_pdf(filepath):
    """Extract text from PDF."""
    if PdfReader is None:
        return []
    try:
        reader = PdfReader(filepath)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return [text]
    except Exception as e:
        print(f"Error reading PDF {filepath}: {e}")
        return []

def parse_markdown(filepath):
    """Extract text from Markdown."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if markdown:
            import re
            html = markdown.markdown(content)
            text = re.sub(r'<[^>]+>', '', html)
            return [text]
        return [content]
    except Exception as e:
        print(f"Error reading MD {filepath}: {e}")
        return []

def parse_txt(filepath):
    """Extract text from plain text file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return [f.read()]
    except Exception as e:
        print(f"Error reading TXT {filepath}: {e}")
        return []

def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), size - overlap):
        chunk = ' '.join(words[i:i + size])
        if chunk:
            chunks.append(chunk)
    return chunks

def get_embedding(text, model=None):
    """Generate embedding using sentence-transformers."""
    if model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print(f"Loading embedding model: {EMBEDDING_MODEL}...")
            model = SentenceTransformer(EMBEDDING_MODEL)
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    try:
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.astype(np.float32).tobytes()
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def cosine_similarity(a, b):
    """Compute cosine similarity between two embeddings."""
    a = np.frombuffer(a, dtype=np.float32)
    b = np.frombuffer(b, dtype=np.float32)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def ingest_directory(dir_path):
    """Ingest all documents from a directory."""
    if not os.path.isdir(dir_path):
        print(f"Error: {dir_path} is not a directory")
        return
    
    conn = init_db()
    c = conn.cursor()
    
    try:
        from sentence_transformers import SentenceTransformer
        print(f"Loading model: {EMBEDDING_MODEL}...")
        model = SentenceTransformer(EMBEDDING_MODEL)
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    extensions = {'.pdf': parse_pdf, '.md': parse_markdown, '.txt': parse_txt}
    
    files_processed = 0
    chunks_added = 0
    
    for root, dirs, files in os.walk(dir_path):
        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext not in extensions:
                continue
            
            filepath = os.path.join(root, filename)
            print(f"Processing: {filename}")
            
            texts = extensions[ext](filepath)
            
            for text in texts:
                if not text.strip():
                    continue
                
                chunks = chunk_text(text)
                
                for i, chunk in enumerate(chunks):
                    if not chunk.strip():
                        continue
                    
                    c.execute(
                        'SELECT id FROM documents WHERE filename=? AND chunk_id=?',
                        (filename, i)
                    )
                    if c.fetchone():
                        continue
                    
                    embedding = get_embedding(chunk, model)
                    if embedding is None:
                        continue
                    
                    c.execute(
                        'INSERT INTO documents (filename, chunk_id, content, embedding, created_at) VALUES (?, ?, ?, ?, ?)',
                        (filename, i, chunk, embedding, datetime.utcnow().isoformat())
                    )
                    chunks_added += 1
            
            files_processed += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Ingested {files_processed} files, {chunks_added} chunks added to index")

def query_knowledgebase(query_text, top_k=5):
    """Query the knowledge base and return relevant chunks."""
    conn = init_db()
    c = conn.cursor()
    
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(EMBEDDING_MODEL)
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    print(f"Searching for: {query_text}")
    query_embedding = get_embedding(query_text, model)
    if query_embedding is None:
        print("Error: Could not generate embedding for query")
        return
    
    c.execute('SELECT filename, chunk_id, content, embedding FROM documents')
    results = []
    
    for filename, chunk_id, content, embedding in c.fetchall():
        sim = cosine_similarity(query_embedding, embedding)
        results.append((filename, chunk_id, content, sim))
    
    results.sort(key=lambda x: x[3], reverse=True)
    top_results = results[:top_k]
    
    conn.close()
    
    if not top_results:
        print("No results found")
        return
    
    print(f"\n📚 Top {len(top_results)} results:\n")
    for i, (filename, chunk_id, content, sim) in enumerate(top_results, 1):
        print(f"--- Result {i} [{filename}] (score: {sim:.3f}) ---")
        print(content[:300] + "..." if len(content) > 300 else content)
        print()
    
    context = "\n\n".join([f"[{r[0]}]\n{r[2]}" for r in top_results])
    return {
        'query': query_text,
        'results': top_results,
        'context': context
    }

def search(query_text, top_k=10):
    """Simple search without AI synthesis."""
    result = query_knowledgebase(query_text, top_k)
    if result:
        print("\n💡 Use 'query' command for AI-synthesized answer")
    return result

def stats():
    """Show index statistics."""
    conn = init_db()
    c = conn.cursor()
    
    c.execute('SELECT COUNT(DISTINCT filename), COUNT(*) FROM documents')
    files, chunks = c.fetchone() or (0, 0)
    
    c.execute('SELECT filename, COUNT(*) as cnt FROM documents GROUP BY filename ORDER BY cnt DESC LIMIT 10')
    top_files = c.fetchall()
    
    conn.close()
    
    print(f"\n📊 Index Statistics")
    print(f"   Total files: {files}")
    print(f"   Total chunks: {chunks}")
    print(f"\n   Top indexed files:")
    for fname, cnt in top_files:
        print(f"      {fname}: {cnt} chunks")

def clear_index():
    """Clear the knowledge base."""
    conn = init_db()
    c = conn.cursor()
    c.execute('DELETE FROM documents')
    conn.commit()
    conn.close()
    print("✅ Index cleared")

def main():
    parser = argparse.ArgumentParser(description='Local Document RAG')
    parser.add_argument('command', choices=['ingest', 'query', 'search', 'stats', 'clear'])
    parser.add_argument('args', nargs='*', help='Command arguments')
    
    args = parser.parse_args()
    
    if args.command == 'ingest':
        if not args.args:
            print("Usage: rag.py ingest <directory>")
            return
        ingest_directory(args.args[0])
    
    elif args.command == 'query':
        if not args.args:
            print("Usage: rag.py query <search text>")
            return
        query_knowledgebase(' '.join(args.args))
    
    elif args.command == 'search':
        if not args.args:
            print("Usage: rag.py search <search text>")
            return
        search(' '.join(args.args))
    
    elif args.command == 'stats':
        stats()
    
    elif args.command == 'clear':
        clear_index()

if __name__ == '__main__':
    main()
