# Reading Room - Personal News Aggregator 📚

A news aggregator MVP with intelligent article management, note-taking, PDF upload, and **AI-powered chat** for discussing articles. Built with React, TypeScript, and Vite.

## ✨ Features

### 📰 Article Management
- Add articles with title, URL, source, and category
- Organize articles by custom categories
- **Sort** by date/title/source
- **Filter** by status (unread/read/has notes)
- Search across article titles and notes
- **Delete with undo** (10-second window)
- **Export all data** to JSON
- Persistent storage (localStorage)

### ✍️ Note-Taking
- Personal notes for each article
- Rich textarea for annotations
- Auto-saved to localStorage

### 📄 PDF Upload & Text Extraction
- **Upload PDF files** directly from the browser
- **Auto-extract text** from all PDF pages
- **Auto-generate summaries** immediately after upload
- No backend required - runs entirely in the browser

### 💬 AI Chat Assistant (NEW!)
- **Context-aware AI** that knows your article content, notes, and analysis
- **Multiple LLM providers**: OpenAI, Anthropic Claude, or local Ollama
- **Persistent chat history** saved per article
- **Smart integration** with summaries and critical analysis
- Ask questions, get insights, and discuss articles with AI
- **See guide**: [AI_CHAT_FEATURE.md](./AI_CHAT_FEATURE.md) or [PDF_USER_GUIDE.md](./PDF_USER_GUIDE.md)

### 🤖 Intelligent Text Analysis

#### Summarization (Rule-Based)
- **TL;DR**: Extract the most important early sentence
- **5-7 Key Points**: Top sentences scored by multiple factors
- **Poetry detection**: Special handling for creative writing
- Enhanced sentence scoring with position, length, entities, numbers
- Stopword filtering and keyword extraction

#### Critical Analysis
- **Main Claim**: Identify the primary thesis
- **Evidence**: Extract sentences with statistics, citations, data
- **Assumptions**: Detect implicit assumptions and modal verbs
- **Bias Detection**: Identify loaded language (20+ bias words)
- **Critical Questions**: Contextual questions adapted to content
- **Poetry-aware**: Literary questions for creative writing

### 🎨 Professional UI
- Three-column responsive layout
- Purple gradient theme (#6366f1 → #8b5cf6) + Green chat (#10b981)
- Smooth transitions and hover effects
- Floating chat button
- Slide-in chat panel
- System font typography
- Emoji icons for visual clarity

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📖 How to Use

1. **Add Categories**: Create custom categories (Tech, Business, Sports, etc.)
2. **Add Articles**: Enter article title, URL, source, and category
3. **Select Article**: Click an article to view in the Analysis Panel
4. **Add Notes**: Write personal annotations in the "Your Notes" section
5. **Upload PDF or Paste Text**: 
   - Click "📎 Upload PDF" to extract text from a PDF file
   - OR paste article text manually in "Article Content"
6. **Analyze**: 
   - Click "⚡ Summarize" for TL;DR and key points
   - Click "🔬 Deep Analyze" for critical analysis
7. **Chat with AI**:
   - Click the floating **💬** button to open AI chat
   - Configure your LLM provider (OpenAI, Claude, or Ollama)
   - Ask questions about the article
8. **Organize**:
   - Use sort dropdown (date/title/source)
   - Use filter dropdown (all/unread/read/has notes)
   - Delete articles (with 10s undo window)
   - Export all data to JSON backup

## 📚 User Guides

- **[START_HERE.md](./START_HERE.md)** - Quick start guide for new users
- **[AI_CHAT_FEATURE.md](./AI_CHAT_FEATURE.md)** - Complete AI chat setup
- **[PDF_USER_GUIDE.md](./PDF_USER_GUIDE.md)** - PDF upload instructions
- **[TOP_5_IMPROVEMENTS_COMPLETE.md](./TOP_5_IMPROVEMENTS_COMPLETE.md)** - Feature deep-dive
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - QA testing guide

## 💬 AI Chat Quick Setup

### Option 1: OpenAI (Recommended)
```bash
# Get API key from: https://platform.openai.com/api-keys
# Cost: ~$0.0005 per message (very cheap!)
```
1. Click 💬 button → ⚙️ settings
2. Select "OpenAI"
3. Paste API key
4. Start chatting!

### Option 2: Ollama (Free & Local)
```bash
# Install Ollama
brew install ollama  # macOS

# Start server
ollama serve

# Pull a model
ollama pull llama3.2:latest
```
1. Click 💬 button → ⚙️ settings
2. Select "Ollama (Local)"
3. No API key needed!

**Full setup guide**: [AI_CHAT_FEATURE.md](./AI_CHAT_FEATURE.md)
