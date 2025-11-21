import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../utils/api';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiRegister(email, password, username, name);
            login(data.token, data.userId);
            navigate('/chats');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username (min 3 characters)</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={3}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password (min 6 characters)</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
