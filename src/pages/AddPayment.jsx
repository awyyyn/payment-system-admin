import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

 

const AddPayment = () => {

    const [clients, setClients] = useState([]);
    const [filtered, setFiltered] = useState(clients);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [search, setSearch] = useState("");
    const [client, setClient] = useState({});
    const [amount, setAmount] = useState();
    const [err, setErr] = useState({
        nameErr: false,
        amountErr: false,
        contactErr: false,
    })

    useEffect(() => { 
        async function getClients() {
            try {
                const { data, error } = await supabase.from('clients_table').select(`*, payments_table(*), loans_table(*)`)
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
        try {
            const phone = client.contact.slice(1) 
            await fetch('https://twili-sms-ow78.onrender.com/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: `63${phone}`, 
                    message: `You pay ${amount} pesos. ${new Date().toLocaleString()}.`
                })
            })
        } catch (error) {
            console.log(error)
        }
        setPaying(false)

    }

    return ( 
        <>
            <div className={`fixed bg-green-500 right-5 top-5`}>

            </div>
            <div className="px-5 md:px-20">
                <h1 className="text-3xl md:text-4xl font-bold">Add Payment</h1>
  
                <div className=" min-h-[500px]  pt-4  ">
                    <div className="w-full flex flex-wrap flex-col gap-y-5 h-full md:mt-20 items-center justify-center"> 
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">Name</span> 
                            </label>
                            <input 
                                type="text" 
                                onClick={()=>window.my_modal_3.showModal()} 
                                placeholder="Client Name" 
                                className="input input-bordered hover:focus-warning w-full max-w-xs capitalize" 
                                value={client.uuid ?`${client.first_name} ${client.middle_name} ${client.last_name}`: ""}
                                contentEditable={false}
                                onChange={(e) => setSearch(e.target.value)} 
                            /> 
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
                            <input 
                                type="text"  
                                placeholder="09876543211" 
                                className="input input-bordered w-full focus:input-warning max-w-xs capitalize" 
                                value={client.contact ?`${client.contact}`: ""}
                                contentEditable={false} 
                            /> 
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
                    {!loading && 
                        filtered.length > 0 &&
                        filtered.map((client, index) => (
                            <button key={index} onClick={() => handleSelect(client)} className={`w-full px-4 capitalize py-2 rounded-lg gap-y-3  cursor-pointer btn-ghost flex items-center justify-between`}>
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
