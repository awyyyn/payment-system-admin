
import { useState } from 'react'
import logo from '../assets/logo.png'
// import logo2 from '../assets/logo2.png'

const Signin = () => {

    const [verifying, setVerifying] = useState(false)

    const handleSignIn = async() => {
        setVerifying(true)
    }


    return (
        <main className="md:container relative h-screen w-screen md:mx-auto md:min-h-[550px]  grid place-content-center overflow-y-auto"> 
            <img src={logo} className='h-32 hidden md:block absolute top-5 left-5' />
            <h1 className='hidden md:block text-4xl absolute text-center top-14 font-bold bg-gradient-to-br from-[35%] from-yellow-400 to-green-900 text-transparent bg-clip-text left-[50%] -translate-x-[50%]'>Bicol Amigo&apos;s  Lending Corporation</h1>
            <div className='rounded-lg shadow-lg shadow-orange-100 z-50 w-[85vw] md:w-full  p-5 flex flex-col items-center gap-2'>
                <img src={logo} className='h-24 md:hidden block' />
                <h1 className='text-3xl font-semibold'>Sign in</h1>
                <div className='flex  flex-col w-full gap-y-5'>
                    <div>
                        <label htmlFor='username' className='block'>Username</label>
                        <input type="text" disabled={verifying} placeholder="Username" id='username' className="input input-bordered input-warning w-full max-w-lg md:min-w-[340px]" />
                    </div>
                    <div>
                        <label htmlFor='password' className='block '>Password</label>
                        <input type="password" disabled={verifying} placeholder="Password" id='password' className="input input-bordered input-warning w-full md:min-w-[340px]" />
                    </div>
                    <button className={`btn ${verifying ? 'bg-slate-100' : 'bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500'}  mb-2`} onClick={handleSignIn}>
                        {verifying ?
                            <>
                                <span className="loading loading-spinner"></span>
                                Verifying
                            </>
                            : "Sign in"
                        }
                        
                    </button>
                </div>
            </div>
            {/* <img src={logo2} className='block md:hidden opacity-20 absolute bottom-0 left-0 w-[50%] -z-10' /> */}
        </main>
    )
}

export default Signin
