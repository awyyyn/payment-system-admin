
import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import supabase from '../lib/supabase'; 
import { useNavigate } from 'react-router-dom';
import { SplashScreen } from '../components';
// import logo2 from '../assets/logo2.png'

const Signin = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)

      
    useEffect(() => {
        const data = localStorage.getItem('sb-smoqrpjagpmjromdiwdw-auth-token')
        if(data != null) return navigate('/')
        setLoading(false);
    }, [navigate])
    
    const [verifying, setVerifying] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formError, setFormError] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(e.target.name == "email") {
            if(emailPattern.test(e.target.value)){
                setFormError((prev) => ({...prev, email: ""}))
            }else{
                setFormError((prev) => ({...prev, email: "Invalid email format!"}))
            }
        }else{
            if(e.target.value.length < 6) {
                setFormError((prev) => ({...prev, password: "Password is too short!"}))
            }else{
                setFormError((prev) => ({...prev, password: ""}))
            }
        }

        setFormData((prevData) => ({
          ...prevData,
            [e.target.name]: e.target.value
        }))
    }
 

    const handleSignIn = async() => {
        if(!formData.email ) setFormError((prev) => ({...prev, email: "Email required!"}))
        if(!formData.password ) setFormError((prev) => ({...prev, password: "Password required!"}))
        if(formError.email || formError.password || !formData.email || !formData.password) return  
        setVerifying(true); 
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if(error) {
            setVerifying(false);
            return console.log(error)
        }
        
        console.log(data)
        navigate('/')
         
    }

    if(loading) return <SplashScreen />

    return (
        <main className="md:container relative h-screen w-screen md:mx-auto md:min-h-[550px]  grid place-content-center overflow-y-auto"> 
            <img src={logo} className='h-32 hidden md:block absolute top-5 left-5' />
            <h1 className='hidden md:block text-4xl absolute text-center top-14 font-bold bg-gradient-to-br from-[35%] from-yellow-400 to-green-900 text-transparent bg-clip-text left-[50%] -translate-x-[50%]'>Bicol Amigo&apos;s  Lending Corporation</h1>
            <div className='rounded-lg shadow-xl shadow-orange-400  z-50 w-[85vw] md:w-full  p-5 flex flex-col items-center gap-2'>
                <img src={logo} className='h-24 md:hidden block' />
                <h1 className='text-3xl font-semibold'>Sign in</h1>
                <div className='flex  flex-col w-full gap-y-5'>
                    <div className='space-y-2'>
                        <label htmlFor='Email' className='block'>Email</label>
                        <input onChange={handleChange} type="text" disabled={verifying} placeholder="Email" id='Email' name='email' className="input input-bordered input-warning w-full max-w-lg md:min-w-[340px]" />
                        <label htmlFor='username' className='block text-sm text-red-600 font-semibold text-right'>
                            {formError.email}
                        </label>
                    </div>
                    <div className='space-y-2'>
                        <label htmlFor='password' className='block '>Password</label>
                        <input onChange={handleChange}  type="password" disabled={verifying} placeholder="Password" id='password' name='password' className="input input-bordered input-warning w-full md:min-w-[340px]" />
                        <label htmlFor='username' className='block text-sm text-red-600 font-semibold text-right'>
                            {formError.password}
                        </label>
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
