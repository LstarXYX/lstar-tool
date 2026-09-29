import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import mammoth from 'mammoth'
import TurndownService from 'turndown'

export type DocumentFormat = 'markdown' | 'docx' | 'pdf' | 'html'
export type ConversionDefinition = {
  id: string
  from: DocumentFormat
  to: DocumentFormat
  label: string
  inputLabel: string
  available: boolean
  accept: string
  run?: (input: File | string) => Promise<{ blob: Blob; filename: string }>
}

const markdownToDocx = async (input: File | string) => {
  const markdown = typeof input === 'string' ? input : await input.text()
  const paragraphs = markdown.split(/\r?\n/).map((line) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) return new Paragraph({ heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6][heading[1].length - 1], children: [new TextRun(heading[2])] })
    const list = line.match(/^[-*+]\s+(.+)$/)
    if (list) return new Paragraph({ bullet: { level: 0 }, children: [new TextRun(list[1])] })
    return new Paragraph({ children: [new TextRun(line)] })
  })
  const blob = await Packer.toBlob(new Document({ sections: [{ children: paragraphs }] }))
  return { blob, filename: 'lstar-converted.docx' }
}

const docxToMarkdown = async (input: File | string) => {
  if (typeof input === 'string') throw new Error('Word 转换需要上传 DOCX 文件。')
  const { value } = await mammoth.convertToHtml({ arrayBuffer: await input.arrayBuffer() })
  const markdown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' }).turndown(value).trim()
  return { blob: new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), filename: input.name.replace(/\.docx$/i, '') + '.md' }
}

export const documentConversions: ConversionDefinition[] = [
  { id: 'markdown-docx', from: 'markdown', to: 'docx', label: 'Markdown 转 Word', inputLabel: '粘贴 Markdown 或上传 .md 文件', available: true, accept: '.md,text/markdown,text/plain', run: markdownToDocx },
  { id: 'markdown-pdf', from: 'markdown', to: 'pdf', label: 'Markdown 转 PDF', inputLabel: '粘贴 Markdown 或上传 .md 文件', available: false, accept: '.md,text/markdown,text/plain' },
  { id: 'markdown-html', from: 'markdown', to: 'html', label: 'Markdown 转 HTML', inputLabel: '粘贴 Markdown 或上传 .md 文件', available: false, accept: '.md,text/markdown,text/plain' },
  { id: 'docx-markdown', from: 'docx', to: 'markdown', label: 'Word 转 Markdown', inputLabel: '上传 .docx 文件', available: true, accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', run: docxToMarkdown },
  { id: 'docx-pdf', from: 'docx', to: 'pdf', label: 'Word 转 PDF', inputLabel: '上传 .docx 文件', available: false, accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
]
