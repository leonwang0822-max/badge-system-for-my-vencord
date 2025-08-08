# Discord Badge Dashboard

A modern web application for managing custom Discord badges with a beautiful gradient interface and seamless image upload functionality.

## ✨ Features

- **Custom Badge Management**: Add, view, and delete custom Discord badges for users
- **Image Upload Integration**: Seamless image uploads via ImgBB API
- **Advanced Search**: Real-time search functionality with highlighting
- **Custom Delete Modal**: Elegant confirmation dialogs for badge deletion
- **Gradient Theme**: Modern UI with beautiful gradient backgrounds and animations
- **Responsive Design**: Fully responsive interface that works on all devices
- **Toast Notifications**: User-friendly success and error notifications
- **Standalone Version**: Includes a standalone HTML file for simple deployment

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- ImgBB API key (get one at [ImgBB API](https://api.imgbb.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leonwang0822-max/badge-system-for-my-vencord.git
   cd badge-system-for-my-vencord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your ImgBB API key:
   ```
   IMGBB_API_KEY=your_imgbb_api_key_here
   PORT=4000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:4000`

## 📖 Usage

### Adding a Badge

1. Enter the Discord User ID
2. Add a tooltip description
3. Either:
   - Upload an image file (PNG, JPG, GIF)
   - Provide a direct image URL
4. Click "Add Badge" to save

### Managing Badges

- **Search**: Use the search bar to filter badges by user ID or tooltip
- **View**: Click on badge images to preview them in full size
- **Delete**: Click the delete button and confirm in the modal dialog

### Standalone Version

For simple deployment without a backend, use `standalone.html`:
- All functionality works offline using localStorage
- Image uploads still work via ImgBB API
- No server setup required

## 🔧 API Documentation

### Endpoints

#### GET `/api/badges`
Retrieve all badges

**Response:**
```json
{
  "userId1": [
    {
      "tooltip": "Badge description",
      "badge": "https://image-url.com/badge.png"
    }
  ]
}
```

#### POST `/api/badges`
Add a new badge

**Request Body:**
```json
{
  "userId": "123456789",
  "tooltip": "Custom badge",
  "badge": "https://image-url.com/badge.png"
}
```

#### DELETE `/api/badges/:userId/:index`
Delete a specific badge

**Parameters:**
- `userId`: Discord user ID
- `index`: Badge index (0-based)

#### POST `/api/upload`
Upload image to ImgBB

**Request:** Multipart form data with `image` field

**Response:**
```json
{
  "success": true,
  "url": "https://i.ibb.co/...",
  "display_url": "https://i.ibb.co/..."
}
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Axios** - HTTP client for API requests
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **Vanilla JavaScript** - Core functionality
- **CSS3** - Modern styling with gradients and animations
- **HTML5** - Semantic markup
- **ImgBB API** - Image hosting service

### Storage
- **JSON File** - Local badge data storage
- **localStorage** - Client-side storage (standalone version)

## 📁 Project Structure

```
badge-system-for-my-vencord/
├── public/
│   ├── index.html          # Main application page
│   ├── script.js           # Frontend JavaScript
│   └── styles.css          # Application styles
├── server.js               # Express server
├── standalone.html         # Standalone version
├── badges.json            # Badge data storage
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment

#### Option 1: Traditional Server
1. Set up a VPS or cloud server
2. Install Node.js and npm
3. Clone the repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Start with PM2: `pm2 start server.js`

#### Option 2: Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard

#### Option 3: Standalone Deployment
1. Upload `standalone.html` to any web server
2. No backend setup required
3. Works with GitHub Pages, Netlify, etc.

### Environment Variables

For production deployment, set these environment variables:
- `IMGBB_API_KEY`: Your ImgBB API key
- `PORT`: Server port (optional, defaults to 4000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines

- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**White page on deployment:**
- Ensure all dependencies are installed
- Check that the server is running on the correct port
- Verify environment variables are set correctly
- Use the standalone version for simple deployments

**Image upload fails:**
- Verify your ImgBB API key is correct
- Check internet connectivity
- Ensure image file size is under ImgBB limits

**Badges not saving:**
- Check file permissions for `badges.json`
- Verify the server has write access to the directory
- Check server logs for error messages

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- ImgBB for providing free image hosting API
- The Discord community for inspiration
- All contributors who help improve this project

---

**Made with ❤️ for the Discord community**