import { useState } from "react";
import { createContext } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import api from "../page/apiintersper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AppContext=createContext()
export const AppProvider=({children})=>{
    const [user,setUser]=useState(null)
    const [loading,setLoading]=useState(false)
    const[isAuth,setIsAuth]=useState(false)
const navigate=useNavigate()
    async function fetchuser(){
        setLoading(true)
        try {
            const res= await api.get(`/api/v1/auth/me`)
            setUser(res)
            setIsAuth(true)
        } catch (error) {
         setUser(null);
         setIsAuth(false);
         console.error(error?.response?.data?.message || error.message);
        }finally{
            setLoading(false)
        }
    }

    async function Logout(){
        try {
         const res = await api.post( `/api/v1/auth/logout`,);  
          toast.success(res.data.message);
          setIsAuth(false)
          setUser(null)
           navigate('/login')
        } catch (err) {
           toast.error(err.response?.data?.message || "Something went wrong");
        }
    }
    useEffect(() => {
    fetchuser();
  }, []);

    return <AppContext.Provider value={{setIsAuth, isAuth,user,setUser,loading,Logout}}>{children}</AppContext.Provider>
}


export const Appdata=()=>{
    const context= useContext(AppContext)
    if(!context) throw new Error ('AppData must be used within an Appprvider')

        return context
}