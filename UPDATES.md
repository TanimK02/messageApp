# Message App - Recent Updates

## Backend Changes

### Chat Routes (`/server/src/routes/chatRoute.js`)
- **Create Chat**: Now accepts `usernames` array instead of `userIds`
- **Add User**: Now accepts `username` instead of `userId`
- **Remove User**: Now accepts `username` instead of `userId`
- **Get Chats**: Now includes user details (id, username, name) in response

### User Routes (`/server/src/routes/userRoute.js`)
- **GET `/users/list/:page`**: Paginated list of all users (excluding current user)
- **GET `/users/search/:query`**: Search users by username or name (max 10 results)

## Frontend Changes

### New Component: UserList
- **Location**: `/frontend/src/components/UserList.jsx`
- **Features**:
  - Search users by name or username with debouncing
  - Pagination support
  - Single or multi-select mode
  - Visual selection indicators

### Updated ChatList Page
- Now displays chat members under each chat title
- Create Chat modal now includes:
  - Interactive user selection with UserList component
  - Selected users displayed as removable tags
  - No need to manually enter user IDs

### Updated ChatRoom Page
- **New "Manage Users" button** in navbar
- **Manage Users Modal**:
  - View all chat members
  - Remove users from chat (except yourself)
  - Add new users button
- **Add User Modal**:
  - Search and select users to add to chat
  - Single-select user list

### API Updates (`/frontend/src/utils/api.js`)
- `createChat(title, usernames)` - uses usernames array
- `addUserToChat(chatId, username)` - uses username
- `removeUserFromChat(chatId, username)` - uses username
- `getUsers(page)` - fetch paginated user list
- `searchUsers(query)` - search users

## How to Use

### Creating a Chat
1. Click "+ New Chat" on the chat list page
2. Enter a chat title
3. Search and select users from the list below
4. Selected users appear as tags at the top
5. Click "Create" to create the chat

### Managing Chat Users
1. Open any chat room
2. Click "Manage Users" in the navbar
3. View all current members
4. Remove users (except yourself)
5. Click "Add User" to add new members
6. Search and select a user to add

### Backend API Examples

**Create a chat:**
```javascript
POST /chats/create
{
  "title": "My Chat",
  "usernames": ["user1", "user2"]
}
```

**Add user to chat:**
```javascript
PUT /chats/addUser
{
  "chatId": 1,
  "username": "user3"
}
```

**Search users:**
```javascript
GET /users/search/john
// Returns users matching "john" in username or name
```

## Benefits
- ✅ More intuitive user experience (usernames instead of IDs)
- ✅ Visual user selection with search
- ✅ Easy chat member management
- ✅ Real-time user search
- ✅ No manual ID entry required
