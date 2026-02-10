import { useState, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Polyfill for Promise.try (required for Safari/older browsers)
// @ts-ignore - Promise.try is a new feature not in TypeScript yet
if (!Promise.try) {
  // @ts-ignore
  Promise.try = function(fn) {
    return new Promise((resolve) => resolve(fn()))
  }
}

// Set up PDF.js worker - using local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// Article and state types
interface Article {
  id: string
  title: string
  url: string
  source: string
  category: string
  addedAt?: number
  status?: 'unread' | 'reading' | 'read'
}

interface DeletedArticle extends Article {
  deletedAt: number
  notes: string
  text: string
}

type Notes = { [id: string]: string }
type ArticleTexts = { [id: string]: string }
type Summaries = { [id: string]: Summary }
type Analyses = { [id: string]: Analysis }
type DeletedArticles = DeletedArticle[]

interface Summary {
  tldr: string
  keyPoints: string[]
}

interface Analysis {
  mainClaim: string
  evidence: string[]
  assumptions: string[]
  biasFraming: { [word: string]: number }
  questions: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface ChatHistory {
  [articleId: string]: ChatMessage[]
}

// Text processing utilities
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in',
  'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the',
  'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with',
  'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 'would',
  'may', 'might', 'must', 'shall', 'were', 'been', 'being', 'has', 'having',
])

const BIAS_WORDS = new Set([
  'clearly', 'obviously', 'undeniably', 'certainly', 'definitely', 'absolutely',
  'devastated', 'outrageous', 'disgusting', 'amazing', 'fantastic', 'terrible',
  'horrible', 'wonderful', 'perfect', 'worst', 'best', 'never', 'always',
  'should', 'must', 'ought', 'crucially', 'shocking', 'stunning', 'alarming',
])

const EVIDENCE_KEYWORDS = ['because', 'therefore', 'thus', 'so', 'data', 'percent',
  'percent', 'study', 'research', 'found', 'reported', 'said', 'according',
  'showed', 'proved', 'evidence', 'report', 'analysis', '%']

function splitSentences(text: string): string[] {
  // Better sentence splitting that handles more cases
  const sentences = text
    .replace(/([.!?])\s*\n/g, '$1 ') // Handle newlines after punctuation
    .replace(/\n+/g, '. ') // Convert paragraph breaks to sentences
    .match(/[^.!?]+[.!?]+/g) || []
  
  return sentences
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 10 && /[a-zA-Z]/.test(s)) // Must have letters
}

function extractKeywords(text: string): Map<string, number> {
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  const freq = new Map<string, number>()
  words.forEach((w: string) => {
    if (!STOPWORDS.has(w) && w.length > 3) {
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  })
  return freq
}

function scoreSentence(sentence: string, keywords: Map<string, number>, position: number, totalSentences: number): number {
  const words = sentence.toLowerCase().match(/\b\w+\b/g) || []
  
  // Keyword frequency score
  const keywordScore = words.reduce((score: number, w: string) => score + (keywords.get(w) || 0), 0)
  
  // Position bonus (earlier sentences often more important)
  const positionBonus = (totalSentences - position) / totalSentences * 2
  
  // Length penalty (very short or very long sentences less important)
  const wordCount = words.length
  const lengthScore = wordCount >= 8 && wordCount <= 30 ? 2 : (wordCount >= 5 ? 1 : 0)
  
  // Named entities/numbers bonus (proper nouns, numbers often important)
  const hasNamedEntity = /[A-Z][a-z]+/.test(sentence)
  const hasNumber = /\d+/.test(sentence)
  const entityBonus = (hasNamedEntity ? 1 : 0) + (hasNumber ? 0.5 : 0)
  
  return keywordScore + positionBonus + lengthScore + entityBonus
}

function generateSummary(text: string): Summary {
  // Improved poetry detection
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const roughSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Multiple heuristics for poetry detection
  const avgWordsPerLine = words.length / (lines.length || 1)
  const avgWordsPerSentence = words.length / (roughSentences.length || 1)
  const hasShortLines = lines.filter(l => l.trim().split(/\s+/).length < 10).length / lines.length > 0.5
  const hasFrequentLineBreaks = lines.length > roughSentences.length * 1.5
  const hasPoetryWords = /\b(soul|heart|dream|sky|sea|night|light|love|time|wind|moon|sun)\b/i.test(text)
  
  // Consider it poetry if multiple conditions are met
  const poetryScore = [
    avgWordsPerLine < 12,
    avgWordsPerSentence > 20,
    hasShortLines,
    hasFrequentLineBreaks,
    hasPoetryWords
  ].filter(Boolean).length
  
  const isPoetry = poetryScore >= 3
  
  console.log('Poetry detection:', {
    lines: lines.length,
    sentences: roughSentences.length,
    avgWordsPerLine,
    avgWordsPerSentence,
    hasShortLines,
    hasFrequentLineBreaks,
    hasPoetryWords,
    poetryScore,
    isPoetry
  })
  
  if (isPoetry) {
    // Special handling for poetry
    const firstLine = lines[0]?.trim() || 'Untitled poem'
    const keyLines = lines.slice(0, Math.min(7, lines.length))
    
    return {
      tldr: `Poetry: ${firstLine}`,
      keyPoints: keyLines.map(line => line.trim())
    }
  }
  
  const sentences = splitSentences(text)
  if (sentences.length === 0) {
    return { tldr: 'No complete sentences found.', keyPoints: ['Try pasting an article with clear sentences.'] }
  }

  if (sentences.length === 1) {
    return { tldr: sentences[0], keyPoints: [sentences[0]] }
  }

  const keywords = extractKeywords(text)
  const scored = sentences.map((s: string, i: number) => ({ 
    sent: s, 
    score: scoreSentence(s, keywords, i, sentences.length), 
    idx: i 
  }))
  
  // Get top 5 sentences
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, sentences.length))
    .sort((a, b) => a.idx - b.idx) // Restore original order
  
  // TL;DR: Best sentence from first 30% of document
  const earlyLimit = Math.ceil(sentences.length * 0.3)
  const earlySentences = scored.filter(item => item.idx < earlyLimit)
  const tldr = earlySentences.length > 0 
    ? earlySentences.sort((a, b) => b.score - a.score)[0].sent
    : topSentences[0].sent

  const keyPoints = topSentences.map((item: any) => {
    // Don't truncate - keep full sentences for better readability
    return item.sent.length > 150 ? item.sent.substring(0, 150) + '...' : item.sent
  })
  
  return { tldr, keyPoints }
}

