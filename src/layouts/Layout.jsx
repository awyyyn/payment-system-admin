import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"  
import logo from '../assets/logo.png'
import supabase from "../lib/supabase"
import { Suspense, lazy, useEffect } from "react"
import { MdDashboard } from 'react-icons/md'
// import { FaPesoSign} from 'react-icons/fa'
import { FaPesoSign, FaMoneyBills } from 'react-icons/fa6'
import { PiUsersThreeFill } from 'react-icons/pi' 
import { BiSolidLogOut } from 'react-icons/bi' 
import { TbTallymarks } from 'react-icons/tb'


const SplashScreen = lazy(() => import('../components/SplashScreen'))
const Header = lazy(() => import('../components/Header'))

const Layout = () => {

    const navigate = useNavigate(); 
    
    useEffect(() => {
        const data = localStorage.getItem('sb-smoqrpjagpmjromdiwdw-auth-token')
        if(data == null) return navigate('/sign-in') 
    }, [navigate])

    const location = useLocation(); 

    const links = [
        {
            name: 'Dashboard',
            path: '/',
            icon: <MdDashboard />
        },
        // {
            //     name: 'Payment Ledger',
        //     path: '/payment-ledger'
        // },
        // {
        //     name: 'Message',
        //     path: '/message'
        // }, 
        {
            name: 'Create Payment',
            path: '/create-payment',
            icon: <FaPesoSign />
            
        }, 
        {
            name: 'Create Loan',
            path: '/create-loan',
            icon: <FaMoneyBills />
        }, 
        {
            name: 'Client',
            path: '/client',
            icon: <PiUsersThreeFill />
        },
        {
            name: 'Tally',
            path: '/tally',
            icon: <TbTallymarks />
        },
    ]


    const handleSignOut = async() => {
        console.log("CLICKED")
        await supabase.auth.signOut()
        navigate('/sign-in')
    }



    return (
        <>
            <Suspense fallback={<SplashScreen />}>
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
                            <h1 className="mx-auto font-bold text-2xl my-2 text-center">Administrator</h1>
                            {links.map(({name, path, icon}, i) => (
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
                            ))}
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
