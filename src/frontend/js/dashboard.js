/**
 * Dashboard Module for GlucoTracker
 * Handles glucose entry, recommendations, statistics, and chart visualization
 */

const DashboardModule = {
  // Chart instance
  glucoseChart: null,
  notesForChart: [],
  
  // User data
  userData: null,
  
  /**
   * Initialize the dashboard module
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Display current date
    this.displayCurrentDate();
    
    // Initialize chart
    this.initializeChart();

    // Load initial activity data
    this.loadRecentActivities();
  },
  
  /**
   * Set up event listeners for dashboard
   */
  setupEventListeners() {
    // Glucose entry form submission
    const glucoseEntryForm = document.getElementById('glucoseEntryForm');
    if (glucoseEntryForm) {
      glucoseEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleGlucoseEntry();
      });
    }
    
    // Activity entry form submission
    const activityEntryForm = document.getElementById('activityEntryForm');
    if (activityEntryForm) {
      activityEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleActivityEntry();
      });
    }

    // Stats time range change
    const statsTimeRange = document.getElementById('statsTimeRange');
    if (statsTimeRange) {
      statsTimeRange.addEventListener('change', () => {
        this.loadStatistics();
      });
    }
    
    // Chart time range change
    const chartTimeRange = document.getElementById('chartTimeRange');
    if (chartTimeRange) {
      chartTimeRange.addEventListener('change', () => {
        this.loadGlucoseTrends();
      });
    }
  },
  
  /**
   * Display current date in the dashboard
   */
  displayCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDateElement.textContent = now.toLocaleDateString('en-US', options);
    }
  },
  
  /**
   * Initialize the glucose trend chart
   */
  initializeChart() {
    const chartCanvas = document.getElementById('glucoseTrendChart');
    if (!chartCanvas) return;
    
    // Create initial empty chart
    this.glucoseChart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Glucose Level',
          data: [],
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const note = DashboardModule.notesForChart?.[context.dataIndex] || '';
                return `Glucose: ${context.raw} mg/dL${note ? ' - ' + note : ''}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: false,
            suggestedMin: 60,
            suggestedMax: 200,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  },
  
  /**
   * Load user data and initialize dashboard
   */
  async loadUserData() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;
    
    try {
      // Get user profile
      this.userData = await ApiService.user.getProfile(userId);
      
      // Load glucose readings, statistics, and trends
      await Promise.all([
        this.loadStatistics(),
        this.loadGlucoseTrends(),
        this.loadRecentActivities() // Load activities as well
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      AppModule.showNotification('Failed to load user data. Please try again.', 'error');
    }
  },
  
  /**
   * Handle glucose entry form submission
   */
  async handleGlucoseEntry() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;
    
    const value = parseFloat(document.getElementById('glucoseValue').value);
    const unit = document.getElementById('glucoseUnit').value;
    const mealContext = document.getElementById('mealContext').value;
    const notes = document.getElementById('glucoseNotes').value;
    
    try {
      const readingData = {
        userId,
        value,
        unit,
        mealContext,
        notes
      };
      
      const response = await ApiService.glucose.addReading(readingData);
      
      // Update recommendations
      this.displayRecommendations(response.recommendedInsulinDosage, response.recommendedActivity);
      
      // Reload statistics and chart
      await Promise.all([
        this.loadStatistics(),
        this.loadGlucoseTrends()
      ]);
      
      // Voice alert for out-of-range glucose readings
      const prefs = this.userData?.notificationPreferences || {};
      const highThreshold = prefs.highAlertThreshold ?? prefs.alertThreshold?.high ?? 250;
      const lowThreshold = prefs.lowAlertThreshold ?? prefs.alertThreshold?.low ?? 60;
      if (value > highThreshold) {
        VoiceModule?.speak('Warning! Your glucose reading is high.');
      } else if (value < lowThreshold) {
        VoiceModule?.speak('Warning! Your glucose reading is low.');
      }
      // Reset form
      document.getElementById('glucoseEntryForm').reset();
      
      AppModule.showNotification('Glucose reading saved successfully!', 'success');
    } catch (error) {
      AppModule.showNotification(error.message || 'Failed to save glucose reading.', 'error');
    }
  },
  
  /**
   * Display insulin and activity recommendations
   * @param {number} insulinDosage - Recommended insulin dosage
   * @param {string} activity - Recommended activity
   */
  displayRecommendations(insulinDosage, activity) {
    const insulinElement = document.getElementById('insulinRecommendation');
    const activityElement = document.getElementById('activityRecommendation');
    
    if (insulinElement) {
      if (insulinDosage > 0) {
        insulinElement.textContent = `Recommended insulin dosage: ${insulinDosage} units`;
      } else {
        insulinElement.textContent = 'No insulin needed at this time.';
      }
    }
    
    if (activityElement) {
      if (activity && activity.trim() !== '') {
        activityElement.textContent = activity;
      } else {
        activityElement.textContent = 'No specific activity recommendations at this time.';
      }
    }
  },
  
  /**
   * Load glucose statistics
   */
  async loadStatistics() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;
    
    const days = document.getElementById('statsTimeRange').value || 7;
    
    try {
      const stats = await ApiService.glucose.getStatistics(userId, days);
      
      // Update statistics display
      document.getElementById('averageGlucose').textContent = stats.average ? `${stats.average} mg/dL` : '--';
      document.getElementById('lowestGlucose').textContent = stats.min ? `${stats.min} mg/dL` : '--';
      document.getElementById('highestGlucose').textContent = stats.max ? `${stats.max} mg/dL` : '--';
      document.getElementById('inRangePercentage').textContent = stats.inRangePercentage ? `${stats.inRangePercentage}%` : '--%';
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  },
  
  /**
   * Load glucose trends for chart
   */
  async loadGlucoseTrends() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId || !this.glucoseChart) return;
    
    const period = document.getElementById('chartTimeRange').value || 'daily'; // Use 'period' now
    
    try {
      const trends = await ApiService.glucose.getTrends(period);
      
      // Sort trends by date
      trends.sort((a, b) => {
        const dateA = new Date(a._id.year, a._id.month - 1, a._id.day);
        const dateB = new Date(b._id.year, b._id.month - 1, b._id.day);
        return dateA - dateB;
      });

      // Extract data for chart
      const labels = trends.map(trend => {
        const date = new Date(trend._id.year, trend._id.month - 1, trend._id.day);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      // We'll use avgLevel for the main data points
      const data = trends.map(trend => trend.avgLevel);
      
      // For tooltips, we can show min/max/avg, but notes might not be directly available for aggregated data.
      // Let's refine this to show more aggregated info in tooltip if needed, for now just avg.
      DashboardModule.notesForChart = trends.map(trend => 
        `Min: ${trend.minLevel} Max: ${trend.maxLevel} Count: ${trend.count}`
      );
      
      // Update chart
      this.glucoseChart.data.labels = labels;
      this.glucoseChart.data.datasets[0].data = data;
      
      // Add target range if available
      if (this.userData && this.userData.targetGlucoseRange) {
        const { min, max } = this.userData.targetGlucoseRange;
        
        // Remove existing target range lines
        this.glucoseChart.options.plugins.annotation = {
          annotations: {
            targetRangeMin: {
              type: 'line',
              yMin: min,
              yMax: min,
              borderColor: 'rgba(255, 193, 7, 0.5)',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: 'Min Target',
                enabled: true,
                position: 'left'
              }
            },
            targetRangeMax: {
              type: 'line',
              yMin: max,
              yMax: max,
              borderColor: 'rgba(220, 53, 69, 0.5)',
              borderWidth: 2,
              borderDash: [5, 5],
                label: {
                  content: 'Max Target',
                  enabled: true,
                  position: 'left'
                }
            },
            // Add background for target range
            targetRangeArea: {
              type: 'box',
              yMin: min,
              yMax: max,
              backgroundColor: 'rgba(144, 238, 144, 0.2)', // Light green for target range
              borderWidth: 0
            }
          }
        };
        // Update y-axis suggested min/max to better fit data and target range
        this.glucoseChart.options.scales.y.suggestedMin = Math.min(min - 20, Math.min(...data) - 20);
        this.glucoseChart.options.scales.y.suggestedMax = Math.max(max + 20, Math.max(...data) + 20);
      }
      
      this.glucoseChart.update();
    } catch (error) {
      console.error('Error loading glucose trends:', error);
    }
  },

  /**
   * Handle activity entry form submission
   */
  async handleActivityEntry() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;

    const type = document.getElementById('activityType').value;
    const duration = parseFloat(document.getElementById('activityDuration').value);
    const intensity = document.getElementById('activityIntensity').value;
    const caloriesBurned = parseFloat(document.getElementById('activityCalories').value) || 0;
    const notes = document.getElementById('activityNotes').value;

    try {
      const activityData = {
        type,
        duration,
        intensity,
        caloriesBurned,
        notes,
      };

      await ApiService.activity.addActivity(activityData);

      // Reload recent activities
      this.loadRecentActivities();

      // Reset form
      document.getElementById('activityEntryForm').reset();

      AppModule.showNotification('Activity saved successfully!', 'success');
    } catch (error) {
      AppModule.showNotification(error.message || 'Failed to save activity.', 'error');
    }
  },

  /**
   * Load and display recent activities
   */
  async loadRecentActivities() {
    const userId = AuthModule.getCurrentUserId();
    if (!userId) return;

    try {
      const response = await ApiService.activity.getActivities();
      const recentActivities = response.data; // Assuming data is in response.data
      const recentActivitiesList = document.getElementById('recentActivitiesList');
      
      recentActivitiesList.innerHTML = ''; // Clear previous list

      if (recentActivities.length === 0) {
        recentActivitiesList.innerHTML = `
          <li class="empty-state-small">
            <i class="fas fa-running empty-icon"></i>
            <p>No activities logged yet.</p>
          </li>
        `;
        return;
      }

      recentActivities.slice(0, 5).forEach(activity => { // Display up to 5 recent activities
        const listItem = document.createElement('li');
        listItem.classList.add('activity-list-item');
        const activityDate = new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        listItem.innerHTML = `
          <i class="fas fa-running activity-icon"></i>
          <div class="activity-details">
            <h4>${activity.type}</h4>
            <p>${activity.duration} mins - ${activity.intensity}</p>
            ${activity.caloriesBurned ? `<p>${activity.caloriesBurned} calories</p>` : ''}
            <span class="activity-date">${activityDate}</span>
          </div>
        `;
        recentActivitiesList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error loading recent activities:', error);
      AppModule.showNotification('Failed to load recent activities.', 'error');
    }
  }
};