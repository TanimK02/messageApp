import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessages, createMessage, updateMessage, deleteMessage, addUserToChat, removeUserFromChat, getChatUsers } from '../utils/api';
import UserList from '../components/UserList';
import './ChatRoom.css';

const ChatRoom = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [chat, setChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showManageUsersModal, setShowManageUsersModal] = useState(false);
    const [chatUsers, setChatUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const messagesEndRef = useRef(null);
    const { userId, logout } = useAuth();
    const navigate = useNavigate();

    const fetchMessages = async (pageNum = 0) => {
        try {
            setLoading(true);
            const data = await getMessages(parseInt(chatId), pageNum);
            setChat(data.chat);
            setMessages(data.messages.reverse()); // Reverse to show oldest first
            setTotalPages(data.pages);
            setPage(pageNum);
        } catch (err) {
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await createMessage(parseInt(chatId), newMessage);
            setMessages([...messages, response.message]);
            setNewMessage('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send message');
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return;

        try {
            await updateMessage(messageId, editContent);
            setMessages(messages.map(msg =>
                msg.id === messageId ? { ...msg, content: editContent } : msg
            ));
            setEditingMessageId(null);
            setEditContent('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await deleteMessage(messageId);
            setMessages(messages.filter(msg => msg.id !== messageId));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete message');
        }
    };

    const startEditing = (message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchChatUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await getChatUsers(parseInt(chatId));
            setChatUsers(data.users);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAddUser = async (username) => {
        try {
            await addUserToChat(parseInt(chatId), username);
            setShowAddUserModal(false);
            fetchChatUsers(); // Refresh user list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add user');
        }
    };

    const handleRemoveUser = async (username) => {
        if (!confirm(`Remove ${username} from this chat?`)) return;

        try {
            await removeUserFromChat(parseInt(chatId), username);
            fetchChatUsers(); // Refresh user list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to remove user');
        }
    };

    const handleOpenManageUsers = () => {
        setShowManageUsersModal(true);
        fetchChatUsers();
    };

    return (
        <div className="chat-room-container">
            <nav className="navbar">
                <div className="nav-left">
                    <Link to="/chats" className="back-link">←<span> Back to Chats</span></Link>
                    {chat && <h1>{chat.title}</h1>}
                </div>
                <div className="nav-right">
                    <button onClick={handleOpenManageUsers} className="manage-users-btn">
                        Manage Users
                    </button>
                    <Link to="/profile">Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="chat-room-content">
                {error && <div className="error">{error}</div>}

                {loading ? (
                    <div className="loading">Loading messages...</div>
                ) : (
                    <>
                        {totalPages > 1 && page < totalPages - 1 && (
                            <button className="load-more" onClick={() => fetchMessages(page + 1)}>
                                Load Older Messages
                            </button>
                        )}

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="empty-state">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.userId === parseInt(userId) ? 'own-message' : ''}`}
                                    >
                                        <div className="message-header">
                                            <span className="message-author">{message.user.username}</span>
                                            <span className="message-time">{formatTime(message.createdAt)}</span>
                                        </div>

                                        {editingMessageId === message.id ? (
                                            <div className="edit-form">
                                                <input
                                                    type="text"
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="edit-actions">
                                                    <button onClick={() => handleEditMessage(message.id)}>Save</button>
                                                    <button onClick={() => setEditingMessageId(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="message-content">{message.content}</div>
                                                {message.userId === parseInt(userId) && (
                                                    <div className="message-actions">
                                                        <button onClick={() => startEditing(message)}>Edit</button>
                                                        <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                autoFocus
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                )}
            </div>

            {showAddUserModal && (
                <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Add User to Chat</h2>
                        <div className="user-list-wrapper">
                            <UserList
                                onSelectUser={handleAddUser}
                                selectedUsernames=""
                                multiSelect={false}
                            />
                        </div>
                        <button onClick={() => setShowAddUserModal(false)} className="close-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showManageUsersModal && (
                <div className="modal-overlay" onClick={() => setShowManageUsersModal(false)}>
                    <div className="modal manage-users-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Chat Members</h2>
                        {loadingUsers ? (
                            <div className="loading">Loading users...</div>
                        ) : (
                            <div className="chat-users-list">
                                {chatUsers.map(user => (
                                    <div key={user.id} className="chat-user-item">
                                        <div>
                                            <h4>{user.name}</h4>
                                            <p>@{user.username}</p>
                                        </div>
                                        {user.id !== parseInt(userId) && (
                                            <button
                                                onClick={() => handleRemoveUser(user.username)}
                                                className="remove-user-btn"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button onClick={() => {
                                setShowManageUsersModal(false);
                                setShowAddUserModal(true);
                            }} className="add-user-btn">
                                Add User
                            </button>
                            <button onClick={() => setShowManageUsersModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;
