import './App.css'
import WelcomePage from './pages/WelcomePage.tsx'
import ProjectsPage from './pages/ProjectsPage.tsx'
import ProjectPage from './pages/ProjectPage.tsx'
import AppBar from './Components/AppBar.tsx'
import Footer from './Components/Footer.tsx'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function App() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true)
            if (window.location.pathname === '/') {
                navigate('/projects');
            }
        } else {
            navigate('/')
        }
    }, [])
    return (
        <>
            <AppBar isLoggedIn={isLoggedIn} />
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/project/:id" element={<ProjectPage />} />
            </Routes>
            <Footer />
        </>
    )
}

export default App
