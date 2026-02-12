import express from 'express'
import cors from 'cors'
import { extract } from '@extractus/article-extractor'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Helper function to strip HTML tags and clean text
function stripHtml(html: string): string {
  if (!html) return ''
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ')
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  // Remove any remaining HTML entities
  text = text.replace(/&[a-z]+;/gi, '')
  
  return text
}

// SSRF Protection: Reject localhost and private IP ranges
function isPrivateOrLocalIP(hostname: string): boolean {
  // Check for localhost variations
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true
  }
  
  // Check for private IP ranges
  const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|127\.)/
  if (privateIPRegex.test(hostname)) {
    return true
  }
  
  return false
}

interface FetchArticleResponse {
  url: string
  title: string
  content: string
  byline?: string
  siteName?: string
}

app.post('/api/article/fetch', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Only allow http/https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'Only HTTP and HTTPS protocols are allowed' })
    }

    // SSRF Protection
    if (isPrivateOrLocalIP(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Access to private/local addresses is forbidden' })
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      // Use Promise.race to implement timeout
      const articlePromise = extract(url)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const article = await Promise.race([articlePromise, timeoutPromise]) as any

      clearTimeout(timeoutId)

      if (!article) {
        return res.status(404).json({ error: 'Could not extract article content' })
      }

      // Clean the content by stripping HTML tags
      const rawContent = article.content || article.description || ''
      const cleanContent = stripHtml(rawContent)

      const response: FetchArticleResponse = {
        url: url,
        title: article.title || 'Untitled',
        content: cleanContent,
        byline: article.author || undefined,
        siteName: article.source || undefined,
      }

      return res.json(response)
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.message === 'Request timeout' || error.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timeout - article took too long to fetch' })
      }
      
      throw error
    }
  } catch (error: any) {
    console.error('Error fetching article:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch article',
      details: error.message 
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
