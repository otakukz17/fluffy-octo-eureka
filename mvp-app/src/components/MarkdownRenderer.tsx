"use client"

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-indigo mt-8 max-w-none prose-h2:mt-8 prose-pre:mt-4">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
    </article>
  )
}
