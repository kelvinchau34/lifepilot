import io
import time
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import re
import logging
import os  # Missing import for os

logger = logging.getLogger(__name__)

# Configure Tesseract path for macOS
TESSERACT_PATHS = [
    "/opt/homebrew/bin/tesseract",  # Apple Silicon Homebrew
    "/usr/local/bin/tesseract",     # Intel Homebrew
    "/usr/bin/tesseract"            # Linux default
]

for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

class OCRProcessor:
    def __init__(self):
        self.min_text_threshold = 50  # Minimum characters to skip OCR
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove null characters
        text = text.replace('\x00', ' ')
        # Normalize whitespace
        text = re.sub(r'[ \t]+', ' ', text)
        # Limit consecutive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
    
    def extract_from_pdf(self, pdf_bytes: bytes) -> tuple[str, int]:
        """Extract text from PDF using PyMuPDF, fallback to OCR for image-heavy pages"""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            all_text = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # First try direct text extraction
                page_text = page.get_text().strip()
                
                # If page has little text, it might be an image - use OCR
                if len(page_text) < self.min_text_threshold:
                    logger.info(f"Page {page_num + 1} has little text, running OCR...")
                    
                    # Render page as image
                    pix = page.get_pixmap(dpi=300, alpha=False)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # Run OCR
                    ocr_text = pytesseract.image_to_string(img, config='--oem 3 --psm 6')
                    page_text = ocr_text.strip()
                
                all_text.append(page_text)
            
            doc.close()
            
            # Combine all pages
            combined_text = self.clean_text('\n\n--- PAGE BREAK ---\n\n'.join(all_text))
            return combined_text, len(all_text)
            
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise
    
    def extract_from_image(self, image_bytes: bytes) -> str:
        """Extract text from image using Tesseract OCR"""
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Use Tesseract with medical-optimized config
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/:;()[]{}+-=<>%$@#&*!?"\' '
            
            text = pytesseract.image_to_string(img, config=custom_config)
            return self.clean_text(text)
            
        except Exception as e:
            logger.error(f"Image OCR failed: {e}")
            raise
    
    async def process_file(self, file_content: bytes, filename: str, mime_type: str) -> dict:
        """Main processing function"""
        start_time = time.time()
        
        try:
            # Determine file type and process accordingly
            if mime_type == "application/pdf" or filename.lower().endswith('.pdf'):
                text, pages = self.extract_from_pdf(file_content)
            elif mime_type.startswith('image/') or any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']):
                text = self.extract_from_image(file_content)
                pages = 1
            else:
                # Try PDF first, fallback to image
                try:
                    text, pages = self.extract_from_pdf(file_content)
                except:
                    text = self.extract_from_image(file_content)
                    pages = 1
            
            processing_time = time.time() - start_time
            
            if not text or len(text.strip()) < 10:
                raise ValueError("No meaningful text extracted from document")
            
            return {
                "success": True,
                "text": text,
                "pages": pages,
                "char_count": len(text),
                "processing_time": round(processing_time, 2)
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"OCR processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(processing_time, 2)
            }