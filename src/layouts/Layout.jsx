import { Link, Outlet, useNavigate } from "react-router-dom"  
import logo from '../assets/logo.png'
import supabase from "../lib/supabase"
import { lazy, useEffect, useState } from "react"

const SplashScreen = lazy(() => import('../components/SplashScreen'))
const Header = lazy(() => import('../components/Header'))

const Layout = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const data = localStorage.getItem('sb-smoqrpjagpmjromdiwdw-auth-token')
        if(data == null) return navigate('/sign-in')
        setLoading(false);
    }, [navigate])

    const links = [
        {
            name: 'Dashboard',
            path: '/'
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
            path: '/create-payment'
        }, 
        {
            name: 'Create Loan',
            path: '/create-loan'
        }, 
        {
            name: 'Client',
            path: '/client'
        },
    ]


    const handleSignOut = async() => {
        console.log("CLICKED")
        await supabase.auth.signOut()
        navigate('/sign-in')
    }


    if(loading) return <SplashScreen />

    return (
        <>
            <main className="drawer md:drawer-open ">
                <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
                <div className="drawer-content flex flex-col">
                    {/* Navbar */}
                    <Header />
                    {/* Page content here */}
                    <div className="px-5 py-10 mt-12 md:mt-0 w-screen md:w-auto ">
                        <Outlet />
                    </div>
                </div> 
                <div className="drawer-side  overflow-hidden  ">
                    <label htmlFor="my-drawer-3" className="drawer-overlay"></label> 
                    <ul className="menu p-4 w-80 bg-yellow-200 h-screen block  overflow-y-auto">
                        {/* Sidebar content here */}
                        <img src={logo} alt="Logo" className="max-w-[200px] mx-auto " />
                        <h1 className="mx-auto font-bold text-2xl my-2 text-center">Administrator</h1>
                        {links.map(({name, path}, i) => (
                            <Link to={`${path}`} key={i}>
                                <li className="text-xl my-1" >
                                    <label htmlFor="my-drawer-3 ">
                                        <div>
                                            <p>{name} </p>
                                        </div>
                                    </label>  
                                </li>
                            </Link>
                        ))}
                        <li className="text-xl "  onClick={handleSignOut}>
                            <label htmlFor="my-drawer-3">
                                <button className="text-error font-semibold">Logout</button>
                            </label>
                        </li>
                    </ul> 
                </div>
            </main>
        </>
    )
}

export default Layout
