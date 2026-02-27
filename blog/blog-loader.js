async function loadPosts() {
  try {
    const container = document.getElementById('posts-container');
    
    // Scan for markdown files
    const response = await fetch('../api/blog/index');
    if (!response.ok) {
      container.innerHTML = '<div class="line error">Failed to load posts</div>';
      return;
    }
    
    const index = await response.json();
    
    if (!index.posts || index.posts.length === 0) {
      container.innerHTML = '<div class="line">No posts available yet</div>';
      return;
    }
    
    let html = '';
    for (const post of index.posts) {
      html += `
        <div class="post-item">
          <h2><a href="posts/${post.date}/${post.slug}.html">${post.title}</a></h2>
          <div class="post-meta">${post.date} | Impact: ${post.impactScore} | ${post.category}</div>
          <p>${post.excerpt}</p>
        </div>
      `;
    }
    
    container.innerHTML = html;
  } catch (error) {
    document.getElementById('posts-container').innerHTML = 
      `<div class="line error">Error: ${error.message}</div>`;
  }
}

loadPosts();
