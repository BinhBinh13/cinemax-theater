import { Routes, Route } from 'react-router-dom'
import PublicRoutes from './features/public/routes.jsx'

function App() {
  return (
    <Routes>
      {PublicRoutes}
    </Routes>
  )
}

export default App