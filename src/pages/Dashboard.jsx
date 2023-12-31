// import  client from "../lib/twilio"  
// import Twilio from "twilio"
import together from '../assets/together-we.jpg'
import core from '../assets/core-values.jpg'
import { Suspense } from 'react'
import { SplashScreen } from '../components'

const Dashboard = () => {

    return (
        <Suspense fallback={<SplashScreen />}>
            <div className="space-y-14 md:px-20 md:space-y-20">
                <h1 className="text-center text-xl md:text-4xl font-bold leading-8 ">
                    Welcome to Bicol Amigo&apos;s Lending Corporation 
                </h1> 
                {/* <p className="text-slate-700 text-center  leading-8 ">
                    As we gear ourselves towards social responsibility and trustworthy, we aim for clientele satisfaction.  Bicol Amigo&apos;ss Lending Corporation Loan System and Mobile Application with SMS Notification aims to gives every users - client and administrators a pleasant and satisfactory experience in using our system.
                </p>
                */}
                <div className="flex gap-y-8 flex-col md:flex-row items-center md:items-baseline md:justify-evenly flex-wrap ">
                    <img src={together} loading="eager" className='max-w-[300px] min-w-[250px] md:max-w-[400px] shadow-2xl' />
                    <img src={core} loading="eager" className='max-w-[300px] min-w-[250px] md:max-w-[400px] shadow-2xl' />
                </div>
            </div>
        </Suspense>
    )
}

export default Dashboard
