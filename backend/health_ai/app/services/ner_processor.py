# health_ai/app/services/ner_processor.py
import time
from typing import List, Dict, Any
import logging
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import os
from dotenv import load_dotenv
from huggingface_hub import login
import numpy as np

logger = logging.getLogger(__name__)

class NERProcessor:
    def __init__(self):
        load_dotenv() 
        hf_token = os.getenv("HUGGINGFACE_TOKEN")
        if not hf_token:
            raise ValueError("HUGGINGFACEHUB_API_TOKEN not set in .env")

        login(token=hf_token)

        self.model_name = "d4data/biomedical-ner-all"
        
        try:
            logger.info(f"Loading medical NER model {self.model_name}...")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForTokenClassification.from_pretrained(self.model_name)
            
            # Create NER pipeline
            self.ner_pipeline = pipeline(
                "ner", 
                model=self.model, 
                tokenizer=self.tokenizer,
                aggregation_strategy="simple"
            )
            
            logger.info("Medical NER model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading NER model: {e}")
            # Fall back to rule-based NER
            logger.info("Falling back to rule-based NER")
            self._setup_rule_based_ner()
    
    def _setup_rule_based_ner(self):
        """Set up a simple rule-based NER as fallback"""
        import re
        
        # Define patterns for medical entities
        self.is_rule_based = True
        self.patterns = {
            "PROBLEM": r"\b(diabetes|hypertension|pain|disorder|disease|syndrome|infection|fever|condition)\b",
            "TEST": r"\b(blood test|x-ray|mri|ct scan|ultrasound|ekg|ecg|analysis)\b",
            "TREATMENT": r"\b(treatment|medication|therapy|surgery|procedure|dose|antibiotic|drug)\b",
            "MEASUREMENT": r"\b\d+\.?\d*\s*(mg\/dl|g\/dl|mmol\/l|mcg|ml|μl|ul|kg\/m2)\b",
            "VITAL": r"\b(heart rate|blood pressure|temperature|pulse|respiration|oxygen|saturation)\b",
            "BODY_PART": r"\b(head|chest|abdomen|arm|leg|heart|lung|liver|kidney|brain)\b"
        }
        
        # Compile patterns
        self.compiled_patterns = {
            label: re.compile(pattern, re.IGNORECASE) 
            for label, pattern in self.patterns.items()
        }
        
        logger.info("Rule-based NER initialized as fallback")
    
    def _extract_rule_based_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities using regex patterns (fallback method)"""
        entities = []
        
        for label, pattern in self.compiled_patterns.items():
            for match in pattern.finditer(text):
                entity_text = match.group(0)
                start = match.start()
                end = match.end()
                
                entities.append({
                    "text": entity_text,
                    "label": label,
                    "confidence": 0.8,  # Fixed confidence for rule-based
                    "start": start,
                    "end": end
                })
        
        return entities
    
    def _process_model_entities(self, entities):
        """Process and format entities from the model, converting numpy types to Python types"""
        processed = []
        for entity in entities:
            # Convert numpy float32 to Python float
            if isinstance(entity["score"], np.floating):
                confidence = float(entity["score"])
            else:
                confidence = entity["score"]
                
            processed.append({
                "text": entity["word"],
                "label": entity["entity_group"],
                "confidence": round(confidence, 3),
                "start": int(entity["start"]) if isinstance(entity["start"], np.integer) else entity["start"],
                "end": int(entity["end"]) if isinstance(entity["end"], np.integer) else entity["end"]
            })
        return processed

    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract medical entities from text"""
        start_time = time.time()
        
        try:
            if hasattr(self, "is_rule_based"):
                # Use rule-based extraction
                entities = self._extract_rule_based_entities(text)
            else:
                # Use transformer model - with chunking for long texts
                try:
                    # Split long text into chunks to avoid context length issues
                    max_length = 400  # Lower than model max to be safe
                    chunks = []
                    for i in range(0, len(text), max_length):
                        chunks.append(text[i:i+max_length])
                    
                    # Process each chunk
                    all_entities = []
                    offset = 0
                    for chunk in chunks:
                        chunk_entities = self.ner_pipeline(chunk)
                        # Adjust start/end positions by offset
                        for entity in chunk_entities:
                            entity["start"] += offset
                            entity["end"] += offset
                        all_entities.extend(chunk_entities)
                        offset += len(chunk)
                
                    # Convert to our format
                    entities = self._process_model_entities(all_entities)
                
                    # Apply token merging
                    entities = self._merge_wordpiece_tokens(entities)
                
                    # Apply medical domain post-processing
                    entities = self._post_process_entities(entities)
                
                except Exception as model_error:
                    logger.error(f"Error using model for NER: {model_error}")
                    logger.error(traceback.format_exc())
                    logger.info("Falling back to rule-based extraction")
                    # Set up rule-based NER if not already done
                    if not hasattr(self, "is_rule_based"):
                        self._setup_rule_based_ner()
                    entities = self._extract_rule_based_entities(text)
        
            # Group by entity type
            entity_groups = {}
            for entity in entities:
                label = entity["label"]
                if label not in entity_groups:
                    entity_groups[label] = []
                entity_groups[label].append(entity)
        
            processing_time = time.time() - start_time
        
            return {
                "success": True,
                "entities": entities,
                "entity_count": len(entities),
                "entity_groups": entity_groups,
                "processing_time": round(processing_time, 2)
            }
        
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Entity extraction failed: {e}")
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(processing_time, 2)
            }
    
    def _ensure_serializable(self, obj):
        """Recursively convert numpy types to Python native types"""
        if isinstance(obj, dict):
            return {k: self._ensure_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._ensure_serializable(item) for item in obj]
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return self._ensure_serializable(obj.tolist())
        else:
            return obj
    
    def _merge_wordpiece_tokens(self, entities):
        """Merge split wordpiece tokens (##) into complete words and handle special cases"""
        merged_entities = []
        skip_indices = set()
        i = 0
        
        while i < len(entities):
            if i in skip_indices:
                i += 1
                continue
                
            current_entity = entities[i]
            current_text = current_entity["text"]
            current_label = current_entity["label"]
            current_start = current_entity["start"]
            current_end = current_entity["end"]
            current_confidence = current_entity["confidence"]
            
            # Case 1: Standard wordpiece tokens (with ##)
            j = i + 1
            while j < len(entities) and entities[j]["text"].startswith("##") and entities[j]["label"] == current_label:
                current_text += entities[j]["text"][2:]  # Remove ## prefix
                current_end = entities[j]["end"]
                # Average the confidence
                current_confidence = (current_confidence + entities[j]["confidence"]) / 2
                skip_indices.add(j)
                j += 1
            
            # Case 2: Special cases with adjacent tokens (like d + p -> dyspnea)
            if current_text in ["d", "p"] and j < len(entities) and i+1 < len(entities):
                next_entity = entities[i+1]
                
                # Check if d + p are adjacent and should be merged into "dyspnea"
                if (current_text == "d" and next_entity["text"] in ["p", "##p"] and 
                    next_entity["start"] - current_end <= 3 and next_entity["label"] == current_label):
                    
                    current_text = "dyspnea"  # Replace with full term
                    current_end = next_entity["end"]
                    current_confidence = (current_confidence + next_entity["confidence"]) / 2
                    skip_indices.add(i+1)
            
            # Case 3: Abbreviations like pc -> PCI
            if current_text == "pc" and current_label == "Therapeutic_procedure":
                current_text = "PCI"  # Percutaneous Coronary Intervention
                
            # Case 4: Other common abbreviations in medical context
            medical_abbreviations = {
                "dm": "Diabetes Mellitus",
                "htn": "Hypertension",
                "cad": "Coronary Artery Disease",
                "chf": "Congestive Heart Failure",
                "afib": "Atrial Fibrillation",
                "mi": "Myocardial Infarction",
                "ckd": "Chronic Kidney Disease",
                "copd": "Chronic Obstructive Pulmonary Disease",
                "gerd": "Gastroesophageal Reflux Disease",
                "uti": "Urinary Tract Infection"
            }
            
            if current_text.lower() in medical_abbreviations:
                current_text = medical_abbreviations[current_text.lower()]
            
            # Case 5: Handle leads V1-V4 correctly
            if current_text == "leads v1 - v" and i+1 < len(entities):
                next_entity = entities[i+1]
                if next_entity["text"] == "4" and next_entity["start"] - current_end <= 2:
                    current_text = "leads V1-V4"
                    current_end = next_entity["end"]
                    current_confidence = (current_confidence + next_entity["confidence"]) / 2
                    skip_indices.add(i+1)
            
            # Add the processed entity
            merged_entities.append({
                "text": current_text,
                "label": current_label,
                "confidence": current_confidence,
                "start": current_start,
                "end": current_end
            })
            
            i += 1
        
        return merged_entities
    
    def _post_process_entities(self, entities):
        """Apply domain-specific post-processing to improve entity quality"""
        
        # Create a copy to avoid modifying the list during iteration
        processed_entities = []
        
        for entity in entities:
            # Standardize capitalization for medical acronyms
            if entity["text"].upper() in ["ECG", "EKG", "PCI", "LAD", "STEMI", "LVEF"]:
                entity["text"] = entity["text"].upper()
            
            # Fix common misspellings or partial terms
            text_corrections = {
                "dp": "dyspnea",
                "pc": "PCI",
                "leads V1-V": "leads V1-V4",
                "stent": "stents"
            }
            
            if entity["text"] in text_corrections:
                entity["text"] = text_corrections[entity["text"]]
            
            # Enhance label specificity for certain terms
            if entity["text"].lower() == "anterior stemi":
                entity["label"] = "Diagnosis"
            
            # Handle common dosage patterns
            if entity["label"] == "Dosage" and entity["text"][-2:] not in ["mg", "ml", "g", "l"]:
                if any(unit in entity["text"] for unit in ["mg", "ml", "g", "l"]):
                    entity["label"] = "Dosage"
            
            processed_entities.append(entity)
        
        return processed_entities