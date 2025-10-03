'use strict';

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
}
if (overlay) {
  overlay.addEventListener("click", testimonialsModalFunc);
}

const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) {
      selectValue.innerText = this.innerText;
    }
    if (select) {
      elementToggleFunc(select);
    }
    filterFunc(selectedValue);

  });
}

const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

if (filterBtn.length > 0) {
  let lastClickedBtn = filterBtn[0];

  for (let i = 0; i < filterBtn.length; i++) {

    filterBtn[i].addEventListener("click", function () {

      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) {
        selectValue.innerText = this.innerText;
      }
      filterFunc(selectedValue);

      lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;

    });

  }
}

const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// URL Router Class
class URLRouter {
  constructor() {
    this.navigationLinks = document.querySelectorAll("[data-nav-link]");
    this.pages = document.querySelectorAll("[data-page]");
    this.currentPage = 'about';
    this.currentBlogPost = null;
    
    this.init();
  }

  init() {
    // Handle initial URL
    this.handleInitialURL();
    
    // Setup navigation event listeners
    this.setupNavigation();
    
    // Listen for browser back/forward
    window.addEventListener('popstate', (e) => {
      this.handleURLChange(false);
    });
  }

  handleInitialURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || this.getPageFromHash() || 'about';
    const blogFile = urlParams.get('file');
    
    if (page === 'blog' && blogFile) {
      // Navigate to blog page first, then load specific post
      this.navigateToPage('blog', false);
      // Delay to ensure blog manager is initialized
      setTimeout(() => {
        this.loadSpecificBlogPost(blogFile);
      }, 100);
    } else {
      this.navigateToPage(page, false);
    }
  }

  getPageFromHash() {
    const hash = window.location.hash.substring(1);
    return hash || null;
  }

  setupNavigation() {
    for (let i = 0; i < this.navigationLinks.length; i++) {
      this.navigationLinks[i].addEventListener("click", (e) => {
        e.preventDefault();
        const page = e.target.innerHTML.toLowerCase();
        this.navigateToPage(page, true);
      });
    }
  }

  navigateToPage(page, updateURL = true) {
    this.currentPage = page;
    
    for (let j = 0; j < this.pages.length; j++) {
      if (page === this.pages[j].dataset.page) {
        this.pages[j].classList.add("active");
        
        // Update navigation links
        for (let k = 0; k < this.navigationLinks.length; k++) {
          if (this.navigationLinks[k].innerHTML.toLowerCase() === page) {
            this.navigationLinks[k].classList.add("active");
          } else {
            this.navigationLinks[k].classList.remove("active");
          }
        }
        
        window.scrollTo(0, 0);
      } else {
        this.pages[j].classList.remove("active");
      }
    }

    if (updateURL) {
      this.updateURL(page);
    }
  }

  updateURL(page, blogFile = null) {
    const url = new URL(window.location);
    
    // Clear existing params
    url.search = '';
    url.hash = '';
    
    if (page !== 'about') {
      url.searchParams.set('page', page);
    }
    
    if (blogFile && page === 'blog') {
      url.searchParams.set('file', blogFile);
    }
    
    // Also set hash for better UX
    if (page !== 'about') {
      url.hash = page;
    }
    
    window.history.pushState({ page, blogFile }, '', url);
  }

  handleURLChange(updateURL = true) {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || this.getPageFromHash() || 'about';
    const blogFile = urlParams.get('file');
    
    if (page !== this.currentPage) {
      this.navigateToPage(page, false);
    }
    
    if (page === 'blog' && blogFile && blogFile !== this.currentBlogPost) {
      setTimeout(() => {
        this.loadSpecificBlogPost(blogFile);
      }, 100);
    }
  }

  loadSpecificBlogPost(filename) {
    this.currentBlogPost = filename;
    
    // Dispatch custom event for blog manager to handle
    const event = new CustomEvent('loadBlogPost', {
      detail: { filename }
    });
    document.dispatchEvent(event);
  }

  navigateToBlogPost(filename) {
    this.navigateToPage('blog', true);
    this.currentBlogPost = filename;
    this.updateURL('blog', filename);
    
    setTimeout(() => {
      this.loadSpecificBlogPost(filename);
    }, 100);
  }
}

// Initialize router
const router = new URLRouter();

// Make router globally available
window.router = router;