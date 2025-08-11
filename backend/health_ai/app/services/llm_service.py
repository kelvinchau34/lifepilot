# health_ai/app/services/llm_service.py
import os
import time
import json
from typing import Dict, Any, List
import logging
import httpx

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")
        self.provider = "openai" if os.environ.get("OPENAI_API_KEY") else "anthropic"
        self.timeout = 60  # seconds
        
        if not self.api_key:
            logger.warning("No LLM API key found. QA functionality will be limited.")
    
    def _build_prompt(self, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Build a prompt for the LLM with context chunks"""
        chunks_text = "\n\n".join([f"Context {i+1}:\n{chunk['text']}" for i, chunk in enumerate(context_chunks)])
        
        prompt = f"""You are a helpful medical assistant analyzing health documents.
Below are excerpts from a patient's medical report:

{chunks_text}

Based ONLY on the information provided above, please answer the following question:
{question}

If the answer cannot be determined from the provided context, say so clearly.
Be concise but thorough in your answer.
"""
        return prompt
    
    async def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """Call OpenAI API"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            payload = {
                "model": "gpt-4o",
                "messages": [{"role": "system", "content": "You are a helpful medical assistant."}, 
                             {"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 500
            }
            
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            return {
                "answer": result["choices"][0]["message"]["content"],
                "model": result["model"]
            }
    
    async def _call_anthropic(self, prompt: str) -> Dict[str, Any]:
        """Call Anthropic API"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01"
            }
            payload = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 500,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            }
            
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            return {
                "answer": result["content"][0]["text"],
                "model": result["model"]
            }
    
    async def answer_question(self, question: str, context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Answer a question based on context chunks using an LLM"""
        start_time = time.time()
        
        try:
            if not self.api_key:
                return {
                    "success": False,
                    "error": "No LLM API key configured",
                    "processing_time": 0
                }
            
            prompt = self._build_prompt(question, context_chunks)
            
            if self.provider == "openai":
                result = await self._call_openai(prompt)
            else:
                result = await self._call_anthropic(prompt)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "answer": result["answer"],
                "model": result["model"],
                "processing_time": round(processing_time, 2)
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"LLM query failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(processing_time, 2)
            }