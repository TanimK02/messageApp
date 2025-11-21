import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChats, createChat } from '../utils/api';
import UserList from '../components/UserList';
import './ChatList.css';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [selectedUsernames, setSelectedUsernames] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { logout, userId } = useAuth();
    const navigate = useNavigate();

    const fetchChats = async (page = 0) => {
        try {
            setLoading(true);
            const data = await getChats(page);
            setChats(data.chats);
            setTotalPages(data.pages);
            setPageIndex(page);
        } catch (err) {
            setError('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const handleCreateChat = async (e) => {
        e.preventDefault();
        try {
            if (!newChatTitle.trim()) {
                setError('Please enter a chat title');
                return;
            }
            await createChat(newChatTitle, selectedUsernames);
            setShowCreateModal(false);
            setNewChatTitle('');
            setSelectedUsernames([]);
            fetchChats(pageIndex);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create chat');
        }
    }; const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-list-container">
            <nav className="navbar">
                <h1>Message App</h1>
                <div>
                    <Link to="/profile">Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="chat-list-content">
                <div className="chat-list-header">
                    <h2>Your Chats</h2>
                    <button onClick={() => setShowCreateModal(true)} className="create-chat-btn">
                        + New Chat
                    </button>
                </div>

                {error && <div className="error">{error}</div>}

                {loading ? (
                    <div className="loading">Loading chats...</div>
                ) : chats.length === 0 ? (
                    <div className="empty-state">
                        <p>No chats yet. Create one to get started!</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-list">
                            {chats.map((chat) => (
                                <Link to={`/chat/${chat.id}`} key={chat.id} className="chat-item">
                                    <div className="chat-info">
                                        <h3>{chat.title}</h3>
                                        <p className="chat-users">
                                            {chat.users?.map(u => u.name).join(', ') || 'No users'}
                                        </p>
                                        <p className="chat-date">Last updated: {formatDate(chat.updatedAt)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => fetchChats(pageIndex - 1)}
                                    disabled={pageIndex === 0}
                                >
                                    Previous
                                </button>
                                <span>Page {pageIndex + 1} of {totalPages}</span>
                                <button
                                    onClick={() => fetchChats(pageIndex + 1)}
                                    disabled={pageIndex >= totalPages - 1}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Chat</h2>
                        <form onSubmit={handleCreateChat}>
                            <div className="form-group">
                                <label htmlFor="title">Chat Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={newChatTitle}
                                    onChange={(e) => setNewChatTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Select Users to Add</label>
                                <div className="selected-users">
                                    {selectedUsernames.length === 0 ? (
                                        <p className="hint">Click on users below to add them to the chat</p>
                                    ) : (
                                        <div className="selected-tags">
                                            {selectedUsernames.map(username => (
                                                <span key={username} className="selected-tag">
                                                    {username}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedUsernames(selectedUsernames.filter(u => u !== username))}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="user-list-wrapper">
                                    <UserList
                                        onSelectUser={setSelectedUsernames}
                                        selectedUsernames={selectedUsernames}
                                        multiSelect={true}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatList;
