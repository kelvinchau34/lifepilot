import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging

# Import our OCR and NER services
from .services.ocr_service import OCRProcessor
from .services.ner_processor import NERProcessor
from .services.embedding_service import EmbeddingService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Health AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ocr_processor = OCRProcessor()
ner_processor = NERProcessor()
embedding_service = EmbeddingService()

# Response models
class OCRResponse(BaseModel):
    success: bool
    text: Optional[str] = None
    pages: Optional[int] = None
    char_count: Optional[int] = None
    processing_time: float
    error: Optional[str] = None

class Entity(BaseModel):
    text: str
    label: str
    confidence: float
    start: int
    end: int

class NERResponse(BaseModel):
    success: bool
    entities: Optional[List[dict]] = None
    entity_count: Optional[int] = None
    entity_groups: Optional[dict] = None
    processing_time: float
    error: Optional[str] = None

class TextRequest(BaseModel):
    text: str

class EmbeddingRequest(BaseModel):
    text: str
    split_into_chunks: bool = True

class EmbeddingResponse(BaseModel):
    success: bool
    embeddings: Optional[List[List[float]]] = None
    chunk_count: Optional[int] = None
    chunks: Optional[List[str]] = None
    processing_time: float
    error: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    documents: List[str]
    top_k: int = 3

class SearchResult(BaseModel):
    index: int
    document: str
    similarity: float

class SearchResponse(BaseModel):
    success: bool
    results: Optional[List[SearchResult]] = None
    processing_time: float
    error: Optional[str] = None

@app.get("/health")
def health_check():
    return {
        "status": "OK", 
        "service": "health-ai",
        "version": app.version,
        "capabilities": ["OCR", "Medical NER", "Document Processing"]
    }

@app.post("/api/ocr/process", response_model=OCRResponse)
async def process_document(file: UploadFile = File(...)):
    """Extract text from PDF or image files using OCR"""
    
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Read file content
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Process with OCR
    result = await ocr_processor.process_file(
        file_content=content,
        filename=file.filename or "unknown",
        mime_type=file.content_type or "application/octet-stream"
    )
    
    if not result["success"]:
        raise HTTPException(status_code=422, detail=result.get("error", "Processing failed"))
    
    return OCRResponse(**result)

@app.post("/api/ner/extract", response_model=NERResponse)
async def extract_entities(request: TextRequest):
    """Extract medical entities from text"""
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short or empty")
    
    result = await ner_processor.extract_entities(request.text)
    
    if not result["success"]:
        raise HTTPException(
            status_code=422, 
            detail=result.get("error", "Entity extraction failed")
        )
    
    return result

@app.post("/api/embeddings/generate", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """Generate vector embeddings for text"""
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short or empty")
    
    result = await embedding_service.get_embeddings(
        request.text, 
        split_into_chunks=request.split_into_chunks
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=422, 
            detail=result.get("error", "Embedding generation failed")
        )
    
    return result

@app.post("/api/embeddings/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search for similar documents using embeddings"""
    if not request.query or len(request.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query too short or empty")
    
    if not request.documents or len(request.documents) == 0:
        raise HTTPException(status_code=400, detail="No documents provided for search")
    
    result = await embedding_service.search_similar(
        request.query,
        request.documents,
        top_k=min(request.top_k, len(request.documents))
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=422, 
            detail=result.get("error", "Semantic search failed")
        )
    
    return result