/**
 * History Module for GlucoTracker
 * Handles displaying and managing glucose reading history
 */

const HistoryModule = {
  // Store readings data
  readings: [],
  
  // User data
  userData: null,
  
  /**
   * Initialize the history module
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
  },
  
  /**
   * Set up event listeners for history page
   */
  setupEventListeners() {
    // History filter change
    const historyFilter = document.getElementById('historyFilter');
    if (historyFilter) {
      historyFilter.addEventListener('change', () => {
        this.filterReadings();
      });
    }
  },
  
  /**
   * Load glucose readings history
   */
  async loadReadings() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;
    
    try {
      // Get user profile for target range
      this.userData = await ApiService.user.getProfile(userId);
      
      // Get glucose readings
      this.readings = await ApiService.glucose.getReadings(userId, 100);
      
      // Display readings
      this.displayReadings(this.readings);
    } catch (error) {
      console.error('Error loading readings:', error);
      AppModule.showNotification('Failed to load glucose history.', 'error');
    }
  },
  
  /**
   * Display glucose readings in the history table
   * @param {Array} readings - Glucose readings to display
   */
  displayReadings(readings) {
    const tableBody = document.getElementById('historyTableBody');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (readings.length === 0) {
      // Show empty state message
      if (noHistoryMessage) {
        noHistoryMessage.style.display = 'block';
      }
      return;
    }
    
    // Hide empty state message
    if (noHistoryMessage) {
      noHistoryMessage.style.display = 'none';
    }
    
    // Sort readings by timestamp (newest first)
    const sortedReadings = [...readings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Get target range for color coding
    const targetMin = this.userData?.targetGlucoseRange?.min || 70;
    const targetMax = this.userData?.targetGlucoseRange?.max || 180;
    
    // Add readings to table
    sortedReadings.forEach(reading => {
      const row = document.createElement('tr');
      
      // Determine reading status for color coding
      let statusClass = '';
      if (reading.value < targetMin) {
        statusClass = 'text-danger';
      } else if (reading.value > targetMax) {
        statusClass = 'text-warning';
      } else {
        statusClass = 'text-success';
      }
      
      // Format date
      const date = new Date(reading.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      // Format meal context
      const mealContext = reading.mealContext.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td class="${statusClass}">${reading.value} ${reading.unit}</td>
        <td>${mealContext}</td>
        <td>${reading.insulinDosage || 0} units</td>
        <td>${reading.notes || '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline edit-reading" data-id="${reading._id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline delete-reading" data-id="${reading._id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    this.addActionButtonListeners();
  },
  
  /**
   * Filter readings based on selected filter
   */
  filterReadings() {
    const filterValue = document.getElementById('historyFilter').value;
    
    if (!this.readings || this.readings.length === 0) return;
    
    // Get target range for filtering
    const targetMin = this.userData?.targetGlucoseRange?.min || 70;
    const targetMax = this.userData?.targetGlucoseRange?.max || 180;
    
    let filteredReadings = [];
    
    switch (filterValue) {
      case 'high':
        filteredReadings = this.readings.filter(reading => reading.value > targetMax);
        break;
      case 'normal':
        filteredReadings = this.readings.filter(reading => reading.value >= targetMin && reading.value <= targetMax);
        break;
      case 'low':
        filteredReadings = this.readings.filter(reading => reading.value < targetMin);
        break;
      default:
        filteredReadings = this.readings;
    }
    
    this.displayReadings(filteredReadings);
  },
  
  /**
   * Add event listeners to edit and delete buttons
   */
  addActionButtonListeners() {
    // Edit reading buttons
    document.querySelectorAll('.edit-reading').forEach(button => {
      button.addEventListener('click', () => {
        const readingId = button.getAttribute('data-id');
        this.openEditModal(readingId);
      });
    });
    
    // Delete reading buttons
    document.querySelectorAll('.delete-reading').forEach(button => {
      button.addEventListener('click', () => {
        const readingId = button.getAttribute('data-id');
        this.confirmDeleteReading(readingId);
      });
    });
  },
  
  /**
   * Open modal to edit a glucose reading
   * @param {string} readingId - ID of the reading to edit
   */
  async openEditModal(readingId) {
    try {
      const reading = await ApiService.glucose.getReading(readingId);
      
      // In a real application, you would show a modal here
      // For this demo, we'll use a simple prompt
      const newValue = prompt('Edit glucose reading:', reading.value);
      
      if (newValue !== null) {
        const updatedReading = {
          ...reading,
          value: parseFloat(newValue)
        };
        
        await ApiService.glucose.updateReading(readingId, updatedReading);
        
        // Reload readings
        await this.loadReadings();
        
        AppModule.showNotification('Glucose reading updated successfully!', 'success');
      }
    } catch (error) {
      AppModule.showNotification(error.message || 'Failed to update glucose reading.', 'error');
    }
  },
  
  /**
   * Confirm and delete a glucose reading
   * @param {string} readingId - ID of the reading to delete
   */
  async confirmDeleteReading(readingId) {
    const confirmed = confirm('Are you sure you want to delete this glucose reading?');
    
    if (confirmed) {
      try {
        await ApiService.glucose.deleteReading(readingId);
        
        // Reload readings
        await this.loadReadings();
        
        AppModule.showNotification('Glucose reading deleted successfully!', 'success');
      } catch (error) {
        AppModule.showNotification(error.message || 'Failed to delete glucose reading.', 'error');
      }
    }
  }
};