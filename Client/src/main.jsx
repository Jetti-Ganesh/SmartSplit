import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter,createBrowserRouter,RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Groups from './pages/Groups.jsx'

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <App /> ,
    children:[
      {
        path: "/",
        element: <LandingPage></LandingPage>
      },
      {
        path: "/signUp",
        element: <SignUp></SignUp>
      },
      {
        path: "/Login",
        element: <Login></Login>
      },
      {
        path: "/Home",
        element: <h1 style={{ textAlign: 'center', marginTop: '8rem' }}>Home Page - Protected Route</h1>
      },
      {
        path: "/groups",
        element: <Groups />
      }
    ]
  },
])
  

createRoot(document.getElementById('root')).render(
   <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <RouterProvider router={router} >
      <App />
    </RouterProvider>
  </GoogleOAuthProvider>
)
