/**
 * Authentication Module for GlucoTracker
 * Handles user authentication, registration, and session management
 */

const AuthModule = {
  // Current user data
  currentUser: null,
  
  /**
   * Initialize the auth module
   */
  init() {
    // Check if user is already logged in
    this.checkAuthStatus();
    
    // Set up event listeners
    this.setupEventListeners();
  },
  
  /**
   * Check if user is already logged in
   */
  checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.updateUI(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
      }
    } else {
      this.updateUI(false);
    }
  },
  
  /**
   * Set up event listeners for auth forms
   */
  setupEventListeners() {
    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        this.switchAuthTab(tabType);
      });
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
    
    // Register form submission
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
    
    // Login button in header
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        AppModule.navigateTo('authPage');
        this.switchAuthTab('login');
      });
    }
    
    // Logout button in header
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  },
  
  /**
   * Switch between login and register tabs
   * @param {string} tabType - Tab type ('login' or 'register')
   */
  switchAuthTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
      if (tab.getAttribute('data-tab') === tabType) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Show the selected form
    if (tabType === 'login') {
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('registerForm').style.display = 'none';
    } else {
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('registerForm').style.display = 'block';
    }
  },
  
  /**
   * Handle login form submission
   */
  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await ApiService.auth.login({ email, password });
      
      // Save user data and token
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      this.currentUser = response.user;
      this.updateUI(true);
      
      // Navigate to dashboard
      AppModule.navigateTo('dashboardPage');
      AppModule.showNotification('Login successful!', 'success');
      
      // Load user data
      DashboardModule.loadUserData();
    } catch (error) {
      AppModule.showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
    }
  },
  
  /**
   * Handle register form submission
   */
  async handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const age = document.getElementById('registerAge').value;
    const gender = document.getElementById('registerGender').value;
    const diabetesType = document.getElementById('registerDiabetesType').value;
    
    try {
      const userData = { name, email, password };
      
      if (age) userData.age = parseInt(age);
      if (gender) userData.gender = gender;
      if (diabetesType) userData.diabetesType = diabetesType;
      
      const response = await ApiService.auth.register(userData);
      
      // Switch to login tab
      this.switchAuthTab('login');
      
      // Pre-fill login form
      document.getElementById('loginEmail').value = email;
      
      AppModule.showNotification('Registration successful! Please login.', 'success');
    } catch (error) {
      AppModule.showNotification(error.message || 'Registration failed. Please try again.', 'error');
    }
  },
  
  /**
   * Log out the current user
   */
  logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.currentUser = null;
    this.updateUI(false);
    
    // Navigate to auth page
    AppModule.navigateTo('authPage');
    AppModule.showNotification('You have been logged out.', 'info');
  },
  
  /**
   * Update UI based on authentication status
   * @param {boolean} isLoggedIn - Whether user is logged in
   */
  updateUI(isLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameElement = document.getElementById('userName');
    
    if (isLoggedIn && this.currentUser) {
      // Update user name
      if (userNameElement) {
        userNameElement.textContent = this.currentUser.name;
      }
      
      // Show logout button, hide login button
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      
      // If on auth page, redirect to dashboard
      const currentPage = document.querySelector('.page:not([style*="display: none"])');
      if (currentPage && currentPage.id === 'authPage') {
        AppModule.navigateTo('dashboardPage');
      }
    } else {
      // Update user name
      if (userNameElement) {
        userNameElement.textContent = 'Guest';
      }
      
      // Show login button, hide logout button
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      
      // If on a protected page, redirect to auth page
      const currentPage = document.querySelector('.page:not([style*="display: none"])');
      if (currentPage && currentPage.id !== 'authPage') {
        AppModule.navigateTo('authPage');
      }
    }
  },
  
  /**
   * Get the current user ID
   * @returns {string|null} - User ID or null if not logged in
   */
  getCurrentUserId() {
    return this.currentUser ? this.currentUser._id : null;
  },
};