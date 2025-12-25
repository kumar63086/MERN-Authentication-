import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Appdata } from '../context/Appcontext'

const URL = "http://localhost:3000"

const VerifyOtp = () => {
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const email = localStorage.getItem("email")
  const navigate=useNavigate()
  const {setIsAuth,setUser}=Appdata()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(
        `${URL}/api/v1/auth/verifyotp`,
        { otp, email },
        { withCredentials: true }
      )

      toast.success(res.data.message)
      navigate('/home')
      setIsAuth(true)
      setUser(res.data.user)
      console.log(res.data.user ,"user");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p>Loading....!</p>
  }

  return (
    <section className="text-gray-400 bg-gray-900 body-font min-h-screen">
      <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">

        <form
          onSubmit={handleSubmit}
          className="lg:w-2/6 md:w-1/2 bg-gray-800 bg-opacity-50 rounded-lg p-8 flex flex-col md:ml-135 w-full mt-10 md:mt-0"
        >
          <h2 className="text-white text-lg font-medium title-font text-center mb-5">
            Verify OTP
          </h2>

          <div className="relative mb-4">
            <label className="leading-7 text-sm text-gray-400">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full bg-gray-600 bg-opacity-20 focus:bg-transparent focus:ring-2 focus:ring-indigo-900 rounded border border-gray-600 focus:border-indigo-500 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>

          <button
            type='submit'
            className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Verify"}
          </button>

          <p className="text-xs mt-3">
            Already have an account?{" "}
            <Link to="/Login">
              <span className="underline text-white">Login</span>
            </Link>
          </p>

        </form>
      </div>
    </section>
  )
}

export default VerifyOtp
