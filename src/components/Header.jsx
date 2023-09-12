import logo from '../assets/logo.png' 

const Header = ({handleClick, role}) => {

    return (
        <div className="navbar bg-base-100  fixed md:hidden shadow-md">
            <div className="navbar-start"> 
                <label tabIndex={0} htmlFor='my-drawer-3' onClick={handleClick} className="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                </label> 
            </div>
            <div className="navbar-end">
                <a className="btn btn-ghost normal-case text-xl">{role}</a> 
                <img src={logo} className='h-10 w-10' />  
            </div> 
        </div>
    )
}

export default Header
