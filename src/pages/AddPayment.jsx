import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

 

const AddPayment = () => {

    const [clients, setClients] = useState([]);
    const [filtered, setFiltered] = useState(clients);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [search, setSearch] = useState("");
    const [client, setClient] = useState({});
    const [amount, setAmount] = useState("");
    const [notify, setNotify] = useState(false);
    const [smsErr, setSmsErr] = useState(false)
    const [err, setErr] = useState({
        nameErr: false,
        amountErr: false,
        contactErr: false,
    })

    useEffect(() => { 
        async function getClients() {
            try {
                const { data, error } = await supabase.from('clients_table').select(`*, payments_table(*), loans_table(*)`).eq('loans_table.is_paid', false)
                setClients(data.filter(data => data.loans_table?.length !== 0))
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
    }, [search, clients]) 

        
    const handleSelect = (client) => {
        setClient(client); 
        setErr((p) => ({...p, nameErr: false, contactErr: false})) 
    } 

    const amountValidation = (value) => {
        if(/^\d+$/.test(value)){
            setErr((p) => ({...p, amountErr: false}))
        }else{
            setErr((p) => ({...p, amountErr: true}))
        } 
    }

    const handleSubmit = async () => { 
        if(!client.first_name) setErr((p) => ({...p, nameErr: true, contactErr: true})) 
        amountValidation(amount)
        if(err.amountErr || err.nameErr) { 
            return 
        } 
        setPaying(true); 
        const message = `You pay ${amount} pesos. ${new Date().toLocaleString()}.`
        try {
            const phone = client.contact.slice(1) 
            const res = await fetch('http://localhost:3000/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: `63${phone}`, 
                    message
                })
            });

            const data = await res.json(); 

            await supabase.from('payments_table').insert({client_id: client.uuid, amount});
            await supabase.from('sms_notifications_table').insert({client_id: client.uuid, amount, message})

            if(data.status === 400) {   
                setSmsErr(true);  
                setPaying(false);   
                return  setTimeout(() => setSmsErr(false), 3000)
            }
            
            setNotify(true) 
            setPaying(false);  
            setAmount("")
            setTimeout(() => { 
                setNotify(false)
            }, [3000]);

        } catch (error) { 
            console.log(error)
            setPaying(false);  
        }

    }



    return ( 
        <>
            <div className={`fixed bg-green-500 right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white ${notify ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                SMS Sent! 
            </div>
            <div className={`fixed  bg-red-600  right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white ${smsErr ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                SMS Error, SMS not sent!
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
                            <span className="label-text">Amount</span> 
                            </label>
                            <input 
                                type="text"  
                                placeholder="99.99" 
                                className="input input-bordered w-full focus:input-warning max-w-xs capitalize" 
                                value={amount} 
                                disabled={paying ? true : false}
                                onBlur={() => amountValidation(amount)}
                                onChange={(e) => setAmount(e.target.value)} 
                            /> 
                            {err.amountErr &&
                                <label className="label">
                                    <span className="label-text-alt"></span>
                                    <span className="label-text-alt text-red-600">Invalid Amount!</span>
                                </label>
                            }
                        </div>
                        <button className="btn w-full bg-yellow-300 hover:bg-yellow-200 mt-4 max-w-xs" onClick={handleSubmit}>
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
                        filtered.length > 0 &&
                        filtered.map((client, index) => (
                            <button key={index} onClick={() => {
                                handleSelect(client)
                                setAmount("")
                            }} className={`w-full px-4 capitalize py-2 rounded-lg gap-y-3  cursor-pointer btn-ghost flex items-center justify-between`}>
                                {`${client.first_name} ${client.middle_name && client.middle_name} ${client.last_name}`}
                            </button>
                        ))
                    }
                </form>
            </dialog>
        </>
    )
}

export default AddPayment
