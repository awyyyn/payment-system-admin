import { Link, Outlet } from "react-router-dom"
import { Header } from "../components"
 

import logo from '../assets/logo.png'

const Layout = () => {

    const links = [
        {
            name: 'Dashboard',
            path: '/'
        },
        {
            name: 'Client',
            path: '/client'
        },
        {
            name: 'Payment Ledger',
            path: '/payment-ledger'
        },
        {
            name: 'Message',
            path: '/message'
        }, 
        {
            name: 'Add Payment',
            path: '/add-payment'
        }, 
    ]

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
                        <li className="text-xl ">
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
