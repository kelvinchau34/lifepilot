# health_ai/app/services/embedding_service.py

import time
import os
from typing import List, Dict, Any
import numpy as np
import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        try:
            logger.info("Loading embedding model...")
            self.model_name = "all-MiniLM-L6-v2"  # Lightweight, efficient model
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Embedding model {self.model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise
    
    def _split_text(self, text: str, chunk_size: int = 200, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunk = text[i:i + chunk_size]
            if len(chunk) < 50:  # Skip tiny chunks
                continue
            chunks.append(chunk)
        return chunks
    
    async def get_embeddings(self, text: str, split_into_chunks: bool = True) -> Dict[str, Any]:
        """Generate embeddings for text"""
        start_time = time.time()
        
        try:
            # Split text into chunks if requested
            if split_into_chunks:
                chunks = self._split_text(text)
                logger.info(f"Split text into {len(chunks)} chunks")
            else:
                chunks = [text]
            
            # Generate embeddings
            embeddings = []
            for chunk in chunks:
                # Convert to list to make serializable
                embedding = self.model.encode(chunk).tolist()
                embeddings.append(embedding)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "embeddings": embeddings,
                "chunk_count": len(chunks),
                "chunks": chunks if split_into_chunks else None,
                "processing_time": round(processing_time, 2)
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Embedding generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(processing_time, 2)
            }
    
    async def search_similar(self, query: str, documents: List[str], top_k: int = 3) -> Dict[str, Any]:
        """Search for similar documents using embeddings"""
        start_time = time.time()
        
        try:
            # Generate query embedding
            query_embedding = self.model.encode(query)
            
            # Generate document embeddings
            doc_embeddings = self.model.encode(documents)
            
            # Calculate similarities using cosine similarity
            similarities = []
            for i, doc_embedding in enumerate(doc_embeddings):
                # Cosine similarity
                similarity = np.dot(query_embedding, doc_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
                )
                similarities.append({
                    "index": i,
                    "document": documents[i],
                    "similarity": float(similarity)  # Convert to native Python float
                })
            
            # Sort by similarity (descending)
            similarities.sort(key=lambda x: x["similarity"], reverse=True)
            
            # Return top-k results
            top_results = similarities[:top_k]
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "results": top_results,
                "processing_time": round(processing_time, 2)
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Semantic search failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(processing_time, 2)
            }