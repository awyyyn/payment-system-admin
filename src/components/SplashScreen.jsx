 
import logo from '../assets/logo.png' 

const SplashScreen = () => {
 

    return (
        <div className="h-screen w-screen min-h-[400px]  grid place-content-center">
            <img src={logo} alt="logo" loading='lazy' className='h-24 sm:h-28 md:h-36 lg:h-52 mx-auto drop-shadow-2xl rounded-full' /> 
            <span className="loading loading-dots text-yellow-400 loading-lg mx-auto mt-3"></span>
        </div>
    )
}

export default SplashScreen
