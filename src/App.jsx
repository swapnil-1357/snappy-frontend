import React, { useEffect } from 'react'
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
import Loader from './components/Loader'
import { StoryProvider } from './context/StoryContext'
import { Analytics } from "@vercel/analytics/next"

const AppRoutes = () => {
  const { isAuthLoading, user } = useAuth()

  // Wait until authentication is done
  if (isAuthLoading) {
    return <Loader />
  }

  return (
    <Routes>
      <Route path='/' element={<Home />} />

      {/* Sign-In Route */}
      <Route
        path='/sign-in'
        element={
          user?.emailVerified
            ? <Navigate to='/posts' replace />
            : <SignIn />
        }
      />

      {/* Sign-Up Route */}
      <Route
        path='/sign-up'
        element={
          user?.emailVerified
            ? <Navigate to='/posts' replace />
            : <SignUp />
        }
      />

      {/* Protected Posts Route */}
      <Route
        path='/posts'
        element={
          <ProtectedRoute>
            <Posts />
          </ProtectedRoute>
        }
      />

      {/* Protected User Route */}
      <Route
        path='/u/:param_username'
        element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
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
            <StoryProvider>
              <AppRoutes />
              <Footer />
              <Analytics/>
            </StoryProvider>
          </PostProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
