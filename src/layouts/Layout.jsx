import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"  
import logo from '../assets/logo.png'
import supabase from "../lib/supabase"
import { Suspense, lazy, useContext, useEffect } from "react"
import { MdDashboard } from 'react-icons/md'
// import { FaPesoSign} from 'react-icons/fa'
import { FaPesoSign, FaMoneyBills } from 'react-icons/fa6'
import { PiUsersThreeFill } from 'react-icons/pi' 
import { BiSolidLogOut } from 'react-icons/bi' 
import { TbTallymarks } from 'react-icons/tb'
import { IoIosNotifications } from 'react-icons/io'
// import { CorpContext } from "../context/context";
import CryptoJS from "crypto-js"
import { CorpContext } from "../context/AppContext"
import { SplashScreen } from "../components"

 
const Header = lazy(() => import('../components/Header'))

const Layout = () => {

    const { userData, setUserData } = useContext(CorpContext);

    const path = useLocation();
 
    const navigate = useNavigate();  
    
    useEffect(() => {
        
        const data = localStorage.getItem('sb-smoqrpjagpmjromdiwdw-auth-token')
        if(data == null) { 
            return navigate('/sign-in');
        }

        const storedData = localStorage.getItem('encryptedData');  
        const bytes = CryptoJS.AES.decrypt(storedData, 'secretKey');
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); 
        if(!decryptedData ){ 
            return navigate('/sign-in');
        }
        setUserData({
            name: decryptedData.name,
            email: decryptedData.email,
            role: decryptedData.role,
        }) 


        // setUserData({})
            
    }, [path])
 

    const adminLinks = [
        {
            name: 'Dashboard',
            path: '/',
            icon: <MdDashboard />
        }, 
        {
            name: 'Create Loan',
            path: '/create-loan',
            icon: <FaMoneyBills />
        }, 
        {
            name: 'Create Payment',
            path: '/create-payment',
            icon: <FaPesoSign />
            
        }, 
        {
            name: 'Clients',
            path: '/clients',
            icon: <PiUsersThreeFill />
        },
        {
            name: 'Notify',
            path: '/notify-clients',
            icon: <IoIosNotifications />
        },
        {
            name: 'Tally',
            path: '/tally',
            icon: <TbTallymarks />
        },
    ]

    const collectorLinks = [
        {
            name: 'Dashboard',
            path: '/',
            icon: <MdDashboard />
        },  
        {
            name: 'Create Payment',
            path: '/create-payment',
            icon: <FaPesoSign />
            
        }, 
        {
            name: 'Clients',
            path: '/clients',
            icon: <PiUsersThreeFill />
        },
        {
            name: 'Notify',
            path: '/notify-clients',
            icon: <IoIosNotifications />
        },
        {
            name: 'Tally',
            path: '/tally',
            icon: <TbTallymarks />
        },
    ] 

    const handleSignOut = async() => { 
        await supabase.auth.signOut()
        localStorage.removeItem('encryptedData')
        navigate('/sign-in')
    }



    return (
        <>
            <Suspense fallback={<SplashScreen />} >
                <main className="drawer md:drawer-open transition-all ">
                    <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
                    <div className="drawer-content flex flex-col">
                        {/* Navbar */} 
                        <Header /> 
                        {/* Page content here */}
                        <div className="px-5 py-10 mt-12 md:mt-0 w-screen md:w-auto ">
                            <Outlet />
                        </div>
                    </div> 
                    <div className="drawer-side  overflow-hidden transition-all ">
                        <label htmlFor="my-drawer-3" className="drawer-overlay"></label> 
                        <ul className="menu p-4 w-80 bg-yellow-200 h-screen block  overflow-y-auto">
                            {/* Sidebar content here */}
                            <img src={logo} alt="Logo" className="max-w-[200px] mx-auto " />
                            <h1 className="mx-auto font-bold text-2xl my-2 text-center capitalize">{userData.name}</h1>
                            {<NavLinks navLinks={userData.role == "collector" ? collectorLinks : adminLinks } />}
                            <li className="text-xl "  onClick={handleSignOut}>
                                <label htmlFor="my-drawer-3">
                                    <button className="text-error font-semibold flex items-center gap-x-4">
                                        <span><BiSolidLogOut /></span>
                                        Logout
                                    </button>
                                </label>
                            </li>
                        </ul> 
                    </div>
                </main>
            </Suspense>
        </>
    )
}

export default Layout


const NavLinks = ({navLinks}) => {

    return(
        navLinks.map(({name, path, icon}, i) => (
            <NavLink to={`${path}`} key={i}  >
                <li className={`text-xl my-1  rounded-lg ${location.pathname == path ? 'bg-slate-900 bg-opacity-10' : ''}`} >
                    <label htmlFor="my-drawer-3 ">
                        <div className="flex gap-x-4 items-center">
                            <span>{icon}</span>
                            <p>{name} </p>
                        </div>
                    </label>  
                </li>
            </NavLink>
        ))
    )
} 