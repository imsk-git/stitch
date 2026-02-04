const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Submit contact message (public - no auth needed)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
