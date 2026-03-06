import { Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/layout/Layout'
import LottieLoader from './components/ui/LottieLoader'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wardrobe from './pages/Wardrobe'
import Deals from './pages/Deals'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import Wallet from './pages/Wallet'
import Cart from './pages/Cart'
import Reports from './pages/Reports'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-soft-gray p-6">
          <div className="text-center max-w-md">
            <p className="text-red-500 text-lg font-bold mb-2">Bir hata oluştu</p>
            <p className="text-gray-600 text-sm mb-4">{this.state.error?.message}</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }} className="px-4 py-2 bg-swype-dark text-white rounded-sm text-sm">
              Sayfayı Yenile
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray dark:bg-swype-dark">
        <LottieLoader size={48} text="Yükleniyor..." />
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return <Layout><ErrorBoundary>{children}</ErrorBoundary></Layout>
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray dark:bg-swype-dark">
        <LottieLoader size={40} />
      </div>
    )
  }

  if (currentUser) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/wardrobe" element={<ProtectedRoute><Wardrobe /></ProtectedRoute>} />
          <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
    </LanguageProvider>
  )
}
