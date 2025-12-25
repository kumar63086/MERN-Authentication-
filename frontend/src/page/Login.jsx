import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
const URL="http://localhost:3000"
const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false)
    const navigate=useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            
          const res = await axios.post( `${URL}/api/v1/auth/login`, formData,{ withCredentials: true });


            toast.success(res.data.message);  

            console.log(res.data);
            localStorage.setItem("email",formData.email)
            navigate('/verityotp') 
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false)
        }

    }
    
    

    const hanlechange=(e)=>{
        const {name,value}=e.target
        setFormData((prev)=>({...prev,[name]:value}))
    }

    return (
       <>{
        loading?(<Spinner/>):(
             <section className="text-gray-400 bg-gray-900 body-font min-h-screen">
            <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">

                <form onSubmit={handleSubmit} className="lg:w-2/6 md:w-1/2 bg-gray-800 bg-opacity-50 rounded-lg p-8 flex flex-col md:ml-135 w-full mt-10 md:mt-0">
                    <h2 className="text-white text-lg font-medium title-font mb-5">Login</h2>
                    <div className="relative mb-4">
                        <label htmlFor="email" className="leading-7 text-sm text-gray-400">Email</label>
                        <input type="email" id="email" name='email' required value={formData.email} onChange={hanlechange}
                        
                        className="w-full bg-gray-600 bg-opacity-20 focus:bg-transparent focus:ring-2 focus:ring-indigo-900 rounded border border-gray-600 focus:border-indigo-500 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="password" className="leading-7 text-sm text-gray-400">Password</label>
                        <input type="password" id="password" onChange={hanlechange} name="password" value={formData.password} required className="w-full bg-gray-600 bg-opacity-20 focus:bg-transparent focus:ring-2 focus:ring-indigo-900 rounded border border-gray-600 focus:border-indigo-500 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <button type='submit' className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg " disabled={loading}>{loading?"submitting...":"Login"}</button>
                    <p className="text-xs mt-3">Dont have account.? <Link to={"/Register"}><span className='underline text-white'>Rgister</span></Link></p>
                </form>
            </div>
        </section>
        )
       }
       </>
    )
}

export default Login