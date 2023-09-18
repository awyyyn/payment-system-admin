import { Suspense, useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { SplashScreen } from "../components";
import { useNavigate } from "react-router-dom";

 

const AddPayment = () => {

    const navigate = useNavigate()
    const [clients, setClients] = useState([]);
    const [filtered, setFiltered] = useState(clients);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [search, setSearch] = useState("");
    const [client, setClient] = useState({});
    const [payment, setPayment] = useState({});
    const [notify, setNotify] = useState(false);
    const [smsErr, setSmsErr] = useState(false);
    const [paymentsInfo, setPaymentsInfo] = useState([])
    const [err, setErr] = useState({
        nameErr: false,
        amountErr: false,
        contactErr: false,
    })

    useEffect(() => { 
        
        async function getClients() {
            try {
                const { data, error } = await supabase.from('clients_table').select(`*, payments_table(*), loans_table(*)`).eq('loans_table.is_paid', false)
                setClients(data?.filter(data => data.loans_table?.length !== 0))
                if(error) throw error;
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        } 

        getClients(); 

    }, [])

    useEffect(() => {
        setFiltered(clients?.filter(client => client.first_name.toLowerCase().includes(search.toLowerCase()) || client.last_name.toLowerCase().includes(search.toLowerCase()) ))
        // clients?.filter(client => String(client.first_name).toLowerCase().includes(String(search).toLowerCase()) || String(client.last_name).toLowerCase().includes(String(search).toLower()))
    }, [search, clients, paying]) 

        
    const handleSelect = async(client) => {
        const { data} = await supabase.from('loans_table').select(`*`).match({client_id: client.uuid, is_paid: false}).single()
        // console.log(data.id)
        const { data: PaymentsData } = await supabase.from('payments_table').select('*').eq('loan', data?.id).order('num', {ascending: true})
        setClient(client); 
        setPaymentsInfo(PaymentsData)
        setErr((p) => ({...p, nameErr: false, contactErr: false})) 
    } 

     

    const handleSubmit = async () => { 
        if(paying) return 
        if(!client.first_name) setErr((p) => ({...p, nameErr: true, contactErr: true}))  
        if(err.amountErr || err.nameErr || !payment.id) { 
            return 
        } 
        setPaying(true); 
        let message
        if(payment.num == 7){
            message = `Congratulations! Your loan has been fully paid. Thank you for choosing Bicol's Amigo.`
        }else{
            message = `You pay ${payment.amount} pesos  amount ${payment.date}.`;
        }
        console.log(payment.num)
        console.log(message)

        // // setPaying(false)
        const phone = client.contact.slice(1) 
        const res = await fetch('https://red-hilarious-worm.cyclic.cloud/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: `+63${phone}`, 
                message
            })
        });

        
        if(payment.num == 7){ 
            console.log(payment.loan)
            console.log(client)
            await supabase.from('loans_table').update({is_paid: true}).eq('id', payment.loan)
            await supabase.from('payments_table').update({is_paid: true, created_at: new Date().toISOString()}).eq('id', payment.id);
            await supabase.from('sms_notifications_table').insert({client_id: client.uuid, amount: payment.amount, message})
            const data = await res.json(); 
 

            if(data.status === 400) {   
                setSmsErr(true);  
                setPaying(false);   
                setPayment({})
                setClient({})
                return  setTimeout(() => setSmsErr(false), 3000)
            }
            navigate(`/client/${client.uuid}`)
            setNotify(true) 
            setPaying(false);   
            setPayment({})
            setClient({})
            setTimeout(() => { 
                setNotify(false)
            }, [3000]);

            return 
        }else{
            await supabase.from('payments_table').update({is_paid: true, created_at: new Date().toISOString()}).eq('id', payment.id)
            await supabase.from('sms_notifications_table').insert({client_id: client.uuid, amount: payment.amount, message})
            const data = await res.json(); 
     
    
            if(data.status === 400) {   
                setSmsErr(true);  
                setPaying(false);   
                setPayment({})
                setClient({})
                return  setTimeout(() => setSmsErr(false), 3000)
            }
            
            setNotify(true) 
            setPaying(false);   
            setPayment({})
            setClient({})
            setTimeout(() => { 
                setNotify(false)
            }, [3000]);
     
        } 
    }



    return ( 
        <Suspense fallback={<SplashScreen />}>
            <div className={`fixed bg-green-500 right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white ${notify ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification Sent! 
            </div>
            <div className={`fixed  bg-red-600  right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white ${smsErr ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification not sent!
            </div>
            <div className="px-5 md:px-20">
                <h1 className="text-3xl md:text-4xl font-bold">Add Payment</h1>
  
                <div className=" min-h-[500px]  pt-4  ">
                    <div className="w-full flex flex-wrap flex-col gap-y-5 h-full md:mt-20 items-center justify-center"> 
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">Name</span> 
                            </label>
                            <h1
                                type="text" 
                                onClick={()=> !paying && window.my_modal_3.showModal()} 
                                placeholder="Client Name" 
                                className={`${client.uuid ? 'text-black' : 'text-gray-400'} input input-bordered flex items-center cursor-pointer hover:focus-warning w-full max-w-xs capitalize`}  
                            >
                                {client.uuid ? `${client.first_name} ${client.middle_name} ${client.last_name}`: "John Doe"}
                            </h1>
                            {err.nameErr &&
                                <label className="label"> 
                                    <span className="label-text-alt"></span>
                                    <span className="label-text-alt text-red-600">Name Required!</span>
                                </label>
                            }
                        </div>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">Contact Number</span> 
                            </label>
                            <h1
                                type="text"  
                                placeholder="09876543211" 
                                className={`${client.uuid ? 'text-black' : 'text-gray-400'} input input-bordered w-full flex items-center focus:input-warning max-w-xs capitalize`}  
                            >
                                {client.contact ?`${client.contact}`: "09123456789"}
                            </h1>
                            {err.contactErr &&
                                <label className="label"> 
                                    <span className="label-text-alt"></span>
                                    <span className="label-text-alt text-red-600">Contact Number Required!</span>
                                </label>
                            }
                        </div>
                        
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                            <span className="label-text">Select Payment</span> 
                            </label>
                            <h1
                                type="text"   
                                className={`${client.uuid ? 'text-black' : 'text-gray-400'} input input-bordered justify-between flex items-center cursor-pointer hover:focus-warning w-full max-w-xs capitalize`}  
                                disabled={paying ? true : false} 
                                onClick={()=> client.uuid && !paying && window.my_modal_4.showModal()} 
                            >
                                {payment?.id ? 
                                    <>
                                        <span>{payment.date}</span>
                                        <span>₱ {payment.amount}</span>
                                    </>
                                      : ''}
                            </h1>
                            {err.amountErr &&
                                <label className="label">
                                    <span className="label-text-alt"></span>
                                    <span className="label-text-alt text-red-600">Invalid Amount!</span>
                                </label>
                            }
                        </div>
                        <button disabled={paying} className="btn disabled:cursor-progress w-full bg-yellow-300 hover:bg-yellow-200 mt-4 max-w-xs" onClick={handleSubmit}>
                            {paying ? <> 
                                <span className="loading loading-spinner"></span>   
                                loading
                            </> : "Submit"}
                        </button>
                    </div>
                </div>
            </div> 


            {/* MODAL */}
            <dialog id="my_modal_3" className="modal max-w-[400px] mx-auto">
                <form method="dialog" className="modal-box">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg">Select Client</h3> 
                    <input 
                        type="text" placeholder="Type here" 
                        className="input input-bordered focus:input-warning w-full my-3 max-w-xs" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}  
                    />
                    {loading ?
                        <>
                            <h1 className="text-center  ">
                                <span className="loading loading-dots loading-lg text-yellow-400 "></span>
                            </h1>
                        </>  :
                        filtered.length ?
                        filtered.map((client, index) => (
                            <button 

                                key={index} 

                                onClick={() => {
                                    handleSelect(client)
                                    setPayment({})
                                }} 

                                className={`w-full px-4 capitalize py-2 rounded-lg gap-y-3  cursor-pointer btn-ghost flex items-center justify-between`}

                            >
                                {`${client.first_name} ${client.middle_name && client.middle_name} ${client.last_name}`}

                            </button>
                        )) :
                        <h1 className="text-center  ">
                            No Records Exist
                        </h1>
                    }
                </form>
            </dialog>

            
            {/* MODAL */}
            <dialog id="my_modal_4" className="modal max-w-[400px] mx-auto">
                <form method="dialog" className="modal-box">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-5">Select Payment</h3> 
                   {/*  <input 
                        type="text" placeholder="Type here" 
                        className="input input-bordered focus:input-warning w-full my-3 max-w-xs" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}  
                    /> */}
                    {loading ?
                        <>
                            <h1 className="text-center  ">
                                <span className="loading loading-dots loading-lg text-yellow-400 "></span>
                            </h1>
                        </>  :
                        paymentsInfo?.length > 0 &&
                        paymentsInfo?.map((item, index) => (
                            <button 
                                key={index} 
                                disabled={item.is_paid}
                                onClick={() => { 
                                    setPayment(item)
                                }} 
                                className={`w-full my-2 px-4 capitalize py-2 rounded-lg gap-y-3  cursor-pointer btn-ghost flex items-center justify-between ${item.is_paid && 'bg-green-300 bg-opacity-50 hover:bg-green-300 hover:bg-opacity-50'}`}
                            >
                                <h1>{item.date}</h1>
                                <h1>{item.amount}</h1>

                            </button>
                        ))
                    }
                </form>
            </dialog>
        </Suspense>
    )
}

export default AddPayment
