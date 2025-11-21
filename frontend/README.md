# Message App Frontend

A React-based frontend for the Message App, built with Vite.

## Features

- User authentication (login/register)
- Chat list with pagination
- Real-time messaging in chat rooms
- Message editing and deletion
- User profile management
- Password change functionality
- Account deletion

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Backend server running on http://localhost:3000

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

## API Integration

The frontend connects to the backend API at `http://localhost:3000`. All responses follow the pattern `response.data.<property>`:

- Authentication: `response.data.token`, `response.data.userId`
- Chats: `response.data.chats`, `response.data.pages`
- Messages: `response.data.messages`, `response.data.chat`, `response.data.pages`
- User: `response.data.user`

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx       # Authentication context
├── pages/
│   ├── Login.jsx             # Login page
│   ├── Register.jsx          # Registration page
│   ├── ChatList.jsx          # List of chats
│   ├── ChatRoom.jsx          # Individual chat room
│   └── Profile.jsx           # User profile
├── utils/
│   └── api.js                # API client with axios
├── App.jsx                   # Main app component
└── main.jsx                  # Entry point
```

## Features by Page

### Login / Register
- Email or username login
- Form validation
- JWT token storage

### Chat List
- Paginated chat list
- Create new chats
- Navigate to chat rooms

### Chat Room
- View messages in a chat
- Send new messages
- Edit your own messages
- Delete your own messages
- Load older messages with pagination

### Profile
- View profile information
- Edit profile details
- Change password
- Delete account
