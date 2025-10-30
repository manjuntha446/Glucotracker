# GlucoTracker

GlucoTracker is a smart health monitoring system designed to assist individuals in managing their blood sugar levels. The application provides personalized insulin dosage recommendations, suggests appropriate physical activities, sends automatic alerts to guardians, and displays glucose trends for easy monitoring.

## Features

- **Blood Glucose Tracking**: Record and monitor blood glucose readings with meal context and notes
- **Insulin Dosage Recommendations**: Get personalized insulin dosage recommendations based on current glucose levels
- **Activity Suggestions**: Receive appropriate physical activity suggestions to help manage glucose levels
- **Guardian Alerts**: Automatic notifications to designated guardians when glucose levels are outside safe ranges
- **Glucose Trend Visualization**: Interactive charts to visualize glucose trends over time
- **Comprehensive Statistics**: View average, highest, and lowest glucose readings, plus time-in-range percentages
- **User Profiles**: Personalized settings including target glucose ranges and insulin sensitivity factors

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Charts**: Chart.js

## Project Structure

```
glucotrackerr/
├── src/
│   ├── frontend/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   ├── app.js
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── history.js
│   │   │   └── profile.js
│   │   ├── images/
│   │   └── index.html
│   ├── backend/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   │   ├── Glucose.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── glucoseRoutes.js
│   │   │   └── userRoutes.js
│   │   └── server.js
├── .env
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/glucotracker.git
   cd glucotracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/glucotracker
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Register/Login**: Create an account or log in to access the dashboard
2. **Record Glucose**: Enter your blood glucose reading, meal context, and optional notes
3. **View Recommendations**: See insulin dosage and activity recommendations based on your reading
4. **Track History**: View your glucose reading history and filter by high, normal, or low readings
5. **Monitor Trends**: Visualize your glucose trends over time with interactive charts
6. **Update Profile**: Customize your target glucose range, insulin sensitivity, and guardian contact information

## Future Enhancements

- Mobile application with offline capabilities
- Integration with glucose monitoring devices for automatic readings
- Meal logging with carbohydrate counting
- Medication tracking and reminders
- Advanced analytics and pattern recognition
- Social sharing features for healthcare provider collaboration

## License

This project is licensed under the ISC License - see the LICENSE file for details.