function generateAnalysis(text: string): Analysis {
  const fullSentences = splitSentences(text)
  
  // Improved poetry detection (same as in generateSummary)
  const textLines = text.split('\n').filter(l => l.trim().length > 0)
  const textWords = text.split(/\s+/).filter(w => w.length > 0)
  const textSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  const avgWordsPerLine = textWords.length / (textLines.length || 1)
  const avgWordsPerSentence = textWords.length / (textSentences.length || 1)
  const hasShortLines = textLines.filter(l => l.trim().split(/\s+/).length < 10).length / textLines.length > 0.5
  const hasFrequentLineBreaks = textLines.length > textSentences.length * 1.5
  const hasPoetryWords = /\b(soul|heart|dream|sky|sea|night|light|love|time|wind|moon|sun)\b/i.test(text)
  
  const poetryScore = [
    avgWordsPerLine < 12,
    avgWordsPerSentence > 20,
    hasShortLines,
    hasFrequentLineBreaks,
    hasPoetryWords
  ].filter(Boolean).length
  
  const isPoetry = poetryScore >= 3
  
  console.log('Poetry detection in analysis:', {
    lines: textLines.length,
    sentences: textSentences.length,
    avgWordsPerLine,
    avgWordsPerSentence,
    hasShortLines,
    hasFrequentLineBreaks,
    hasPoetryWords,
    poetryScore,
    isPoetry
  })
  
  if (isPoetry) {
    return {
      mainClaim: 'This appears to be poetry or creative writing.',
      evidence: ['Literary analysis not available for poetry.'],
      assumptions: ['Consider the emotional tone, imagery, and literary devices used.'],
      biasFraming: {},
      questions: [
        'What emotions does this piece evoke?',
        'What imagery or metaphors are used?',
        'What is the overall theme or message?',
        'How does the structure contribute to meaning?',
        'What is the speaker\'s perspective or voice?',
      ],
    }
  }
  
  if (fullSentences.length === 0) {
    return {
      mainClaim: 'No complete sentences found to analyze.',
      evidence: ['Try pasting text with clear sentence structure.'],
      assumptions: [],
      biasFraming: {},
      questions: ['Is this text formatted correctly?'],
    }
  }

  const keywords = extractKeywords(text)
  const scored = fullSentences.map((s: string, i: number) => ({ 
    sent: s, 
    score: scoreSentence(s, keywords, i, fullSentences.length), 
    idx: i 
  }))
  
  // Find main claim - look for thesis-like sentences
  const earlyLimit = Math.ceil(fullSentences.length * 0.3)
  const earlySentences = scored.filter(item => item.idx < earlyLimit)
  const bestEarlySentence = earlySentences.sort((a, b) => b.score - a.score)[0] || scored[0]
  const mainClaim = bestEarlySentence.sent

  // Find evidence with better detection
  const evidence = fullSentences.filter((s: string) => {
    const lower = s.toLowerCase()
    const hasEvidenceKeyword = EVIDENCE_KEYWORDS.some((kw: string) => lower.includes(kw))
    const hasStatistic = /\d+%|\d+\.\d+%|\d+ percent/i.test(s)
    const hasYear = /\b(19|20)\d{2}\b/.test(s)
    const hasCitation = /according to|reported|published|found that/i.test(s)
    return (hasEvidenceKeyword || hasStatistic || hasYear || hasCitation) && s.length > 20
  }).slice(0, 6)

  // Find assumptions with better detection
  const assumptions = fullSentences.filter((s: string) => {
    const hasAssumptionWord = /assume|belief|believe|suggest|imply|presume|suppose|if.*then|likely|probably|presumably/i.test(s)
    const hasModalVerb = /\b(should|must|ought|could|would|might|may)\b/i.test(s)
    return (hasAssumptionWord || hasModalVerb) && s.length > 20
  }).slice(0, 4)

  // Detect bias/loaded language
  const biasWords = new Map<string, number>()
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  words.forEach((w: string) => {
    if (BIAS_WORDS.has(w)) {
      biasWords.set(w, (biasWords.get(w) || 0) + 1)
    }
  })
  const biasFraming = Object.fromEntries(biasWords)

  // Generate contextual questions based on content
  const hasStatistics = /\d+%/.test(text)
  const hasQuotes = /"[^"]+"/.test(text)
  const hasMultipleSources = (text.match(/according to|said|stated/gi) || []).length > 2
  
  const questions = [
    'What is the source of this information and are they credible?',
    hasMultipleSources ? 'Are multiple perspectives and sources presented?' : 'Are there alternative viewpoints not mentioned?',
    hasStatistics ? 'Are the statistics presented with proper context?' : 'What evidence supports the main claim?',
    'Are there any logical fallacies or unsupported leaps in reasoning?',
    hasQuotes ? 'Are quotes used fairly and in context?' : 'What might be missing from this narrative?',
  ]

  return {
    mainClaim,
    evidence: evidence.length > 0 
      ? evidence.map((s: string) => s.length > 150 ? s.substring(0, 150) + '...' : s)
      : ['No clear evidence statements found. This may be opinion-based content.'],
    assumptions: assumptions.length > 0 
      ? assumptions.map((s: string) => s.length > 150 ? s.substring(0, 150) + '...' : s)
      : ['No explicit assumptions detected in the text.'],
    biasFraming,
    questions,
  }
}

