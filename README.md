# StudentAdda

A full-stack productivity application designed to help students with essential tools and utilities. StudentAdda provides a suite of features including a calculator, PDF generator, todo list management, and typing speed tests.

## Features

- **Calculator**: Quick calculations for mathematical operations
- **PDF Generator**: Generate and download documents as PDFs
- **Todo List**: Manage and organize your tasks efficiently
- **Typing Test**: Test and improve your typing speed and accuracy

## Tech Stack

### Frontend
- **React** 19.2.3 - UI library
- **React Router** 7.11.0 - Client-side routing
- **Bootstrap** 5.3.8 - CSS framework
- **jsPDF** 4.0.0 - PDF generation
- **Axios** 1.13.2 - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** 5.2.1 - Web framework
- **MongoDB** - Database
- **Mongoose** 9.1.2 - MongoDB ODM
- **Passport** - Authentication
- **Google OAuth 2.0** - Social authentication
- **CORS** - Cross-origin support

## Project Structure

```
StudentAdda/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Calculator.js
│   │   │   ├── PdfGenerator.js
│   │   │   ├── TodoList.js
│   │   │   └── TypingTest.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StudentAdda
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file in the server directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/studentadda
   PORT=5000
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

## Running the Application

### Development Mode

**Terminal 1 - Start Backend Server**
```bash
cd server
npm start
```
Server runs on `http://localhost:5000`

**Terminal 2 - Start React Development Server**
```bash
cd client
npm start
```
Frontend runs on `http://localhost:3000`

### Production Build

```bash
cd client
npm run build
```

This creates an optimized production build in the `build/` folder.

## Available Scripts

### Client Scripts
- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (one-way operation)

### Server Scripts
- `npm start` - Start the Express server

## Environment Variables

### Server (.env)
```env
MONGO_URI=mongodb://localhost:27017/studentadda
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

## API Endpoints

Backend API endpoints for the features (detailed documentation to be added)

## Contributing

Contributions are welcome! Please follow these steps:
1. Create a feature branch (`git checkout -b feature/YourFeature`)
2. Commit changes (`git commit -m 'Add YourFeature'`)
3. Push to branch (`git push origin feature/YourFeature`)
4. Open a Pull Request

## License

ISC License - see LICENSE file for details

## Support

For issues or questions, please create an issue in the repository.

---

**Last Updated**: January 2026
