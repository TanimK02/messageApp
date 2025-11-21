import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import Profile from './pages/Profile';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/chats"
                        element={
                            <ProtectedRoute>
                                <ChatList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat/:chatId"
                        element={
                            <ProtectedRoute>
                                <ChatRoom />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/chats" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
