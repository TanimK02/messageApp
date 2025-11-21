import { useState, useEffect } from 'react';
import { getUsers, searchUsers } from '../utils/api';
import './UserList.css';

const UserList = ({ onSelectUser, selectedUsernames = [], multiSelect = true }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchUsers = async (pageNum = 0) => {
        try {
            setLoading(true);
            const data = await getUsers(pageNum);
            setUsers(data.users);
            setTotalPages(data.pages);
            setPage(pageNum);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            fetchUsers();
            return;
        }

        try {
            setLoading(true);
            const data = await searchUsers(query);
            setUsers(data.users);
            setTotalPages(0); // No pagination for search results
        } catch (err) {
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            } else {
                fetchUsers();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleUserClick = (user) => {
        if (multiSelect) {
            if (selectedUsernames.includes(user.username)) {
                onSelectUser(selectedUsernames.filter(u => u !== user.username));
            } else {
                onSelectUser([...selectedUsernames, user.username]);
            }
        } else {
            onSelectUser(user.username);
        }
    };

    const isSelected = (username) => {
        if (multiSelect) {
            return selectedUsernames.includes(username);
        }
        return selectedUsernames === username;
    };

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <input
                    type="text"
                    placeholder="Search users by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="user-search-input"
                />
            </div>

            {error && <div className="error">{error}</div>}

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="empty-state">No users found</div>
            ) : (
                <>
                    <div className="user-list">
                        {users.map((user) => (
                            <div
                                key={user.username}
                                className={`user-item ${isSelected(user.username) ? 'selected' : ''}`}
                                onClick={() => handleUserClick(user)}
                            >
                                <div className="user-info">
                                    <h4>{user.name}</h4>
                                    <p className="username">@{user.username}</p>
                                </div>
                                {isSelected(user.username) && (
                                    <span className="check-mark">✓</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {!searchQuery && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => fetchUsers(page - 1)}
                                disabled={page === 0}
                            >
                                Previous
                            </button>
                            <span>Page {page + 1} of {totalPages}</span>
                            <button
                                onClick={() => fetchUsers(page + 1)}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserList;
