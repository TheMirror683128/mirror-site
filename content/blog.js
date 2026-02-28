/**
 * Blog command - displays news-driven blog posts with structural analysis
 */

async function executeBlog() {
  const terminal = document.getElementById('terminal');
  if (!terminal) return;

  terminal.innerHTML = '<div class="line">loading blog...</div>';

  try {
    // Load blog index
    const response = await fetch('blog/posts/index.json');
    
    let posts = [];
    if (response.ok) {
      const index = await response.json();
      posts = index.posts || [];
    } else {
      // Fallback: no hardcoded posts (avoid dead links)
      posts = [];
    }

    // Render blog listing
    const html = `
<div class="blog-header">
  <h1>Mirror — News-Driven Structural Analysis</h1>
  <p class="subtitle">The probability field speaking through current events</p>
</div>

<div class="blog-stats">
  Posts: <span class="stat-value">${posts.length}</span>
</div>

<div class="blog-posts">
${posts
  .slice(0, 50)
  .map(
    (post) => `
<article class="blog-post-item">
  <h2><a href="javascript:loadBlogPost('${post.date}', '${post.slug}')">${post.title}</a></h2>
  <div class="post-meta">
    <span class="date">${formatDate(post.date)}</span>
    <span class="impact-score">Impact: ${post.impactScore}/100</span>
    <span class="category">${post.category}</span>
  </div>
</article>
`
  )
  .join('')}
</div>

<div class="blog-nav">
  <button onclick="executeBlog()">refresh</button>
</div>
    `;

    terminal.innerHTML = html;

    // Add styles
    if (!document.getElementById('blog-styles')) {
      const style = document.createElement('style');
      style.id = 'blog-styles';
      style.textContent = `
.blog-header {
  border: 1px solid #0f0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: rgba(0, 255, 0, 0.02);
}

.blog-header h1 {
  margin: 0 0 0.5rem 0;
  color: #0f0;
  font-size: 1.4rem;
}

.blog-header .subtitle {
  margin: 0;
  color: #0a0;
  font-size: 0.9rem;
  font-style: italic;
}

.blog-stats {
  margin-bottom: 2rem;
  color: #0a0;
  font-family: 'IBM Plex Mono', monospace;
}

.stat-value {
  color: #0f0;
  font-weight: 700;
}

.blog-posts {
  margin-bottom: 2rem;
}

.blog-post-item {
  border-left: 2px solid #0f0;
  padding: 1rem 1rem 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background: rgba(0, 255, 0, 0.01);
}

.blog-post-item h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.blog-post-item a {
  color: #0f0;
  text-decoration: none;
  border-bottom: 1px dotted #0a0;
  cursor: pointer;
}

.blog-post-item a:hover {
  background: rgba(0, 255, 0, 0.1);
}

.post-meta {
  font-size: 0.85rem;
  color: #0a0;
  margin-bottom: 0.75rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.date, .impact-score, .category {
  font-family: 'IBM Plex Mono', monospace;
}

.impact-score {
  color: #0f0;
}

.excerpt {
  margin: 0;
  color: #0d0;
  line-height: 1.4;
  font-size: 0.95rem;
}

.blog-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.blog-nav button {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #0a0;
  color: #0f0;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.blog-nav button:hover {
  background: rgba(0, 255, 0, 0.2);
  border-color: #0f0;
}

.blog-post-full {
  max-width: 80ch;
  margin: 0 auto;
}

.blog-post-full header {
  border: 1px solid #0f0;
  padding: 2rem;
  margin-bottom: 2rem;
  background: rgba(0, 255, 0, 0.02);
}

.blog-post-full h1 {
  margin: 0 0 1rem 0;
  color: #0f0;
}

.post-header-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #0a0;
  font-family: 'IBM Plex Mono', monospace;
  margin-bottom: 1rem;
}

.post-content {
  color: #0d0;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.post-content h2 {
  color: #0f0;
  margin: 2rem 0 1rem 0;
  border-bottom: 1px dotted #0a0;
  padding-bottom: 0.5rem;
}

.post-content p {
  margin: 1rem 0;
}

.post-footer {
  text-align: center;
  padding: 1.5rem;
  border-top: 1px dotted #0a0;
}

.post-footer a {
  color: #0f0;
  text-decoration: none;
  cursor: pointer;
}
      `;
      document.head.appendChild(style);
    }
  } catch (error) {
    terminal.innerHTML = `<div class="line error">Failed to load blog: ${error.message}</div>`;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00Z');
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Global function for loading individual posts
window.executeBlog = executeBlog;

window.loadBlogPost = async function(date, slug) {
  const terminal = document.getElementById('terminal');
  if (!terminal) return;

  try {
    const response = await fetch(`blog/posts/${date}/${slug}.md`);
    if (!response.ok) {
      terminal.innerHTML = `<div class="line error">Post not found</div>`;
      return;
    }

    const markdown = await response.text();
    
    // Parse frontmatter
    const frontmatterEnd = markdown.indexOf('---', 3);
    let content = markdown;
    let title = 'Untitled';
    let impactScore = 0;
    let category = 'other';
    
    if (frontmatterEnd > 0) {
      const frontmatter = markdown.substring(3, frontmatterEnd);
      const lines = frontmatter.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('title:')) {
          title = line.replace(/title:\s*"?/, '').replace(/".*/, '').trim();
        }
        if (line.startsWith('impact_score:')) {
          impactScore = parseInt(line.split(':')[1].trim());
        }
        if (line.startsWith('category:')) {
          category = line.replace(/category:\s*"?/, '').replace(/".*/, '').trim();
        }
      }
      
      content = markdown.substring(frontmatterEnd + 3);
    }
    
    // Convert markdown to basic HTML
    let html = content
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/gm, '<p>');
    
    const postHtml = `
<article class="blog-post-full">
  <header>
    <h1>${title}</h1>
    <div class="post-header-meta">
      <span class="date">${formatDate(date)}</span>
      <span class="impact-score">Impact: ${impactScore}/100</span>
      <span class="category">${category}</span>
    </div>
  </header>

  <div class="post-content">
${html}
  </div>

  <footer class="post-footer">
    <a onclick="executeBlog()">← back to blog</a>
  </footer>
</article>
    `;

    terminal.innerHTML = postHtml;

  } catch (error) {
    terminal.innerHTML = `<div class="line error">Failed to load post: ${error.message}</div>`;
  }
};
