# 💬 AI Chat Feature - Complete Guide

## Overview
Your reading room now has an **AI-powered chat assistant** that can discuss articles, analyze content, and answer questions based on your notes and summaries!

## Features

✅ **Context-Aware**: AI has access to article text, notes, summaries, and analysis
✅ **Multiple Providers**: OpenAI, Anthropic Claude, or local Ollama
✅ **Persistent History**: Chat conversations saved per article
✅ **Privacy-First**: API keys stored locally, chat history never sent to external servers
✅ **Smart Integration**: AI references your summaries and critical analysis

---

## Quick Start

### 1. Open Chat Panel
- Select any article from your list
- Click the floating **💬** button in the bottom-right corner
- Chat panel slides in from the right

### 2. Configure LLM Provider (First Time)
Click the **⚙️** gear icon to open settings:

**Option A: OpenAI (Recommended for beginners)**
- Select "OpenAI (GPT-4o-mini)"
- Enter your OpenAI API key
- Get key from: https://platform.openai.com/api-keys

**Option B: Anthropic Claude**
- Select "Anthropic (Claude Haiku)"
- Enter your Anthropic API key
- Get key from: https://console.anthropic.com/

**Option C: Ollama (Free, Local)**
- Select "Ollama (Local)"
- No API key needed
- Requires Ollama running locally (see setup below)

### 3. Start Chatting!
Type your question and press Enter or click **📤**

Example questions:
- "What's the main argument of this article?"
- "Does the evidence support the claims?"
- "Are there any logical fallacies?"
- "Compare this to my notes"
- "Summarize the key points in simple terms"
- "What questions should I ask about this?"

---

## LLM Provider Setup

### OpenAI Setup

**Cost**: ~$0.15 per 1M tokens (very cheap!)

1. Go to https://platform.openai.com/signup
2. Create account (requires phone verification)
3. Add payment method ($5 minimum)
4. Generate API key: https://platform.openai.com/api-keys
5. Copy key and paste into Reading Room settings
6. Click ⚙️ → paste key → close settings

**Model Used**: `gpt-4o-mini` (fast and affordable)

---

### Anthropic Claude Setup

**Cost**: ~$0.25 per 1M tokens

1. Go to https://console.anthropic.com/
2. Create account
3. Add payment method
4. Generate API key
5. Paste into Reading Room settings

**Model Used**: `claude-3-haiku-20240307` (fast and cost-effective)

---

### Ollama Setup (Free & Local!)

**Cost**: FREE (runs on your computer)

**Requirements**:
- macOS, Linux, or Windows
- 8GB+ RAM recommended
- ~4GB disk space for models

**Installation**:

```bash
# Install Ollama
brew install ollama  # macOS
# or download from: https://ollama.ai/

# Start Ollama server
ollama serve

# In another terminal, pull a model
ollama pull llama3.2:latest  # 2GB, recommended
# or
ollama pull llama3.1:8b      # 4.7GB, more powerful
# or
ollama pull mistral:latest   # 4.1GB, alternative
```

**Using in Reading Room**:
1. Make sure `ollama serve` is running
2. Select "Ollama (Local)" in settings
3. No API key needed!
4. Chat works offline

---

## What Context Does the AI Have?

When you send a message, the AI receives:

📄 **Article Details**:
- Title, source, category
- Full article text (up to 3000 chars)

📝 **Your Notes**:
- All notes you've written for this article

📊 **Summaries** (if generated):
- TL;DR sentence
- Key points list

🔍 **Critical Analysis** (if generated):
- Main claim
- Evidence found
- Detected assumptions
- Bias/loaded language

💬 **Recent Chat History**:
- Last 6 messages for continuity

**Total Context**: ~3500-4000 words per message

---

## Features & Usage

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in input

### Chat Management
- **Clear Chat**: Click ⚙️ → "🗑️ Clear Chat History"
- **Switch Articles**: Chat history is separate per article
- **Close Panel**: Click ✕ or click floating button again

### Smart Features

**1. Reference Your Work**
Ask: *"What did I write in my notes about this?"*
AI: *"In your notes, you mentioned concern about the statistical methodology..."*

**2. Compare Analysis**
Ask: *"Does the author's evidence support their main claim?"*
AI uses your generated analysis to provide detailed answers

**3. Follow-up Questions**
The AI remembers the last 6 messages for context:
- You: "What's the main claim?"
- AI: "The article claims renewable energy is more cost-effective..."
- You: "What evidence supports that?" ← AI knows "that" = previous claim

**4. Request Different Formats**
- "Explain this like I'm 5"
- "Give me bullet points"
- "Write this as a tweet"
- "What would a skeptic say?"

---

## Privacy & Security

✅ **API Keys**: Stored in browser localStorage, never sent anywhere except to chosen LLM provider
✅ **Chat History**: Stored locally, not uploaded to any server
✅ **Article Content**: Only sent to LLM when you ask a question
✅ **No Tracking**: No analytics, no data collection
✅ **Local Option**: Use Ollama for 100% offline, private AI

**Delete Your Data**:
- Chat History: ⚙️ → Clear Chat History (per article)
- API Keys: Clear browser localStorage or paste new key
- All Data: Browser Settings → Clear Site Data

---

## Limitations

### Token Limits
- **OpenAI**: 500 tokens per response (~375 words)
- **Anthropic**: 500 tokens per response
- **Ollama**: Unlimited (depends on your RAM)

### Context Window
- Only last 6 messages included
- Article text truncated to 3000 chars
- For longer articles, upload PDF or paste full text

### Rate Limits
- **OpenAI**: 3 requests/min (free tier), 3500/min (paid)
- **Anthropic**: Similar limits
- **Ollama**: No limits (local)

