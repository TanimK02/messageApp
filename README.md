# Message App

A full-stack real-time messaging application built with React and Node.js, featuring user authentication, chat management, and responsive design.

## Features

### Authentication
- 🔐 JWT-based authentication with automatic token expiration handling
- 📧 Register with email, username, and password
- 🔑 Login with email or username
- 🔄 Automatic logout on token expiration
- 👤 User profile management

### Chat Management
- 💬 Create group chats with multiple users
- 👥 Add/remove users from existing chats
- ✏️ Rename chats
- 🔍 Search and select users by username or name
- 📋 View chat members
- ⏰ Display chat last updated time

### Messaging
- ✉️ Send, edit, and delete messages
- 👁️ View message history with pagination
- 🕐 Smart timestamp display (time only for today, date + time for older messages)
- 💬 Message ownership indicators
- ⚡ Real-time message updates

### User Interface
- 📱 Fully responsive design for mobile and desktop
- 🎨 Modern gradient theme
- 🔄 Interactive modals for chat creation and user management
- 🔎 Live user search with debouncing
- 📄 Paginated lists for chats, messages, and users

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Vite** - Fast build tool and dev server
- **CSS3** - Styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

## Project Structure

```
MessageApp/
├── apps/
│   ├── frontend/          # React application
│   │   ├── src/
│   │   │   ├── components/    # Reusable components
│   │   │   │   └── UserList.jsx
│   │   │   ├── context/       # React context
│   │   │   │   └── AuthContext.jsx
│   │   │   ├── pages/         # Page components
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ChatList.jsx
│   │   │   │   ├── ChatRoom.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── utils/         # Utilities
│   │   │   │   └── api.js
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── server/            # Node.js backend
│       ├── src/
│       │   ├── config/        # Configuration files
│       │   │   ├── passport.js
│       │   │   └── prisma.js
│       │   ├── routes/        # API routes
│       │   │   ├── userRoute.js
│       │   │   ├── chatRoute.js
│       │   │   └── messageRoute.js
│       │   └── generated/     # Prisma client
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── index.js
│       └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile (protected)
- `PUT /users/update` - Update user profile (protected)
- `POST /users/changePassword` - Change password (protected)
- `DELETE /users/delete` - Delete account (protected)

### Users
- `GET /users/list/:page` - Get paginated user list (protected)
- `GET /users/search/:query` - Search users by username/name (protected)

### Chats
- `GET /chats/page/:pageIndex` - Get paginated chats (protected)
- `POST /chats/create` - Create new chat with usernames array (protected)
- `PUT /chats/rename` - Rename chat (protected)
- `PUT /chats/addUser` - Add user to chat by username (protected)
- `PUT /chats/removeUser` - Remove user from chat by username (protected)
- `GET /chats/:chatId/users` - Get chat members (protected)

### Messages
- `GET /messages/chat/:chatId/:page` - Get paginated messages for chat (protected)
- `POST /messages/create` - Send message (protected)
- `PUT /messages/:messageId` - Edit message (protected)
- `DELETE /messages/:messageId` - Delete message (protected)

## Database Schema

### User
- `id` - Integer (Primary Key)
- `email` - String (Unique)
- `username` - String (Unique)
- `name` - String
- `passwordHash` - String
- `verified` - Boolean
- `createdAt` - DateTime
- `updatedAt` - DateTime

### Chat
- `id` - Integer (Primary Key)
- `title` - String
- `createdAt` - DateTime
- `updatedAt` - DateTime
- Relationships: Many-to-Many with Users, One-to-Many with Messages

### Message
- `id` - Integer (Primary Key)
- `content` - String
- `chatId` - Integer (Foreign Key)
- `userId` - Integer (Foreign Key)
- `createdAt` - DateTime
- `updatedAt` - DateTime

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd apps/server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/messageapp"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd apps/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/utils/api.js` if needed:
```javascript
const API_URL = 'http://localhost:3000';
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Usage

### Creating an Account
1. Click "Register" on the login page
2. Enter your name, username (min 3 characters), email, and password (min 6 characters)
3. You'll be automatically logged in after registration

### Creating a Chat
1. Click "+ New Chat" on the chat list page
2. Enter a chat title
3. Search and select users to add to the chat
4. Click "Create"

### Managing Chat Members
1. Open any chat
2. Click "Manage Users" in the navbar
3. View current members
4. Remove users or click "Add User" to add new members

### Sending Messages
1. Open a chat from your chat list
2. Type your message in the input field at the bottom
3. Press Enter or click "Send"
4. Edit or delete your own messages using the action buttons

## Key Features Explained

### Token Expiration Handling
- JWT tokens are validated on app load
- Periodic checks (every 60 seconds) detect expired tokens
- Automatic logout and redirect on expiration
- 401 responses trigger immediate logout

### Username-Based User Management
- Users are added to chats using usernames (not IDs)
- Live search functionality for finding users
- Multi-select interface for bulk user selection
- Visual feedback for selected users

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Adaptive navigation (hides text on small screens)
- Touch-friendly buttons and inputs

### Smart Timestamps
- Shows time only for messages sent today
- Shows date + time for older messages
- Formatted for user's locale

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes requiring valid tokens
- Token expiration validation
- SQL injection prevention via Prisma ORM
- CORS configuration for API security

## Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Push notifications
- [ ] Dark mode
- [ ] Message search
- [ ] Chat archiving
- [ ] User blocking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built as part of The Odin Project curriculum
- Inspired by modern messaging applications
- Uses React, Express, and Prisma best practices
