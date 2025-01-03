import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/Signin'
import Posts from './pages/Posts'
import SignUp from './pages/Signup'
import User from './pages/User'
import Footer from './components/Footer'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import { PostProvider } from './context/PostContext'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './components/NotFound'
import AccessDenied from './components/AccessDenied'




const AppRoutes = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path='/' element={<Home />} />

      <Route
        path='/sign-in'
        element={isAuthenticated ? <Navigate to='/posts' /> : <SignIn />}
      />
      <Route
        path='/sign-up'
        element={isAuthenticated ? <Navigate to='/posts' /> : <SignUp />}
      />

      <Route
        path='/posts'
        element={
          <ProtectedRoute>
            <Posts />
          </ProtectedRoute>
        }
      />
      <Route
        path='/u/:param_username'
        element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <PostProvider>
            <AppRoutes />
            <Footer />
          </PostProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
