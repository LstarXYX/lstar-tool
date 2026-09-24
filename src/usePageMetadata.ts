import { useEffect } from 'react'
import type { PageMetadata } from './data/site'

const setMetaContent = (selector: string, content: string) => {
  const element = document.head.querySelector<HTMLMetaElement>(selector)
  if (element) element.content = content
}

export function usePageMetadata(metadata: PageMetadata) {
  useEffect(() => {
    document.title = metadata.title
    setMetaContent('meta[name="description"]', metadata.description)
    setMetaContent('meta[name="keywords"]', metadata.keywords)
    setMetaContent('meta[property="og:title"]', metadata.title)
    setMetaContent('meta[property="og:description"]', metadata.description)
    setMetaContent('meta[property="og:url"]', metadata.canonical)
    setMetaContent('meta[name="twitter:title"]', metadata.title)
    setMetaContent('meta[name="twitter:description"]', metadata.description)
    setMetaContent('meta[name="twitter:url"]', metadata.canonical)

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = metadata.canonical

    const schema = document.getElementById('page-structured-data')
    if (schema) schema.textContent = JSON.stringify(metadata.structuredData)
  }, [metadata])
}