// PDF extraction utility
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('   → extractTextFromPDF: START')
    console.log('   → File name:', file.name, 'Size:', file.size, 'bytes')
    
    console.log('   → Step 1: Reading file as ArrayBuffer...')
    const arrayBuffer = await file.arrayBuffer()
    console.log('   → ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes')
    
    console.log('   → Step 2: Creating PDF loading task...')
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    console.log('   → Loading task created:', loadingTask)
    
    console.log('   → Step 3: Waiting for PDF to load...')
    const pdf = await loadingTask.promise
    console.log('   → ✅ PDF loaded successfully! Pages:', pdf.numPages)
    
    let fullText = ''

    for (let i = 0; i < pdf.numPages; i++) {
      console.log(`   → Processing page ${i + 1}/${pdf.numPages}`)
      const page = await pdf.getPage(i + 1)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
      console.log(`   → Page ${i + 1} done, extracted ${pageText.length} chars`)
    }

    console.log('   → ✅ All pages processed! Total text length:', fullText.length)
    return fullText.trim()
  } catch (error) {
    console.error('   → ❌ PDF extraction error:', error)
    console.error('   → Error type:', error?.constructor?.name)
    console.error('   → Error message:', error instanceof Error ? error.message : String(error))
    console.error('   → Error stack:', error instanceof Error ? error.stack : 'N/A')
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
    throw new Error('Failed to extract text from PDF')
  }
}

// Tailwind CSS classes are now used throughout the component
// No inline styles object needed

const LS_KEY = 'newsAggregatorDataV1'
const LS_DELETED_KEY = 'newsAggregatorDeleted'

function getInitialData() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    articles: [] as Article[],
    notes: {} as Notes,
    articleTexts: {} as ArticleTexts,
    summaries: {} as Summaries,
    analyses: {} as Analyses,
    categories: ['General', 'Tech', 'World', 'Business', 'Sports', 'Other'],
  }
}

