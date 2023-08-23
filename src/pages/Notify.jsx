import { useEffect, useState } from "react"
import supabase from '../lib/supabase' 
import { IoIosNotifications } from 'react-icons/io'

 

const Notify = () => {
    
    const [clients, setClients] =  useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(clients);
    const [sending, setSending] = useState(0) 
    const [smsErr, setSmsErr] = useState(false);
    const [notify, setNotify] = useState(false);

    useEffect(() => {
        async function getClients() {
            try {
                const { data, error } = await supabase.from('clients_table').select(`*, loans_table(*), payments_table(*)`);   
                if(error) throw error
                setClients(data?.filter(l => l?.loans_table?.length && l?.loans_table?.some(item =>  item.is_paid == false )) )  
                setFiltered(data?.filter(l => l?.loans_table?.length && l?.loans_table?.some(item =>  item.is_paid == false )) )  
                // console.log(clients)
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        }

        getClients();

    }, [])
 

    useEffect(() => {
        setFiltered(clients?.filter(client => 
            client.first_name.toLowerCase().includes(search.toLowerCase()) || 
            client.last_name.toLowerCase().includes(search.toLowerCase()) ||
            client.address.toLowerCase().includes(search.toLowerCase()) || 
            client.contact.toString().includes(search)
        ))
        // clients?.filter(client => String(client.first_name).toLowerCase().includes(String(search).toLowerCase()) || String(client.last_name).toLowerCase().includes(String(search).toLower()))
    }, [search, clients]) 
    
 
 
    

    return ( 
        <> 
            
            <div className={`fixed bg-green-500 right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white z-[9999] ${notify ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification sent! 
            </div>
            <div className={`fixed  bg-red-600  right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white z-[9999] ${smsErr ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification error!
            </div>
            <div className="flex justify-end md:pr-20 fixed right-0 pr-5 w-full">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md focus:input-warning focus:shadow-none w-full max-w-xs" />
            </div>  
            <div className="overflow-x-auto  md:px-20 mt-10 p-5 pt-8 pb-10  "> 
                <table className="table shadow-xl overflow-hidden">
                    {/* head */}
                    <thead className="bg-[#21461A] text-white">
                        <tr> 
                            <th>Client Name</th>
                            <th>Client Contact</th>
                            <th>Address</th>
                            <th>Send A Notification</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* row 1 */}
                        {loading ? 
                            ['1', '2', '3', '4', '5'].map(item => (
                                <tr key={item}>
                                    <td className="min-w-[180px]"><span className="loading loading-dots loading-xs"></span></td>
                                    <td className="min-w-[180px]"><span className="loading loading-dots loading-xs"></span></td>
                                    <td className="min-w-[200px]"><span className="loading loading-dots loading-xs"></span></td>
                                    <td><span className="loading loading-dots loading-xs"></span></td> 
                                </tr>
                            ))
                            :
                            filtered.length ?
                                filtered?.map(client => ( 
                                    <tr key={client.uuid} className=" cursor-pointer">
                                        <td>{`${client.first_name} ${client.last_name}`}</td>
                                        <td className="min-w-[180px]">{client.contact}</td> 
                                        <td >{client.address}</td>  
                                        <td className={`max-w-min  group ${sending === client.uuid ? 'hover:bg-slate-100' : 'hover:bg-warning'}`}
                                            onClick={async() => { 
                                                if(!sending){

                                                    setSending(client.uuid);
                                                    const amount = client.loans_table.filter(i => i.is_paid == false).pop()
                                                    const date = client.payments_table.filter(i => i.is_paid == false).shift()  
                                                    const message = `Reminder! You must pay ${String(amount.amount_loan / 7).split('.')[0]} pesos before or ${date.date}.`
                                                    console.log(message)
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
                                                        
                                                        await supabase.from('sms_notifications_table')
                                                        .insert({
                                                            client_id: client.uuid, 
                                                            amount: 0,
                                                            message, 
                                                            is_loan: false
                                                        }); 
     
                                                        if(data.status === 400) {   
                                                            setSmsErr(true);  
                                                            setSending(0);    
                                                            return  setTimeout(() => setSmsErr(false), 3000)
                                                        }else{ 
                                                            setNotify(true) 
                                                            setSending(0);  
                                                
                                                            setTimeout(() => { 
                                                                setNotify(false)
                                                            }, [3000]);
                                                        }
                                                        
    
                                                    }catch(err) {
                                                        console.log(err)
                                                    }
                                                }
                                            }}
                                        >
                                            <p className={`transition-all flex gap-x-5 items-center ${sending === client.uuid ? 'text-warning' : 'group-active:scale-95'}`}>
                                                <span className={` scale-110 ${!sending && 'group-hover:animate-ping'} `}>
                                                    <IoIosNotifications />
                                                </span>
                                                {sending == client.uuid ?
                                                    <>
                                                    <span className="loading loading-dots loading-sm"></span>
                                                    </>
                                                    : 'Send Notification'
                                                }
                                                
                                            </p> 
                                        </td>
                                    </tr> 
                                ))
                            :
                            <tr className="hover:bg-[#21461A20] cursor-pointer"> 
                                <td colSpan={4} className="text-center">Not Found</td>
                            </tr>

                        }
                    </tbody>
                </table>
            </div> 
        </>
    )
}

export default Notify
 