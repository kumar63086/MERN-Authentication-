import { useState } from "react";
import { createContext } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import api from "../page/apiintersper";

const AppContext=createContext()
export const AppProvider=({children})=>{
    const [user,setUser]=useState(null)
    const [loading,setLoading]=useState(false)
    const[isAuth,setIsAuth]=useState(false)

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
    useEffect(() => {
    fetchuser();
  }, []);

    return <AppContext.Provider value={{setIsAuth, isAuth,user,setUser,loading}}>{children}</AppContext.Provider>
}


export const Appdata=()=>{
    const context= useContext(AppContext)
    if(!context) throw new Error ('AppData must be used within an Appprvider')

        return context
}