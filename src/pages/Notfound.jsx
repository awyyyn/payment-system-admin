import { useNavigate } from 'react-router-dom'
import notfound from '../assets/404.jpg' 


const Notfound = () => {

    const navigate = useNavigate();

    return (
        <main className="md:container grid place-content-center h-screen w-screen min-h-[600px] overflow-hidden"> 
            
            <h1 className="text-center text-xl md:text-4xl font-bold leading-8 text-transparent bg-clip-text bg-gradient-to-br from-warning to-green-800">
                Bicol Amigo&apos;s Lending Corporation 
            </h1> 
            <img src={notfound} className='max-w-[500px]' /> 
            <h1 className="text-center text-lg md:text-2xl font-bold leading-8 text-transparent bg-clip-text bg-gradient-to-br from-warning to-green-800">
                Error: Page not found 
            </h1> 
            <button className='btn btn-accent mt-10 max-w-[200px] min-w-[200px] mx-auto text-white hover:shadow-lg' onClick={() => navigate('/')}>
                Home
            </button>
            {/* <a href="https://www.vecteezy.com/vector-art/5084699-internet-network-warning-404-error-page-or-file-not-found-for-web-page-internet-error-page-or-issue-not-found-on-network">Internet network warning 404 Error Page or File not found for web page. Internet  error page or issue not found on network. Vectors by Vecteezy</a> */}
        </main>
    )
}

export default Notfound
