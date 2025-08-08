const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'cd71f360ae1c956fadc58f248362671c';
const BADGES_FILE = path.join(__dirname, 'badges.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to read badges from file
function readBadges() {
    try {
        if (fs.existsSync(BADGES_FILE)) {
            const data = fs.readFileSync(BADGES_FILE, 'utf8');
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        console.error('Error reading badges file:', error);
        return {};
    }
}

// Helper function to write badges to file
function writeBadges(badges) {
    try {
        fs.writeFileSync(BADGES_FILE, JSON.stringify(badges, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing badges file:', error);
        return false;
    }
}

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get badges.json
app.get('/badges.json', (req, res) => {
    const badges = readBadges();
    res.json(badges);
});

// Get all badges
app.get('/api/badges', (req, res) => {
    const badges = readBadges();
    res.json(badges);
});

// Add a new badge
app.post('/api/badges', (req, res) => {
    const { userId, tooltip, badge } = req.body;
    
    if (!userId || !tooltip || !badge) {
        return res.status(400).json({ error: 'Missing required fields: userId, tooltip, badge' });
    }
    
    const badges = readBadges();
    
    if (!badges[userId]) {
        badges[userId] = [];
    }
    
    badges[userId].push({ tooltip, badge });
    
    if (writeBadges(badges)) {
        res.json({ success: true, message: 'Badge added successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save badge' });
    }
});

// Delete a badge
app.delete('/api/badges/:userId/:index', (req, res) => {
    const { userId, index } = req.params;
    const badgeIndex = parseInt(index);
    
    const badges = readBadges();
    
    if (!badges[userId] || !badges[userId][badgeIndex]) {
        return res.status(404).json({ error: 'Badge not found' });
    }
    
    badges[userId].splice(badgeIndex, 1);
    
    // Remove user entry if no badges left
    if (badges[userId].length === 0) {
        delete badges[userId];
    }
    
    if (writeBadges(badges)) {
        res.json({ success: true, message: 'Badge deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete badge' });
    }
});

// Upload image to ImgBB
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const imageBase64 = req.file.buffer.toString('base64');
        
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', imageBase64);
        
        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.data.success) {
            res.json({ 
                success: true, 
                url: response.data.data.url,
                display_url: response.data.data.display_url
            });
        } else {
            res.status(500).json({ error: 'Failed to upload image to ImgBB' });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Discord Badge Dashboard running on http://localhost:${PORT}`);
    
    // Create badges.json if it doesn't exist
    if (!fs.existsSync(BADGES_FILE)) {
        writeBadges({});
        console.log('Created empty badges.json file');
    }
});

module.exports = app;