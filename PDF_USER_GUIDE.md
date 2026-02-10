# 📎 PDF Upload Feature - User Guide

## Overview
You can now upload PDF files directly to extract text and automatically generate summaries!

## Step-by-Step Instructions

### 1. Add an Article
First, create an article entry in the middle column:
```
Title: Renewable Energy Report 2026
URL: https://example.com/report
Source: Energy Institute
Category: Tech
```
Click "**+ Add Article**"

### 2. Select the Article
Click on the article from the list to open it in the **Analysis Panel** (right column)

### 3. Upload PDF
Look for the **📄 Article Content** section in the Analysis Panel.

You'll see a new button:
```
┌─────────────────────────┐
│   📎 Upload PDF         │
└─────────────────────────┘
```

Click this button to open your file picker.

### 4. Choose Your PDF
Select any `.pdf` file from your computer.

### 5. Processing
The button will change to show loading:
```
┌─────────────────────────┐
│   ⏳ Uploading PDF...   │
└─────────────────────────┘
```

Wait 2-3 seconds (depends on PDF size).

### 6. Success!
You'll see:
- ✅ Success alert: "PDF uploaded and summarized successfully!"
- 📄 Full extracted text in the "Article Content" textarea
- 📋 Automatic summary appears below with:
  - **TL;DR**: Most important sentence
  - **5 Key Points**: Top sentences from the document

### 7. Deep Analysis (Optional)
After upload, you can click:
- **🔬 Deep Analyze** for critical analysis
  - Main claim identification
  - Evidence extraction
  - Assumption detection
  - Bias/loaded language detection

## What Happens Behind the Scenes

```
PDF File (upload)
    ↓
Extract Text (all pages)
    ↓
Populate Article Content textarea
    ↓
Auto-generate Summary
    ↓
Display TL;DR + Key Points
```

## Features

✅ **Multi-page support** - Extracts from all PDF pages
✅ **Auto-summary** - No need to click "Summarize" button
✅ **Editable text** - You can edit extracted text if needed
✅ **No backend** - Everything runs in your browser
✅ **Privacy-first** - PDF never leaves your computer
✅ **Fast processing** - Results in 2-3 seconds

## Error Handling

### "Please select an article first"
→ You must select an article from the list before uploading

### "Failed to extract text from PDF"
→ The PDF might be:
- Password-protected
- Image-based (scanned) without OCR
- Corrupted
- Try a different PDF or paste text manually

### No button visible
→ Make sure you've selected an article from the middle column

## Alternative: Manual Text Paste

If you prefer not to upload PDFs or the PDF extraction fails:
1. Open your PDF in any viewer
2. Copy the text (Cmd+A, Cmd+C)
3. Paste into the "Article Content" textarea
4. Click "⚡ Summarize" manually

## Tips

💡 **Best Practice**: Upload PDFs for long documents to avoid manual copying
💡 **Editing**: You can edit the extracted text before analyzing
💡 **Re-upload**: Upload a new PDF to replace previous content
💡 **Persistence**: Extracted text is saved automatically to localStorage

## Technical Notes

- **Format**: Only `.pdf` files accepted
- **Size**: Works best with PDFs under 10MB
- **Pages**: No page limit (all pages extracted)
- **Text-based**: Requires text-based PDFs (not scanned images)
- **Browser**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

---

**Need Help?** Check console for detailed error messages if upload fails.
