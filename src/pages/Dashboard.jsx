// import  client from "../lib/twilio"  
// import Twilio from "twilio"
import together from '../assets/together-we.jpg'
import core from '../assets/core-values.jpg'

const Dashboard = () => {
    return (
        <>
            <div className="space-y-6 md:px-20 md:space-y-5 ">
                <h1 className="text-center text-xl md:text-4xl font-bold leading-8 md:text-left">
                    Welcome to Bicol Amigo&apos;s Lending Corporation Payment Management System with SMS Notification!
                </h1> 
                <p className="text-slate-700 text-center md:text-left leading-8 ">
                    As we gear ourselves towards social responsibility and trustworthy, we aim for clientele satisfaction.  Bicol Amigo&apos;s Corporation Payment Management System with SMS Notification aims to gives every users - client and administrators a pleasant and satisfactory experience in using our system.
                </p>

                <div className="flex gap-y-8 flex-col md:flex-row items-center md:items-baseline md:justify-evenly flex-wrap ">
                    <img src={together} loading="eager" className='max-w-[300px] min-w-[250px] md:max-w-[400px] shadow-2xl' />
                    <img src={core} loading="eager" className='max-w-[300px] min-w-[250px] md:max-w-[400px] shadow-2xl' />
                </div>
            </div>
        </>
    )
}

export default Dashboard
