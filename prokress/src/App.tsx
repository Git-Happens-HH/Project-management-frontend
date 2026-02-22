import './App.css'
import WelcomePage from './pages/WelcomePage.tsx'
import ProjectsPage from './pages/ProjectsPage.tsx'
import AppBar from './Components/AppBar.tsx'
import Footer from './Components/Footer.tsx'
function App() {

  return(
    <>
      <AppBar /> 
      <ProjectsPage />
      <Footer />
    </> 
  )
}

export default App
