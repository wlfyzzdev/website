class BlogManager {
  constructor() {
    this.blogPostsList = document.querySelector('[data-blog-posts-list]');
    this.modalContainer = document.querySelector('[data-modal-container]');
    this.modalCloseBtn = document.querySelector('[data-modal-close-btn]');
    this.overlay = document.querySelector('[data-overlay]');
    this.modalTitle = document.querySelector('[data-modal-title]');
    this.modalMeta = document.querySelector('[data-modal-meta]');
    this.modalText = document.querySelector('[data-modal-text]');
    
    this.isMarkedLoaded = typeof marked !== 'undefined';
    this.posts = [];
    this.init();
  }

  async init() {
    if (!this.isMarkedLoaded) {
      await this.waitForMarked();
    }
    
    await this.loadBlogPosts();
    this.setupModalEvents();
    this.setupRouterEvents();
  }

  waitForMarked() {
    return new Promise((resolve) => {
      const checkMarked = () => {
        if (typeof marked !== 'undefined') {
          this.isMarkedLoaded = true;
          resolve();
        } else {
          setTimeout(checkMarked, 100);
        }
      };
      checkMarked();
    });
  }

  async loadBlogPosts() {
    try {
      const response = await fetch('./blog/posts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.posts = await response.json();
      
      this.renderBlogPosts(this.posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      this.showErrorMessage('Error loading blog posts: ' + error.message);
    }
  }

  renderBlogPosts(posts) {
    if (!this.blogPostsList) {
      console.error('Blog posts list element not found');
      return;
    }

    this.blogPostsList.innerHTML = '';
    
    posts.forEach(post => {
      const blogItem = this.createBlogPostElement(post);
      this.blogPostsList.appendChild(blogItem);
    });
  }

  createBlogPostElement(post) {
    const li = document.createElement('li');
    li.className = 'blog-post-item';
    
    const imageUrl = post.image 
      ? `./assets/images/${post.image}`
      : `./assets/images/blog-${post.slug}.jpg`;
    
    li.innerHTML = `
      <a href="#" data-blog-post="${post.slug}" class="blog-post-link">
        <figure class="blog-banner-box">
          <img src="${imageUrl}" alt="${post.title}" loading="lazy" 
               onerror="this.src='./assets/images/avatar.png'; this.style.filter='brightness(0.7)';">
        </figure>
        <div class="blog-content">
          <div class="blog-meta">
            <p class="blog-category">${post.category}</p>
            <span class="dot"></span>
            <time datetime="${post.date}">${this.formatDate(post.date)}</time>
          </div>
          <h3 class="h3 blog-item-title">${post.title}</h3>
          <p class="blog-text">${post.excerpt}</p>
        </div>
      </a>
    `;

    const link = li.querySelector('.blog-post-link');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.openBlogPost(post);
    });

    return li;
  }

  async loadBlogPost(post) {
    try {
      const response = await fetch(`./blog/${post.file}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawMarkdown = await response.text();
      
      const markdown = this.stripFrontMatter(rawMarkdown);
      
      let html;
      if (this.isMarkedLoaded && typeof marked !== 'undefined') {
        html = marked.parse(markdown);
      } else {
        html = `<pre style="white-space: pre-wrap; font-family: inherit;">${this.escapeHtml(markdown)}</pre>`;
      }
      
      this.showBlogModal(post, html);
    } catch (error) {
      console.error('Error loading blog post:', error);
      this.showBlogModal(post, `<p>Sorry, this blog post could not be loaded.</p><p>Error: ${error.message}</p>`);
    }
  }

  stripFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    return content.replace(frontMatterRegex, '').trim();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  openBlogPost(post) {
    // Update URL when opening blog post
    if (window.router) {
      window.router.navigateToBlogPost(post.file);
    }
    this.loadBlogPost(post);
  }

  showBlogModal(post, content) {
    if (!this.modalContainer) {
      console.error('Modal container not found');
      return;
    }

    if (this.modalTitle) {
      this.modalTitle.textContent = post.title;
    }
    
    if (this.modalMeta) {
      this.modalMeta.innerHTML = `
        <span class="blog-category">${post.category}</span>
        <span class="dot"></span>
        <time datetime="${post.date}">${this.formatDate(post.date)}</time>
      `;
    }
    
    if (this.modalText) {
      this.modalText.innerHTML = content;
    }

    this.modalContainer.classList.add('active');
    if (this.overlay) {
      this.overlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  setupModalEvents() {
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeBlogModal();
      });
    }
    
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.closeBlogModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalContainer && this.modalContainer.classList.contains('active')) {
        this.closeBlogModal();
      }
    });
  }

  closeBlogModal() {
    if (this.modalContainer) {
      this.modalContainer.classList.remove('active');
    }
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
    
    // Update URL to remove file parameter when closing modal
    if (window.router) {
      window.router.updateURL('blog');
      window.router.currentBlogPost = null;
    }
  }

  setupRouterEvents() {
    // Listen for router events to load specific blog posts
    document.addEventListener('loadBlogPost', (e) => {
      const { filename } = e.detail;
      this.loadBlogPostByFilename(filename);
    });
  }

  loadBlogPostByFilename(filename) {
    const post = this.posts.find(p => p.file === filename);
    if (post) {
      this.loadBlogPost(post);
    } else {
      console.error(`Blog post not found: ${filename}`);
    }
  }



  formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  showErrorMessage(message = 'Unable to load blog posts') {
    if (!this.blogPostsList) return;
    
    this.blogPostsList.innerHTML = `
      <li class="blog-post-item">
        <div class="blog-content">
          <h3 class="h3 blog-item-title">Failed to load blog post's</h3>
          <p class="blog-text">Please try again later.</p>
        </div>
      </li>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
  });
} else {
  new BlogManager();
}