function getDeletedArticles(): DeletedArticles {
  try {
    const raw = localStorage.getItem(LS_DELETED_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function App() {
  // State
  const [articles, setArticles] = useState<Article[]>(() => getInitialData().articles)
  const [notes, setNotes] = useState<Notes>(() => getInitialData().notes)
  const [articleTexts, setArticleTexts] = useState<ArticleTexts>(() => getInitialData().articleTexts || {})
  const [summaries, setSummaries] = useState<Summaries>(() => getInitialData().summaries || {})
  const [analyses, setAnalyses] = useState<Analyses>(() => getInitialData().analyses || {})
  const [categories, setCategories] = useState<string[]>(() => getInitialData().categories)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [isLoadingPDF, setIsLoadingPDF] = useState<boolean>(false)

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatHistory>(() => {
    const saved = localStorage.getItem('reading-room-chat')
    return saved ? JSON.parse(saved) : {}
  })
  const [chatInput, setChatInput] = useState<string>('')
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false)
  const [showChatPanel, setShowChatPanel] = useState<boolean>(false)
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic' | 'ollama'>(() => {
    const saved = localStorage.getItem('reading-room-llm-provider')
    return (saved as any) || 'openai'
  })
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('reading-room-api-key') || ''
  })
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // New improvement states
  const [deletedArticles, setDeletedArticles] = useState<DeletedArticles>(() => getDeletedArticles())
  const [lastSaved, setLastSaved] = useState<number>(Date.now())
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'source'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'read' | 'hasNotes'>('all')
  const [undoToast, setUndoToast] = useState<{ show: boolean; article: DeletedArticle | null }>({ 
    show: false, 
    article: null 
  })
  const [showExportSuccess, setShowExportSuccess] = useState<boolean>(false)

  // Add article form
  const [form, setForm] = useState({
    title: '',
    url: '',
    source: '',
    category: categories[0] || '',
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ articles, notes, articleTexts, categories })
    )
    setLastSaved(Date.now())
  }, [articles, notes, articleTexts, categories])

  // Persist deleted articles
  useEffect(() => {
    localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deletedArticles))
  }, [deletedArticles])

  // Clean up old deleted articles (30 days)
  useEffect(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const cleaned = deletedArticles.filter(a => a.deletedAt > thirtyDaysAgo)
    if (cleaned.length !== deletedArticles.length) {
      setDeletedArticles(cleaned)
    }
  }, [deletedArticles])

  // Auto-hide undo toast after 10 seconds
  useEffect(() => {
    if (undoToast.show) {
      const timer = setTimeout(() => {
        setUndoToast({ show: false, article: null })
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [undoToast.show])

  // Auto-hide export success message after 3 seconds
  useEffect(() => {
    if (showExportSuccess) {
      const timer = setTimeout(() => {
        setShowExportSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showExportSuccess])

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('reading-room-chat', JSON.stringify(chatHistory))
  }, [chatHistory])

  // Persist LLM settings
  useEffect(() => {
    localStorage.setItem('reading-room-llm-provider', llmProvider)
    if (apiKey) {
      localStorage.setItem('reading-room-api-key', apiKey)
    }
  }, [llmProvider, apiKey])

  // Derived filtered and sorted articles
  const filteredArticles = articles
    .filter((a: Article) => {
      const matchesCategory = selectedCategory ? a.category === selectedCategory : true
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (notes[a.id] && notes[a.id].toLowerCase().includes(search.toLowerCase()))
      
      // Filter by status/notes
      if (filterBy === 'unread' && a.status !== 'unread' && a.status !== undefined) return false
      if (filterBy === 'read' && a.status !== 'read') return false
      if (filterBy === 'hasNotes' && !notes[a.id]) return false
      
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'source') return (a.source || '').localeCompare(b.source || '')
      // Default: sort by date (newest first)
      return (b.addedAt || 0) - (a.addedAt || 0)
    })

  // Add new article
  function handleAddArticle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    
    // Check for duplicates
    const duplicate = articles.find(a => a.url === form.url.trim())
    if (duplicate) {
      const confirm = window.confirm(
        `⚠️ You already saved this URL on ${new Date(duplicate.addedAt || 0).toLocaleDateString()}.\n\nAdd anyway?`
      )
      if (!confirm) return
    }
    
    const id = Date.now().toString()
    setArticles([
      { ...form, id, addedAt: Date.now(), status: 'unread' },
      ...articles,
    ])
    setForm({ ...form, title: '', url: '', source: '' })
  }

  // Add new category
  function handleAddCategory() {
    const name = prompt('New category name?')
    if (name && !categories.includes(name)) {
      setCategories([...categories, name])
    }
  }

  // Article selection
  function handleSelectArticle(id: string) {
    setSelectedArticleId(id)
  }

  // Notes update
  function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (!selectedArticleId) return
    setNotes({ ...notes, [selectedArticleId]: e.target.value })
  }

  // Article text update
  function handleArticleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (!selectedArticleId) return
    setArticleTexts({ ...articleTexts, [selectedArticleId]: e.target.value })
  }

  // Summarize
  function handleSummarize() {
    if (!selectedArticleId) return
    const text = articleTexts[selectedArticleId] || ''
    if (!text.trim()) {
      alert('Please paste article text first.')
      return
    }
    const summary = generateSummary(text)
    setSummaries({ ...summaries, [selectedArticleId]: summary })
  }

  // Analyze
  function handleAnalyze() {
    if (!selectedArticleId) return
    const text = articleTexts[selectedArticleId] || ''
    if (!text.trim()) {
      alert('Please paste article text first.')
      return
    }
    const analysis = generateAnalysis(text)
    setAnalyses({ ...analyses, [selectedArticleId]: analysis })
  }

  // Chat functions
  async function sendChatMessage() {
    if (!selectedArticleId || !chatInput.trim()) return
    
    const article = articles.find(a => a.id === selectedArticleId)
    if (!article) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: Date.now()
    }

    // Add user message to history
    const currentHistory = chatHistory[selectedArticleId] || []
    const updatedHistory = [...currentHistory, userMessage]
    setChatHistory({ ...chatHistory, [selectedArticleId]: updatedHistory })
    setChatInput('')
    setIsChatLoading(true)

    try {
      // Build context from article
      const articleText = articleTexts[selectedArticleId] || ''
      const articleNotes = notes[selectedArticleId] || ''
      const articleSummary = summaries[selectedArticleId]
      const articleAnalysis = analyses[selectedArticleId]

      let contextPrompt = `You are an intelligent assistant helping analyze news articles and research content.\n\n`
      contextPrompt += `Article Title: ${article.title}\n`
      contextPrompt += `Source: ${article.source}\n`
      contextPrompt += `Category: ${article.category}\n\n`
      
      if (articleText) {
        contextPrompt += `Full Article Text:\n${articleText.substring(0, 3000)}${articleText.length > 3000 ? '...' : ''}\n\n`
      }
      
      if (articleNotes) {
        contextPrompt += `User Notes:\n${articleNotes}\n\n`
      }
      
      if (articleSummary) {
        contextPrompt += `Summary:\nTL;DR: ${articleSummary.tldr}\nKey Points:\n${articleSummary.keyPoints.map(p => `- ${p}`).join('\n')}\n\n`
      }
      
      if (articleAnalysis) {
        contextPrompt += `Critical Analysis:\nMain Claim: ${articleAnalysis.mainClaim}\n`
        if (articleAnalysis.evidence.length > 0) {
          contextPrompt += `Evidence: ${articleAnalysis.evidence.slice(0, 2).join('; ')}\n`
        }
      }

      contextPrompt += `\nUser Question: ${userMessage.content}\n\nProvide a thoughtful, accurate response based on the article content and analysis.`

      let assistantResponse = ''

      // Call appropriate LLM provider
      if (llmProvider === 'openai') {
        assistantResponse = await callOpenAI(contextPrompt, currentHistory)
      } else if (llmProvider === 'anthropic') {
        assistantResponse = await callAnthropic(contextPrompt, currentHistory)
      } else if (llmProvider === 'ollama') {
        assistantResponse = await callOllama(contextPrompt, currentHistory)
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: Date.now()
      }

      setChatHistory({
        ...chatHistory,
        [selectedArticleId]: [...updatedHistory, assistantMessage]
      })
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}. Please check your API key and settings.`,
        timestamp: Date.now()
      }
      setChatHistory({
        ...chatHistory,
        [selectedArticleId]: [...updatedHistory, errorMessage]
      })
    } finally {
      setIsChatLoading(false)
    }
  }

  async function callOpenAI(prompt: string, history: ChatMessage[]): Promise<string> {
    if (!apiKey) throw new Error('OpenAI API key not configured')
    
    const messages = [
      { role: 'system', content: 'You are a helpful assistant analyzing news articles.' },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API request failed')
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async function callAnthropic(prompt: string, history: ChatMessage[]): Promise<string> {
    if (!apiKey) throw new Error('Anthropic API key not configured')
    
    const messages = [
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Anthropic API request failed')
    }

    const data = await response.json()
    return data.content[0].text
  }

  async function callOllama(prompt: string, history: ChatMessage[]): Promise<string> {
    try {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant analyzing news articles.' },
        ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt }
      ]

      console.log('🦙 Calling Ollama with', messages.length, 'messages')

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:latest',
          messages,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error('Ollama not running. Start with: ollama serve')
      }

      const data = await response.json()
      console.log('🦙 Ollama response:', data)
      
      // Ollama returns the response in data.message.content
      if (data.message && data.message.content) {
        return data.message.content
      }
      
      throw new Error('Invalid Ollama response format')
    } catch (error) {
      console.error('🦙 Ollama error:', error)
      throw error
    }
  }

  function clearChat() {
    if (!selectedArticleId) return
    if (!confirm('Clear chat history for this article?')) return
    const newHistory = { ...chatHistory }
    delete newHistory[selectedArticleId]
    setChatHistory(newHistory)
  }

  // Delete article with undo functionality
  function handleDeleteArticle(id: string) {
    const article = articles.find(a => a.id === id)
    if (!article) return
    
    // Confirmation dialog
    const confirmDelete = window.confirm(
      `⚠️ Delete "${article.title}"?\n\nYou'll have 10 seconds to undo this action.`
    )
    if (!confirmDelete) return

    // Save to deleted articles with all data
    const deletedArticle: DeletedArticle = {
      ...article,
      deletedAt: Date.now(),
      notes: notes[id] || '',
      text: articleTexts[id] || ''
    }
    
    setDeletedArticles([deletedArticle, ...deletedArticles])
    
    // Remove from active articles
    setArticles(articles.filter(a => a.id !== id))
    
    // Clear selection if this was selected
    if (selectedArticleId === id) {
      setSelectedArticleId(null)
    }
    
    // Show undo toast
    setUndoToast({ show: true, article: deletedArticle })
  }

  // Undo delete
  function handleUndoDelete() {
    if (!undoToast.article) return
    
    const article = undoToast.article
    
    // Restore article
    const restoredArticle: Article = {
      id: article.id,
      title: article.title,
      url: article.url,
      source: article.source,
      category: article.category,
      addedAt: article.addedAt,
      status: article.status
    }
    
    setArticles([restoredArticle, ...articles])
    
    // Restore notes and text
    if (article.notes) {
      setNotes({ ...notes, [article.id]: article.notes })
    }
    if (article.text) {
      setArticleTexts({ ...articleTexts, [article.id]: article.text })
    }
    
    // Remove from deleted
    setDeletedArticles(deletedArticles.filter(a => a.id !== article.id))
    
    // Hide toast
    setUndoToast({ show: false, article: null })
  }

  // Export all data
  function handleExportData() {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      articles,
      notes,
      articleTexts,
      summaries,
      analyses,
      categories,
      chatHistory
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `reading-room-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setShowExportSuccess(true)
  }

  // Format last saved time
  function getLastSavedText(): string {
    const seconds = Math.floor((Date.now() - lastSaved) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  // Handle PDF upload
  async function handlePDFUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    
    console.log('=== PDF UPLOAD DEBUG START ===')
    console.log('1. File selected:', file?.name, file?.size)
    console.log('2. Selected article ID:', selectedArticleId)
    console.log('3. PDF.js version:', pdfjsLib.version)
    console.log('4. Worker src:', pdfjsLib.GlobalWorkerOptions.workerSrc)
    
    if (!file) {
      console.log('ERROR: No file selected')
      return
    }
    
    if (!selectedArticleId) {
      alert('Please select an article first.')
      return
    }

    setIsLoadingPDF(true)
    console.log('5. Loading state set to TRUE')
    
    // Safety timeout - force reset after 30 seconds
    const timeoutId = setTimeout(() => {
      console.error('⏰ TIMEOUT: PDF upload took too long (30s), forcing reset')
      setIsLoadingPDF(false)
      alert('PDF upload timed out. Please try a smaller file or check the console for errors.')
    }, 30000)
    
    try {
      console.log('6. About to call extractTextFromPDF...')
      const extractedText = await extractTextFromPDF(file)
      console.log('7. ✅ PDF extraction SUCCESS! Text length:', extractedText.length)
      
      clearTimeout(timeoutId) // Cancel timeout on success
      
      setArticleTexts({ ...articleTexts, [selectedArticleId]: extractedText })
      console.log('8. Article text state updated')
      
      // Auto-summarize the extracted text
      const summary = generateSummary(extractedText)
      setSummaries({ ...summaries, [selectedArticleId]: summary })
      console.log('9. Summary generated')
      
      alert('PDF uploaded and summarized successfully!')
      console.log('10. ✅ UPLOAD COMPLETE')
    } catch (error) {
      clearTimeout(timeoutId) // Cancel timeout on error
      console.error('❌ PDF upload error:', error)
      alert(`Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.log('11. Finally block - resetting loading state to FALSE')
      setIsLoadingPDF(false)
      console.log('12. Loading state is now:', false)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
      console.log('=== PDF UPLOAD DEBUG END ===')
    }
  }

  // UI
  const selectedArticle = articles.find((a: Article) => a.id === selectedArticleId)
  const selectedSummary = selectedArticleId ? summaries[selectedArticleId] : null
  const selectedAnalysis = selectedArticleId ? analyses[selectedArticleId] : null

  return (
    <>
    <div className="flex h-screen font-sans bg-editorial-bg text-editorial-text">
      {/* Left: Categories/Sources */}
      <div className="flex flex-col flex-none w-[240px] bg-surface border-r border-editorial-border overflow-y-auto column">
        <div className="px-6 py-5 bg-surface-secondary border-b border-editorial-border shrink-0">
          <h1 className="text-editorial-title text-editorial-text font-semibold tracking-tight">Reading Room</h1>
          <p className="text-meta text-editorial-muted mt-1">Categories & Sources</p>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="text-meta mb-4 tracking-wide text-editorial-muted uppercase font-medium">Filter by Category</div>
          {categories.map((cat: string) => (
            <button
              key={cat}
              className={`block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-base cursor-pointer rounded-lg transition-all duration-200 font-normal mb-1 ${
                selectedCategory === cat
                  ? 'bg-accent-subtle text-accent font-medium border-l-2 border-accent'
                  : 'text-editorial-text hover:bg-surface-tertiary hover:text-accent-dark'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
          <button className="w-full mt-5 px-5 py-2.5 bg-[#25477E] text-white font-medium rounded-lg shadow-subtle transition-all duration-200 hover:bg-[#1d3660] hover:shadow-card" onClick={handleAddCategory}>
            + New Category
          </button>
          
          {/* Auto-save indicator */}
          <div className="mt-8 text-center">
            <div className="text-meta text-green-700 font-medium px-3 py-2 bg-green-50 rounded-lg inline-flex items-center gap-1.5 border border-green-200">
              <span className="text-green-600">✓</span> Saved {getLastSavedText()}
            </div>
          </div>
          
          {/* Export button */}
          <button className="btn-secondary w-full mt-3" onClick={handleExportData}>
            📥 Export All Data
          </button>
        </div>
      </div>

      {/* Middle: Article List */}
      <div className="flex flex-col flex-1 p-0 bg-surface overflow-y-auto column">
        <div className="px-6 py-5 bg-surface-secondary border-b border-editorial-border shrink-0">
          <h2 className="text-editorial-title text-editorial-text font-semibold tracking-tight">Articles</h2>
          <p className="text-meta text-editorial-muted mt-1">Your reading list</p>
        </div>
        <div className="p-6 flex-1 overflow-y-auto flex flex-col">
          <form className="mb-6 pb-6 border-b border-editorial-border" onSubmit={handleAddArticle}>
            <input
              className="input-field mb-3"
              placeholder="Article title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              className="input-field mb-3"
              placeholder="URL"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              required
            />
            <input
              className="input-field mb-3"
              placeholder="Source (optional)"
              value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })}
            />
            <select
              className="input-field mb-3"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="btn-primary w-full mt-0" type="submit">+ Add Article</button>
          </form>
          <input
            className="input-field mb-5"
            placeholder="🔍 Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          
          {/* Sort & Filter Controls */}
          <div className="flex gap-2 mb-4 items-center sort-filter-bar">
            <label className="text-meta text-editorial-muted font-medium">Sort:</label>
            <select
              className="flex-1 px-3 py-2 border border-editorial-border rounded-lg text-sm bg-surface text-editorial-text font-normal cursor-pointer transition-all duration-200 hover:border-accent/50"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              title="Sort by"
            >
              <option value="date">Date Added</option>
              <option value="title">Title</option>
              <option value="source">Source</option>
            </select>
            <label className="text-meta text-editorial-muted font-medium">Filter:</label>
            <select
              className="flex-1 px-3 py-2 border border-editorial-border rounded-lg text-sm bg-surface text-editorial-text font-normal cursor-pointer transition-all duration-200 hover:border-accent/50"
              value={filterBy}
              onChange={e => setFilterBy(e.target.value as any)}
              title="Filter by"
            >
              <option value="all">All Articles</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="hasNotes">Has Notes</option>
            </select>
          </div>
          
          <div className="flex-1">
            {filteredArticles.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">No articles found</div>
                <div className="empty-state-description">
                  Try adjusting your filters or add a new article above
                </div>
              </div>
            )}
            {filteredArticles.map((a: Article) => (
              <div
                key={a.id}
                className={`p-4 border border-editorial-border cursor-pointer transition-all duration-200 rounded-lg mb-2 article ${
                  selectedArticleId === a.id
                    ? 'bg-accent-subtle border-l-[3px] border-accent shadow-card'
                    : 'bg-surface hover:bg-surface-secondary hover:border-accent/30'
                }`}
              >
                <div onClick={() => handleSelectArticle(a.id)} className="cursor-pointer flex-1">
                  <div className="text-article-title text-editorial-text mb-2 leading-snug title-text">{a.title}</div>
                  <div className="text-meta text-editorial-muted flex items-center gap-2 mt-2">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dark hover:underline transition-colors">{a.source || 'Link'}</a>
                    <span className="text-editorial-muted">·</span>
                    <span className="text-xs bg-surface-tertiary text-editorial-muted rounded px-2 py-0.5 font-medium border border-editorial-border">{a.category}</span>
                  </div>
                </div>
                <button 
                  className="btn-destructive mt-3 text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteArticle(a.id)
                  }}
                  title="Delete article"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Notes/Analysis */}
      <div className="flex flex-col flex-1 p-0 bg-surface overflow-y-auto border-r-0 column lastColumn">
        <div className="px-6 py-5 bg-surface-secondary border-b border-editorial-border shrink-0">
          <h2 className="text-editorial-title text-editorial-text font-semibold tracking-tight">Analysis</h2>
          <p className="text-meta text-editorial-muted mt-1">Notes & insights</p>
        </div>
        {selectedArticle ? (
          <div className="p-6 flex-1 overflow-y-auto flex flex-col column-inner">
            <div className="mb-6 pb-6 border-b border-editorial-border">
              <h3 className="text-article-title text-editorial-text mb-2 leading-snug tracking-tight">{selectedArticle.title}</h3>
              <div className="text-meta text-editorial-muted flex items-center gap-2">
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dark hover:underline transition-colors">{selectedArticle.source || selectedArticle.url}</a>
                <span>·</span>
                <span className="text-xs bg-surface-tertiary text-editorial-muted rounded px-2 py-0.5 font-medium border border-editorial-border">{selectedArticle.category}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium text-editorial-text mb-3">Your Notes</label>
              <textarea
                className="w-full min-h-[100px] p-4 border border-editorial-border rounded-lg text-base mb-3 font-mono resize-y transition-all duration-200 bg-surface text-editorial-text leading-relaxed focus:border-accent focus:ring-2 focus:ring-accent/10"
                value={selectedArticleId ? notes[selectedArticleId] || '' : ''}
                onChange={handleNoteChange}
                placeholder="Write your thoughts and reflections here..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium text-editorial-text mb-3">Article Content</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                style={{ display: 'none' }}
                id="pdf-upload-input"
              />
              <button 
                className="btn-secondary mb-3 inline-flex items-center gap-2"
                onClick={() => document.getElementById('pdf-upload-input')?.click()}
                disabled={isLoadingPDF}
              >
                {isLoadingPDF ? '⏳ Processing...' : '📎 Upload PDF'}
              </button>
              <textarea
                className="w-full min-h-[140px] p-4 border border-editorial-border rounded-lg text-sm mb-3 font-mono resize-y transition-all duration-200 bg-surface-tertiary text-editorial-text leading-relaxed focus:border-accent focus:ring-2 focus:ring-accent/10"
                value={selectedArticleId ? articleTexts[selectedArticleId] || '' : ''}
                onChange={handleArticleTextChange}
                placeholder="Paste article text or upload a PDF to extract content..."
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button className="btn-primary flex-1" onClick={handleSummarize}>Summarize</button>
              <button className="btn-primary flex-1" onClick={handleAnalyze}>Analyze</button>
            </div>

            {selectedSummary && (
              <div className="mt-8 pt-6 border-t border-editorial-border">
                <h4 className="text-lg font-semibold mb-4 text-editorial-text">Summary</h4>
                <div className="text-base mb-4 px-4 py-3 bg-indigo-50 border-l-4 border-accent rounded text-editorial-text leading-relaxed italic">{selectedSummary.tldr}</div>
                <div className="font-medium text-base text-editorial-text mb-3 mt-5">Key Points</div>
                <ul className="space-y-2 ml-5">
                  {selectedSummary.keyPoints.map((pt, i) => (
                    <li key={i} className="text-sm text-editorial-text leading-relaxed list-disc">{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedAnalysis && (
              <div className="mt-8 pt-6 border-t border-editorial-border">
                <h4 className="text-lg font-semibold mb-4 text-editorial-text">Critical Analysis</h4>
                
                <div className="mb-5">
                  <div className="font-medium text-sm text-editorial-muted mb-2 uppercase tracking-wide">Main Claim</div>
                  <div className="text-sm leading-relaxed text-editorial-text bg-surface-secondary p-3 rounded border border-editorial-border">{selectedAnalysis.mainClaim}</div>
                </div>

                <div className="mb-5">
                  <div className="font-medium text-sm text-editorial-muted mb-2 uppercase tracking-wide">Supporting Evidence</div>
                  <ul className="space-y-2 ml-5">
                    {selectedAnalysis.evidence.map((e, i) => (
                      <li key={i} className="text-sm text-editorial-text leading-relaxed list-disc">{e}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-5">
                  <div className="font-medium text-sm text-editorial-muted mb-2 uppercase tracking-wide">Assumptions</div>
                  <ul className="space-y-2 ml-5">
                    {selectedAnalysis.assumptions.map((a, i) => (
                      <li key={i} className="text-sm text-editorial-text leading-relaxed list-disc">{a}</li>
                    ))}
                  </ul>
                </div>

                {Object.keys(selectedAnalysis.biasFraming).length > 0 && (
                  <div className="mb-5">
                    <div className="font-medium text-sm text-editorial-muted mb-2 uppercase tracking-wide">Loaded Language</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedAnalysis.biasFraming).map(([word, count]) => (
                        <span key={word} className="inline-block bg-amber-50 text-amber-800 px-2.5 py-1 rounded text-xs font-medium border border-amber-200">
                          {word} ×{count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="font-medium text-sm text-editorial-muted mb-2 uppercase tracking-wide">Critical Questions</div>
                  <ul className="space-y-2 ml-5">
                    {selectedAnalysis.questions.map((q, i) => (
                      <li key={i} className="text-sm text-editorial-text leading-relaxed list-disc">{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 flex-1 flex flex-col justify-center items-center text-center empty-state">
            <div className="text-5xl mb-5 opacity-30">📄</div>
            <div className="text-editorial-text text-base font-medium mb-2">No article selected</div>
            <div className="text-editorial-muted text-sm max-w-xs">Select an article from your reading list to view notes, summaries, and analysis.</div>
          </div>
        )}
      </div>
    </div>

    {/* Floating Chat Button */}
    {selectedArticleId && !showChatPanel && (
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white border-none text-2xl cursor-pointer shadow-card flex items-center justify-center z-[999] transition-all duration-200 floating-chat-button hover:bg-accent-dark hover:shadow-card-hover"
        onClick={() => setShowChatPanel(true)}
        title="Chat with AI about this article"
      >
        💬
      </button>
    )}

    {/* Chat Panel */}
    <div className={`fixed right-0 top-0 bottom-0 w-[420px] bg-surface shadow-[-4px_0_16px_rgba(0,0,0,0.08)] flex flex-col z-[1000] transition-transform duration-300 ease-in-out border-l border-editorial-border chat-panel ${showChatPanel ? '' : 'translate-x-full'}`}>
      <div className="px-6 py-5 bg-surface-secondary border-b border-editorial-border flex justify-between items-center shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-editorial-text tracking-tight">AI Assistant</h3>
          <p className="text-meta text-editorial-muted mt-0.5">Chat about this article</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-surface-tertiary border border-editorial-border text-editorial-text px-2.5 py-1.5 rounded cursor-pointer text-sm transition-all hover:bg-surface-secondary"
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowChatPanel(false)}
            className="bg-surface-tertiary border border-editorial-border text-editorial-text px-2.5 py-1.5 rounded cursor-pointer text-sm transition-all hover:bg-surface-secondary"
          >
            ✕
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-5 bg-surface-tertiary border-b border-editorial-border">
          <div className="mb-4">
            <label className="block text-sm font-medium text-editorial-text mb-2">LLM Provider</label>
            <select
              className="w-full px-3 py-2 border border-editorial-border rounded-lg text-sm bg-surface text-editorial-text font-normal cursor-pointer transition-all duration-200 hover:border-accent/50"
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value as any)}
            >
              <option value="openai">OpenAI (GPT-4o-mini)</option>
              <option value="anthropic">Anthropic (Claude Haiku)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>
          {llmProvider !== 'ollama' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-editorial-text mb-2">API Key</label>
              <input
                type="password"
                className="input-field"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter ${llmProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
              />
            </div>
          )}
          {llmProvider === 'ollama' && (
            <div className="text-xs text-editorial-muted mt-2">
              Make sure Ollama is running: <code className="bg-surface-tertiary px-1.5 py-0.5 rounded">ollama serve</code>
            </div>
          )}
          <button
            onClick={clearChat}
            className="btn-error w-full"
          >
            🗑️ Clear Chat History
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3.5 bg-surface-tertiary">
        {selectedArticleId && chatHistory[selectedArticleId]?.length > 0 ? (
          chatHistory[selectedArticleId].map((msg) => (
            <div
              key={msg.id}
              className={`px-4.5 py-3.5 rounded-xl max-w-[85%] break-words leading-relaxed text-sm shadow-[0_2px_6px_rgba(0,0,0,0.05)] ${
                msg.role === 'user'
                  ? 'self-end bg-accent text-white ml-auto font-normal rounded-lg rounded-br-sm'
                  : 'self-start bg-surface-secondary text-editorial-text mr-auto border border-editorial-border rounded-lg rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <div className="text-center text-editorial-muted py-12 px-6">
            <div className="text-4xl mb-4 opacity-40">💬</div>
            <div className="text-sm font-medium mb-2">Start a conversation</div>
            <div className="text-xs">
              Ask questions about the article:
              <ul className="text-left mt-3 space-y-1.5 text-editorial-muted max-w-xs mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>What's the main argument?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>What evidence supports this?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Any logical fallacies?</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        {isChatLoading && (
          <div className="self-start bg-surface-secondary text-editorial-text mr-auto border border-editorial-border px-4 py-3 rounded-lg max-w-[85%] break-words leading-relaxed text-sm shadow-subtle">
            <span className="opacity-60 flex items-center gap-2">
              <span className="loading-spinner inline-block"></span>
              Thinking...
            </span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-editorial-border flex gap-2 shrink-0 bg-surface">
        <textarea
          className="flex-1 px-4 py-2.5 border border-editorial-border rounded-lg text-sm resize-none font-sans transition-all duration-200 bg-surface min-h-[44px] max-h-[120px] focus:border-accent focus:ring-2 focus:ring-accent/10"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendChatMessage()
            }
          }}
          placeholder="Ask about this article..."
          rows={2}
          disabled={isChatLoading || !selectedArticleId}
        />
        <button
          className="btn-primary px-4 py-2.5 whitespace-nowrap disabled:opacity-50"
          onClick={sendChatMessage}
          disabled={isChatLoading || !chatInput.trim()}
        >
          {isChatLoading ? '⏳' : 'Send'}
        </button>
      </div>
    </div>
    
    {/* Undo Delete Toast */}
    {undoToast.show && undoToast.article && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-editorial-border text-editorial-text px-6 py-4 rounded-lg shadow-card flex items-center gap-4 z-[1001] text-sm">
        <span className="font-normal">Deleted "{undoToast.article.title.substring(0, 40)}{undoToast.article.title.length > 40 ? '...' : ''}"</span>
        <button className="btn-primary px-4 py-1.5 text-sm" onClick={handleUndoDelete}>
          Undo
        </button>
        <button 
          className="text-editorial-muted hover:text-editorial-text transition-colors"
          onClick={() => setUndoToast({ show: false, article: null })}
        >
          ✕
        </button>
      </div>
    )}
    
    {/* Export Success Toast */}
    {showExportSuccess && (
      <div className="fixed top-6 right-6 bg-green-50 border border-green-200 text-green-800 px-5 py-3.5 rounded-lg shadow-card z-[1002] text-sm font-medium flex items-center gap-2">
        <span className="text-green-600">✓</span>
        <span>Data exported successfully</span>
      </div>
    )}
    </>
  )
}

export default App
