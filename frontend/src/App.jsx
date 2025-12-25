import React from 'react'
import { Routes,Route} from 'react-router-dom'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Home from './page/Home'
import Dashboard from './page/Dashboard'
import Verify from './page/verify'
import VerifyOtp from './page/VerifyOtp'
import Register from './page/Register'
import Login from './page/Login'
 const App = () => {
  return (
    <>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/login' element={< Login/>}/>
      <Route path='/Register' element={<Register/>}/>
      <Route path='/verityotp' element={<VerifyOtp/>}/>
      <Route path='/veritylink' element={<Verify/>}/>
    </Routes>
    <ToastContainer />
    </>
  )
}
export default App