### Not Included
- ❌ Cross-article analysis (can only discuss current article)
- ❌ Web search or external data
- ❌ Real-time information
- ❌ Image analysis (text only)

---

## Troubleshooting

### "Error: OpenAI API key not configured"
→ Click ⚙️ and enter your API key

### "Error: Failed to get response"
→ Check your internet connection
→ Verify API key is correct
→ Check you have credits/payment method on OpenAI/Anthropic

### "Error: Ollama not running"
→ Run `ollama serve` in terminal
→ Make sure port 11434 is not blocked
→ Try: `curl http://localhost:11434/api/tags`

### Chat button not visible
→ Select an article first from the middle column

### AI gives generic answers
→ Make sure article text is pasted/uploaded
→ Generate summary/analysis first
→ Be specific in your questions

### Slow responses
→ OpenAI/Claude: Usually 2-5 seconds
→ Ollama: 5-30 seconds depending on model size and hardware

---

## Cost Estimation

### OpenAI (gpt-4o-mini)
- **Input**: $0.15 per 1M tokens
- **Output**: $0.60 per 1M tokens
- **Average Chat**: ~1500 input + 400 output tokens
- **Cost per message**: ~$0.00047 (less than a cent!)
- **100 messages**: ~$0.05

### Anthropic (Claude Haiku)
- **Input**: $0.25 per 1M tokens
- **Output**: $1.25 per 1M tokens
- **Average Chat**: ~1500 input + 400 output tokens
- **Cost per message**: ~$0.00088
- **100 messages**: ~$0.09

### Ollama (Local)
- **Cost**: $0 (FREE!)
- **Tradeoff**: Slower, requires good hardware, offline-only

**Recommendation**: Start with OpenAI (cheapest), try Ollama if you want free/offline.

---

## Example Conversations

### Example 1: Understanding Arguments
**You**: What's the main argument of this article?

**AI**: Based on the analysis, the main claim is: "Renewable energy costs have dropped 89% since 2010, making it cheaper than fossil fuels." The article supports this with evidence from IRENA data showing solar costs fell from $378/MWh to $40/MWh.

---

### Example 2: Critical Analysis
**You**: Are there any biases or loaded language?

**AI**: Yes, the analysis detected several instances of loaded language including "revolutionary" (3×), "devastating" (2×), and "breakthrough" (2×). This suggests positive framing toward renewable energy. The article also uses absolutist terms like "never" and "always" which may oversimplify complex issues.

---

### Example 3: Personal Notes
**You**: What should I add to my notes?

**AI**: Based on your existing notes about methodology concerns, you might want to add:
1. Question about sample size (article doesn't specify)
2. Compare with the IEA report you mentioned
3. Note the geographic limitations (data only from OECD countries)

---

### Example 4: Simplification
**You**: Explain the key findings in simple terms

**AI**: In plain English: Solar panels got way cheaper over the last 15 years. They used to cost about $380 per unit of electricity, now they cost $40. This means solar is now actually cheaper than coal or gas in most places.

---

## Best Practices

✅ **Generate Analysis First**: Run "Deep Analyze" before chatting for better context
✅ **Be Specific**: Instead of "thoughts?", ask "what evidence supports claim X?"
✅ **Use Follow-ups**: Build on previous questions for deeper insights
✅ **Reference Notes**: Ask AI to compare article with your notes
✅ **Request Formats**: Ask for bullet points, summaries, or explanations
✅ **Fact-Check**: Remember AI can make mistakes, verify important claims

❌ **Don't Expect**: Real-time data, web search, cross-article synthesis
❌ **Don't Ask About**: Other articles (context is current article only)
❌ **Don't Share**: Sensitive API keys or private information

---

## Technical Details

### Architecture
```
User Question
    ↓
Build Context (article + notes + analysis)
    ↓
Send to LLM Provider API
    ↓
Receive Response
    ↓
Display in Chat + Save to localStorage
```

### API Endpoints
- **OpenAI**: `https://api.openai.com/v1/chat/completions`
- **Anthropic**: `https://api.anthropic.com/v1/messages`
- **Ollama**: `http://localhost:11434/api/chat`

### Data Storage
- Chat history: `localStorage['reading-room-chat']`
- API key: `localStorage['reading-room-api-key']`
- Provider: `localStorage['reading-room-llm-provider']`

---

## Future Enhancements (Potential)

🔮 **Coming Soon** (maybe):
- Voice input/output
- Export chat transcripts
- Cross-article discussions
- Custom system prompts
- Streaming responses (word-by-word)
- Chat history search
- Conversation branching
- Multi-language support

---

## Support

**Issues?**
1. Check browser console (F12) for error details
2. Verify API key and provider settings
3. Test with simple question: "Hello"
4. Try different provider (OpenAI vs Ollama)

**Questions?**
- OpenAI Docs: https://platform.openai.com/docs
- Anthropic Docs: https://docs.anthropic.com
- Ollama Docs: https://github.com/ollama/ollama

---

## Quick Reference

| Feature | OpenAI | Anthropic | Ollama |
|---------|--------|-----------|--------|
| Cost | ~$0.0005/msg | ~$0.001/msg | FREE |
| Speed | 2-5s | 2-5s | 5-30s |
| Offline | ❌ | ❌ | ✅ |
| Setup | Easy | Easy | Medium |
| Privacy | Cloud | Cloud | Local |
| Quality | Excellent | Excellent | Good |

**Recommended**: Start with OpenAI, switch to Ollama if privacy/cost is a concern.

---

**Enjoy chatting with your AI reading assistant!** 🎉
