import { StrictMode,useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter,createBrowserRouter,RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import SettleUp from './pages/SettleUp.jsx'
import Groups from './pages/Groups.jsx'
import Activity from './pages/Activity.jsx'
import Settings from './pages/settings.jsx'
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
        path: "/Dashboard",
        element: <Dashboard ></Dashboard>
      },
      {
        path: "/Profile",
        element: <Profile></Profile>
      },
      {
        path: "/SettleUp",
        element: <SettleUp></SettleUp>
      },
      {
        path: "/Groups",
        element: <Groups></Groups>
      },
      {
        path: "/Activity",
        element: <Activity></Activity>
      },
     {
      path: "/Settings",
      element: <Settings></Settings>
     }
    ]
  },
])
  

createRoot(document.getElementById('root')).render(
   <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <RouterProvider router={router} >
    </RouterProvider>
  </GoogleOAuthProvider>
)
