/**
 * Profile Module for GlucoTracker
 * Handles user profile management and settings
 */

const ProfileModule = {
  // Current user data
  userData: null,
  
  /**
   * Initialize the profile module
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
  },
  
  /**
   * Set up event listeners for profile page
   */
  setupEventListeners() {
    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => {
        this.saveProfile();
      });
    }
  },
  
  /**
   * Load user profile data
   */
  async loadProfile() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;
    
    try {
      this.userData = await ApiService.user.getProfile(userId);
      
      // Populate form fields with user data
      this.populateProfileForm();
    } catch (error) {
      console.error('Error loading profile:', error);
      AppModule.showNotification('Failed to load profile data.', 'error');
    }
  },
  
  /**
   * Populate profile form fields with user data
   */
  populateProfileForm() {
    if (!this.userData) return;
    
    // Personal information
    document.getElementById('profileName').value = this.userData.name || '';
    document.getElementById('profileEmail').value = this.userData.email || '';
    document.getElementById('profileAge').value = this.userData.age || '';
    document.getElementById('profileGender').value = this.userData.gender || '';
    document.getElementById('profileDiabetesType').value = this.userData.diabetesType || '';
    
    // Target range
    document.getElementById('targetMin').value = this.userData.targetGlucoseRange?.min || 70;
    document.getElementById('targetMax').value = this.userData.targetGlucoseRange?.max || 180;
    document.getElementById('insulinSensitivity').value = this.userData.insulinSensitivityFactor || 50;
    document.getElementById('carbRatio').value = this.userData.carbRatio || 15;
    
    // Guardian contact
    const guardian = this.userData.guardianContact || {};
    document.getElementById('guardianName').value = guardian.name || '';
    document.getElementById('guardianRelationship').value = guardian.relationship || '';
    document.getElementById('guardianEmail').value = guardian.email || '';
    document.getElementById('guardianPhone').value = guardian.phone || '';
    
    // Notification preferences
    const notifications = this.userData.notificationPreferences || {};
    document.getElementById('emailNotifications').checked = notifications.email !== false;
    document.getElementById('smsNotifications').checked = notifications.sms === true;
    document.getElementById('highAlertThreshold').value = notifications.alertThreshold?.high || 250;
    document.getElementById('lowAlertThreshold').value = notifications.alertThreshold?.low || 60;
  },
  
  /**
   * Save user profile data
   */
  async saveProfile() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;
    
    try {
      // Collect personal information
      const personalInfo = {
        name: document.getElementById('profileName').value,
        age: parseInt(document.getElementById('profileAge').value) || undefined,
        gender: document.getElementById('profileGender').value,
        diabetesType: document.getElementById('profileDiabetesType').value
      };
      
      // Collect target range
      const targetRange = {
        targetGlucoseRange: {
          min: parseInt(document.getElementById('targetMin').value) || 70,
          max: parseInt(document.getElementById('targetMax').value) || 180
        },
        insulinSensitivityFactor: parseInt(document.getElementById('insulinSensitivity').value) || 50,
        carbRatio: parseInt(document.getElementById('carbRatio').value) || 15
      };
      
      // Collect guardian contact
      const guardianContact = {
        name: document.getElementById('guardianName').value,
        relationship: document.getElementById('guardianRelationship').value,
        email: document.getElementById('guardianEmail').value,
        phone: document.getElementById('guardianPhone').value
      };
      
      // Collect notification preferences
      const notificationPreferences = {
        email: document.getElementById('emailNotifications').checked,
        sms: document.getElementById('smsNotifications').checked,
        alertThreshold: {
          high: parseInt(document.getElementById('highAlertThreshold').value) || 250,
          low: parseInt(document.getElementById('lowAlertThreshold').value) || 60
        }
      };
      
      // Combine all data
      const updatedUserData = {
        ...personalInfo,
        ...targetRange,
        guardianContact,
        notificationPreferences
      };
      
      // Update user profile
      const response = await ApiService.user.updateProfile(userId, updatedUserData);
      
      // Update local user data
      this.userData = response;
      
      // Update user name in header
      const userNameElement = document.getElementById('userName');
      if (userNameElement && response.name) {
        userNameElement.textContent = response.name;
      }
      
      // Update user data in auth module
      if (AuthModule.currentUser) {
        AuthModule.currentUser = {
          ...AuthModule.currentUser,
          ...response
        };
        localStorage.setItem('user', JSON.stringify(AuthModule.currentUser));
      }
      
      // Check if guardian contact was updated and show specific notification
      const guardianEmail = document.getElementById('guardianEmail').value;
      if (guardianEmail) {
        AppModule.showNotification('Profile updated successfully! Guardian contact email will be sent shortly.', 'success');
      } else {
        AppModule.showNotification('Profile updated successfully!', 'success');
      }
    } catch (error) {
      AppModule.showNotification(error.message || 'Failed to update profile.', 'error');
    }
  }
};