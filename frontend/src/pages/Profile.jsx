import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../utils/api';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    // Change password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setProfile(data.user);
            setName(data.user.name);
            setEmail(data.user.email);
            setUsername(data.user.username);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const updates = {};
            if (name !== profile.name) updates.name = name;
            if (email !== profile.email) updates.email = email;
            if (username !== profile.username) updates.username = username;

            if (Object.keys(updates).length === 0) {
                setIsEditing(false);
                return;
            }

            await updateProfile(updates);
            setSuccess('Profile updated successfully');
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await changePassword(oldPassword, newPassword);
            setSuccess('Password changed successfully');
            setShowPasswordForm(false);
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteAccount();
            logout();
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete account');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="profile-container">
            <nav className="navbar">
                <h1>Message App</h1>
                <div>
                    <Link to="/chats">Chats</Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="profile-content">
                <div className="profile-card">
                    <h2>Profile</h2>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    {!isEditing ? (
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="label">Name:</span>
                                <span className="value">{profile?.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Username:</span>
                                <span className="value">{profile?.username}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Email:</span>
                                <span className="value">{profile?.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Member since:</span>
                                <span className="value">{new Date(profile?.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="edit-btn">
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="edit-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    minLength={3}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="profile-card">
                    <h3>Security</h3>

                    {!showPasswordForm ? (
                        <button onClick={() => setShowPasswordForm(true)} className="action-btn">
                            Change Password
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Old Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password (min 6 characters)</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Change Password</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setOldPassword('');
                                        setNewPassword('');
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="profile-card danger-zone">
                    <h3>Danger Zone</h3>
                    <p>Once you delete your account, there is no going back.</p>
                    <button onClick={handleDeleteAccount} className="delete-btn">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
