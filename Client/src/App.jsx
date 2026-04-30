import { Routes , Route } from "react-router-dom"
import { Login } from "./components/Login"
function App() {

  return (
  <>
   <Routes>
    <Route path="/" element={<h1>Landing Page here!!</h1>}></Route>
    <Route path="/login" element={<Login></Login>}></Route>
   </Routes>
  </>
  )
}

export default App
