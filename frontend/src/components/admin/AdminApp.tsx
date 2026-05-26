import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SkillsPage } from './pages/SkillsPage';
import { CertificationsPage } from './pages/CertificationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MusicPage } from './pages/MusicPage';
import { BlogPage } from './pages/BlogPage';
import { getAuthToken, isAuthenticated, logout } from '../../lib/auth';
import './admin.css';

export default function AdminApp() {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
        // Check authentication on mount
        const checkAuth = async () => {
            const token = getAuthToken();
            if (!token) {
                // Redirect to login
                window.location.href = '/alter/login';
                return;
            }

            // Verify token with backend
            try {
                const response = await fetch('/api/admin/verify', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    logout();
                    return;
                }

                setIsAuth(true);
            } catch (error) {
                console.error('Auth verification failed:', error);
                logout();
            }
        };

        checkAuth();
    }, []);

    // Show loading while checking auth
    if (isAuth === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p style={{ color: '#00ffd5', fontFamily: 'monospace' }}>Verifying credentials...</p>
            </div>
        );
    }

    // If not authenticated, don't render (redirect happens in useEffect)
    if (!isAuth) {
        return null;
    }

    return (
        <BrowserRouter basename="/alter">
            <Routes>
                <Route path="/" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="skills" element={<SkillsPage />} />
                    <Route path="certifications" element={<CertificationsPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="music" element={<MusicPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
