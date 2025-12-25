
import { Appdata } from '../context/Appcontext';
const Home = () => {
  const {Logout}=Appdata()
  return (
    <div className=' flex w-[100px] m-auto mt-40'>
      <button className='bg-red-500 rounded-md text-white p-4 ' onClick={Logout}>LogOut</button>
    </div>
  )
}

export default Home