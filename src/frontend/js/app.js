/**
 * Main Application Module for GlucoTracker
 * Initializes and coordinates all modules
 */

const AppModule = {
  /**
   * Initialize the application
   */
  init() {
    // Initialize all modules
    AuthModule.init();
    DashboardModule.init();
    HistoryModule.init();
    ProfileModule.init();
    
    // Set up navigation
    this.setupNavigation();
    
    // Set up notification toast
    this.setupNotificationToast();
  },
  
  /**
   * Set up navigation between pages
   */
  setupNavigation() {
    // Navigation menu links
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        this.navigateTo(pageId);
      });
    });
  },
  
  /**
   * Navigate to a specific page
   * @param {string} pageId - ID of the page to navigate to
   */
  navigateTo(pageId) {
    // Check if user is authenticated for protected pages
    if (pageId !== 'authPage' && !AuthModule.currentUser) {
      pageId = 'authPage';
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.style.display = 'none';
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
      selectedPage.style.display = 'block';
    }
    
    // Update active navigation link
    document.querySelectorAll('.nav-menu a').forEach(link => {
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Load page-specific data
    this.loadPageData(pageId);
  },
  
  /**
   * Load data specific to the current page
   * @param {string} pageId - ID of the current page
   */
  loadPageData(pageId) {
    switch (pageId) {
      case 'dashboardPage':
        DashboardModule.loadUserData();
        break;
      case 'historyPage':
        HistoryModule.loadReadings();
        break;
      case 'profilePage':
        ProfileModule.loadProfile();
        break;
    }
  },
  
  /**
   * Set up notification toast
   */
  setupNotificationToast() {
    const toast = document.getElementById('notificationToast');
    const closeBtn = toast.querySelector('.toast-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
      });
    }
  },
  
  /**
   * Show a notification toast
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('success', 'error', 'info')
   */
  showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    // Set message
    if (toastMessage) {
      toastMessage.textContent = message;
    }
    
    // Set icon based on type
    if (toastIcon) {
      toastIcon.className = 'fas toast-icon';
      
      switch (type) {
        case 'success':
          toastIcon.classList.add('fa-check-circle');
          toastIcon.style.color = 'var(--success-color)';
          break;
        case 'error':
          toastIcon.classList.add('fa-exclamation-circle');
          toastIcon.style.color = 'var(--danger-color)';
          break;
        default:
          toastIcon.classList.add('fa-info-circle');
          toastIcon.style.color = 'var(--info-color)';
      }
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }
};

// Initialize app when DOM is loaded and ApiService is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if ApiService is already available
  if (window.ApiService) {
    AppModule.init();
  } else {
    // Wait for ApiService to be ready
    document.addEventListener('apiservice-ready', () => {
      AppModule.init();
    });
  }
});