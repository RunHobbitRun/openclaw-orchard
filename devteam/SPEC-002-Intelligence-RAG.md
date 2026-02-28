# Dev Team Specification: Local Document RAG (TASK-002)

## Overview
Intelligence and Scout need a tool to ingest and synthesize large documents (PDFs, whitepapers, tokenomics, text dumps). NotebookLM is rejected due to security/API issues. We need a local Retrieval-Augmented Generation (RAG) script.

## Requirements
- Must run in the DevTeam Sandbox.
- Input: Directory of documents (PDF, TXT, MD).
- Process: Parse text, chunk it, and generate embeddings (using an open source or configured embedding model).
- Storage: Store vectors locally or in our Supabase instance.
- Output: A CLI that accepts a query and returns the top relevant chunks + an AI-synthesized answer.
- Constraints: No raw data leaves the server except to authorized APIs.
