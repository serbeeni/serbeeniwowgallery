interface BlogHeaderProps {
  title: string
  descriptionHtml: string | null
}

export function BlogHeader({ title, descriptionHtml }: BlogHeaderProps) {
  return (
    <header className="blog-header" id="topAnchor">
      <div className="blog-title">
        <h1>
          <a href="/">{title}</a>
        </h1>
      </div>
      {descriptionHtml && (
        <div
          className="blog-description blog-bio"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}
    </header>
  )
}
