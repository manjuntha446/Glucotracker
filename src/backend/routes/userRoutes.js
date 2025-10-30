const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { protect } = require('../middleware/authMiddleware');

// Get user profile (protected route)
router.get('/:id', protect, async (req, res) => {
  try {
    // Ensure the requested user ID matches the authenticated user's ID
    if (req.params.id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view this profile' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, diabetesType } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // In a real application, you would hash the password here
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password, // In production, use hashedPassword instead
      age,
      gender,
      diabetesType
    });
    
    const savedUser = await newUser.save();
    
    // Don't return the password in the response
    const userResponse = { ...savedUser._doc };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // In a real application, you would verify the password here
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password; // Simplified for demo
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // In a real application, you would generate a JWT token here
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Don't return the password in the response
    const userResponse = { ...user._doc };
    delete userResponse.password;
    
    res.json({
      user: userResponse,
      token: 'dummy-token' // In production, use a real JWT token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (protected route)
router.put('/:id', protect, async (req, res) => {
  try {
    // Ensure the requested user ID matches the authenticated user's ID
    if (req.params.id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this profile' });
    }
    const { name, age, gender, diabetesType, targetGlucoseRange, insulinSensitivityFactor, carbRatio, guardianContact, notificationPreferences } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, age, gender, diabetesType, targetGlucoseRange, insulinSensitivityFactor, carbRatio, guardianContact, notificationPreferences },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Send email notification to guardian if guardian contact is updated and email is provided
    if (guardianContact && guardianContact.email) {
      try {
        const subject = 'Guardian Contact Updated - GlucoTracker';
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif">
            <h2 style="margin:0 0 8px 0;">Guardian Contact Information Updated</h2>
            <p>Hello ${guardianContact.name || 'there'},</p>
            <p>You have been designated as a guardian contact for a GlucoTracker user.</p>
            <p><strong>Your contact details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${guardianContact.name || 'Not specified'}</li>
              <li><strong>Relationship:</strong> ${guardianContact.relationship || 'Not specified'}</li>
              <li><strong>Email:</strong> ${guardianContact.email}</li>
              <li><strong>Phone:</strong> ${guardianContact.phone || 'Not specified'}</li>
            </ul>
            <p>You will receive notifications when the user's glucose readings are outside their target range.</p>
            <p style="color:#555;margin-top:20px;">This is an automated notification from GlucoTracker.</p>
          </div>
        `;
        
        // Send email to guardian
        sendEmail(guardianContact.email, subject, html).catch((err) => {
          console.error('[email] Guardian contact update email failed:', err?.message || err);
        });
        
        // Also send confirmation email to user
        if (updatedUser.email) {
          const userSubject = 'Guardian Contact Updated Successfully';
          const userHtml = `
            <div style="font-family:Arial,Helvetica,sans-serif">
              <h2 style="margin:0 0 8px 0;">Guardian Contact Updated</h2>
              <p>Hello ${updatedUser.name || 'there'},</p>
              <p>Your guardian contact information has been successfully updated.</p>
              <p><strong>Guardian details:</strong></p>
              <ul>
                <li><strong>Name:</strong> ${guardianContact.name || 'Not specified'}</li>
                <li><strong>Relationship:</strong> ${guardianContact.relationship || 'Not specified'}</li>
                <li><strong>Email:</strong> ${guardianContact.email}</li>
                <li><strong>Phone:</strong> ${guardianContact.phone || 'Not specified'}</li>
              </ul>
              <p>Your guardian will now receive notifications when your glucose readings are outside your target range.</p>
            </div>
          `;
          
          sendEmail(updatedUser.email, userSubject, userHtml).catch((err) => {
            console.error('[email] User confirmation email failed:', err?.message || err);
          });
        }
      } catch (emailError) {
        console.warn('Failed to send guardian contact update emails:', emailError.message);
      }
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update guardian contact (protected route)
router.put('/:id/guardian', protect, async (req, res) => {
  try {
    // Ensure the requested user ID matches the authenticated user's ID
    if (req.params.id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update guardian contact' });
    }
    const { guardianContact } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { guardianContact },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Send email notification to guardian if email is provided
    if (guardianContact && guardianContact.email) {
      try {
        const subject = 'Guardian Contact Updated - GlucoTracker';
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif">
            <h2 style="margin:0 0 8px 0;">Guardian Contact Information Updated</h2>
            <p>Hello ${guardianContact.name || 'there'},</p>
            <p>You have been designated as a guardian contact for a GlucoTracker user.</p>
            <p><strong>Your contact details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${guardianContact.name || 'Not specified'}</li>
              <li><strong>Relationship:</strong> ${guardianContact.relationship || 'Not specified'}</li>
              <li><strong>Email:</strong> ${guardianContact.email}</li>
              <li><strong>Phone:</strong> ${guardianContact.phone || 'Not specified'}</li>
            </ul>
            <p>You will receive notifications when the user's glucose readings are outside their target range.</p>
            <p style="color:#555;margin-top:20px;">This is an automated notification from GlucoTracker.</p>
          </div>
        `;
        
        // Send email to guardian
        sendEmail(guardianContact.email, subject, html).catch((err) => {
          console.error('[email] Guardian contact update email failed:', err?.message || err);
        });
        
        // Also send confirmation email to user
        if (updatedUser.email) {
          const userSubject = 'Guardian Contact Updated Successfully';
          const userHtml = `
            <div style="font-family:Arial,Helvetica,sans-serif">
              <h2 style="margin:0 0 8px 0;">Guardian Contact Updated</h2>
              <p>Hello ${updatedUser.name || 'there'},</p>
              <p>Your guardian contact information has been successfully updated.</p>
              <p><strong>Guardian details:</strong></p>
              <ul>
                <li><strong>Name:</strong> ${guardianContact.name || 'Not specified'}</li>
                <li><strong>Relationship:</strong> ${guardianContact.relationship || 'Not specified'}</li>
                <li><strong>Email:</strong> ${guardianContact.email}</li>
                <li><strong>Phone:</strong> ${guardianContact.phone || 'Not specified'}</li>
              </ul>
              <p>Your guardian will now receive notifications when your glucose readings are outside your target range.</p>
            </div>
          `;
          
          sendEmail(updatedUser.email, userSubject, userHtml).catch((err) => {
            console.error('[email] User confirmation email failed:', err?.message || err);
          });
        }
      } catch (emailError) {
        console.warn('Failed to send guardian contact update emails:', emailError.message);
      }
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update notification preferences (protected route)
router.put('/:id/notifications', protect, async (req, res) => {
  try {
    // Ensure the requested user ID matches the authenticated user's ID
    if (req.params.id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update notification preferences' });
    }
    const { notificationPreferences } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { notificationPreferences },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Test email endpoint (for development/testing)
router.post('/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields: to, subject, message' });
    }
    
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif">
        <h2 style="margin:0 0 8px 0;">${subject}</h2>
        <p>${message}</p>
        <p style="color:#555;margin-top:20px;">This is a test email from GlucoTracker.</p>
      </div>
    `;
    
    await sendEmail(to, subject, html);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ message: 'Failed to send test email: ' + error.message });
  }
});

module.exports = router;