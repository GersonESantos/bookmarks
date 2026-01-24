import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import { apiRequest } from './lib/api';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Check auth status
        apiRequest('/auth/me')
            .then(() => setIsAuthenticated(true))
            .catch(() => setIsAuthenticated(false));
    }, []);

    if (isAuthenticated === null) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <Router>
            <div className="min-h-screen bg-background text-foreground font-sans antialiased">
                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
                    <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/home" />} />
                    <Route
                        path="/home"
                        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
                    />
                    <Route path="/" element={<Navigate to="/home" />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
