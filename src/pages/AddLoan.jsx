import { useEffect, useState, useCallback } from "react";
import supabase from "../lib/supabase";

 

const AddLoan = () => {

    const [clients, setClients] = useState([]);
    const [filtered, setFiltered] = useState(clients);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [search, setSearch] = useState("");
    const [client, setClient] = useState({});
    const [amount, setAmount] = useState(""); 
    const [notify, setNotify] = useState(false);
    const [smsErr, setSmsErr] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState({
        nameErr: false,
        amountErr: false,
        contactErr: false,
    })

    useEffect(() => { 
        async function getClients() { 
            try {
                const { data, error } = await supabase.from('clients_table').select(`*, loans_table(*)`)  
                setClients(data?.filter(l => !l?.loans_table?.some(item =>  item.is_paid == false )) )  
                setFiltered(clients)
                if(error) throw error; 
                setLoading(false) 
                setDone(p => !p)    
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        } 
        getClients(); 
    }, [done])

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

    
    function addDays(date, days){
        let preDate = new Date(date);
        let dateCopy = new Date(date);
        dateCopy.setDate(preDate.getDate() + days)
        return dateCopy.toDateString()
    }

    const handleSubmit = async () => { 
        if(!client.first_name) setErr((p) => ({...p, nameErr: true, contactErr: true})) 
        amountValidation(amount)
        if(err.amountErr || err.nameErr) { 
            return 
        } 
        setPaying(true); 
        const total = (Number(amount) / 7) + 143;
        const fixedAmount = String(total).includes('.') ? String(total).split('.')[0] : total;
        const message = `Your application for ${amount} pesos loan has been approved. ${new Date().toLocaleString()}.`
        try {
            const phone = client.contact.slice(1) 
            const res = await fetch('https://twilio-sms-ow78.onrender.com/send-sms', {
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

            /* INSERT DATA TO LOANS_TABLE */
            const { data: loanRes } = await supabase.from('loans_table').insert({client_id: client.uuid, amount_loan: amount}).select().single()
            
            await supabase.from('payments_table').insert([
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 16)},
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 36)},
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 41)},
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 61)},
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 76)},
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 91)},
                {loan: loanRes.id, amount:  fixedAmount, client_id: client.uuid, is_paid: false, date: addDays(Date.now(), 106)},
            ]) 
            await supabase.from('sms_notifications_table').insert({client_id: client.uuid, amount, message, is_loan: true}); 

            setClient({})
            /* SMS ERROR */
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
                <h1 className="text-3xl md:text-4xl font-bold">Create Client Loan</h1>
  
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
                        <button disabled={!amount || !client.first_name ? true : false}  className="btn w-full  bg-yellow-300 hover:bg-yellow-200 mt-4 max-w-xs" onClick={handleSubmit}>
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
                            <button 
                                key={index} 
                                onClick={() => {
                                    handleSelect(client)
                                    setAmount("")
                                }} 
                                className={`w-full px-4  capitalize py-2 rounded-lg gap-y-3  cursor-pointer btn-ghost flex items-center justify-between`}>
                                {`${client.first_name} ${client.middle_name && client.middle_name} ${client.last_name}`}
                            </button>
                        ))
                    }
                </form>
            </dialog>
        </>
    )
}

export default AddLoan
