import './App.css'
import WelcomePage from './pages/WelcomePage.tsx'
import ProjectsPage from './pages/ProjectsPage.tsx'
import AppBar from './Components/AppBar.tsx'
import Footer from './Components/Footer.tsx'
import { Routes, Route } from 'react-router-dom'
function App() {

  return(
    <>
      <AppBar />
      <Routes>
         <Route path="/" element={<WelcomePage />} />
         <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <Footer />
    </> 
  )
}

export default App
