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
import { Appdata } from './context/Appcontext';
import Spinner from './page/Spinner';
 const App = () => {
  const{isAuth,loading}= Appdata()
  return (
    <>
   {loading ? (
  <Spinner />
) : (
  <>
    <Routes>
      <Route path="/" element={ isAuth?<Home />:<Login/>} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={isAuth?<Home />:<Login/>} />
      <Route path="/register" element={<Register />} />
      <Route path="/verityotp" element={isAuth?<Home/>:<VerifyOtp />} />
      <Route path="/home" element={<Home />} />
    </Routes>

    <ToastContainer />
  </>
)}
</>
  )
}
export default App