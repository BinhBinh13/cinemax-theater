import { BrowserRouter } from 'react-router-dom'
import StaffRoutes from '@/features/staff/routes'

function App() {
  return (
    <BrowserRouter>
      <StaffRoutes />
    </BrowserRouter>
  )
}

export default App
