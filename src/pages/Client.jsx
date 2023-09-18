import { Suspense, useCallback, useContext, useEffect, useState } from "react"
import supabase from '../lib/supabase'
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "../components";
import { BiSolidUserPlus } from 'react-icons/bi' 
import { CorpContext } from "../context/AppContext";
 
 
const Client = () => {
    
    const { userData } = useContext(CorpContext)
    const [clients, setClients] =  useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(clients);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        mname: '',
        address: '',
        contact: '',
        loanAmount: '', 
    });
    const [interest, setInterest] = useState(0)
    const [creating, setCreating] = useState(false)
    const [totalLoan, setTotalLoan] = useState(0)
    const [formError, setFormError] = useState({
        fname: '',
        lname: '',
        mname: '',
        address: '',
        contact: '',
        loanAmount: '', 
    });
    const [id, setId] = useState('');
    const [notify, setNotify] = useState(false)
    const [smsErr, setSmsErr] = useState(false) 
    const [phone, setPhone] = useState('') 
    const [state, setStates] = useState({
        isError: false,
        loading: false,
        tab: 0,
        saving: false,
        deleting: false
    });

    const [action, setAction] = useState({
        id: "",
        fname: "",
        lname: "",
        mname: "",
        address: "",
        contact: "",
        email: ""
    });
    const [actionMessage, setActionMessage] = useState('');
    
    async function getClients() {
        try {
            const { data, error } = await supabase.from('clients_table').select();
            if(error) throw error
            setClients(data);
            setFiltered(data)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(() => { 
        getClients();  
        const subscription = supabase.channel('any')
            .on('postgres_changes', { event: "*", schema: "public", table: "clients_table"}, (() => getClients()))
            .subscribe();

        return () => subscription.unsubscribe();

    }, [notify])
 
  
    useEffect(() => {
        setFiltered(clients?.filter(client => 
            client.first_name.toLowerCase().includes(search.toLowerCase()) || 
            client.last_name.toLowerCase().includes(search.toLowerCase()) ||
            client.middle_name.toLowerCase().includes(search.toLowerCase()) || 
            client.contact.includes(search) ||
            client.address.toLowerCase().includes(search.toLowerCase()) 
        ))
        // clients?.filter(client => String(client.first_name).toLowerCase().includes(String(search).toLowerCase()) || String(client.last_name).toLowerCase().includes(String(search).toLower()))
    }, [search, clients]) 
    

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleActionChange = (e) => setAction(p => ({...p, [e.target.name]: e.target.value }));

    const infoValidation =  () => {
        if(formData.fname == ""){
            setFormError(p => ({ ...p, fname: "Required Field"}))
        }else{
            setFormError(p => ({ ...p, fname: ""}))
        }

        if(formData.lname == ""){
            setFormError(p => ({ ...p, lname: "Required Field"}));
        }else{
            setFormError(p => ({ ...p, lname: ""}))
        }

        if(formData.contact == ""){
            setFormError(p => ({ ...p, contact: "Required Field"}));
        }else if(formData.contact.slice(0, 2) !== "09" || formData.contact.length !== 11){
            setFormError(p => ({ ...p, contact: "Invalid Format"}));
        }else{
            setFormError(p => ({ ...p, contact:""}))
        }

        if(formData.address == ""){
            setFormError(p => ({ ...p, address: "Required Field"}));
        }else{
            setFormError(p => ({ ...p, address: ""}));
        } 
    }
    
    const infoActionValidation =  () => {
        if(action.fname == ""){
            setFormError(p => ({ ...p, fname: "Required Field"}))
        }else{
            setFormError(p => ({ ...p, fname: ""}))
        }

        if(action.lname == ""){
            setFormError(p => ({ ...p, lname: "Required Field"}));
        }else{
            setFormError(p => ({ ...p, lname: ""}))
        }

        if(action.contact == ""){
            setFormError(p => ({ ...p, contact: "Required Field"}));
        }else if(action.contact.slice(0, 2) !== "09" || action.contact.length !== 11){
            setFormError(p => ({ ...p, contact: "Invalid Format"}));
        }else{
            setFormError(p => ({ ...p, contact:""}))
        }

        if(action.address == ""){
            setFormError(p => ({ ...p, address: "Required Field"}));
        }else{
            setFormError(p => ({ ...p, address: ""}));
        } 
    }
      
    
    function addDays(date, days){
        let preDate = new Date(date);
        let dateCopy = new Date(date);
        dateCopy.setDate(preDate.getDate() + days)
        return dateCopy.toDateString()
    }

    const handleNext = useCallback(async() => {
        infoValidation()
        if(formError.address || formError.contact  || formData.contact.length != 11 || formData.contact.slice(0, 2) != "09" || formError.fname || formError.lname) { 
            return null
        }else{
            setStates(p => ({...p, loading: true}))
            
            const { data } = await supabase.from('clients_table')
                .select()
                .eq('contact', formData.contact)
                // .or(`contact.${formData.contact}`) 
            // .or('id.eq.2,name.eq.Algeria')
      
            if(data.length > 0){
                setStates(p => ({...p, isError: true})); 
                setTimeout(() => {
                    setStates(p => ({...p, isError: false})); 
                }, 5000)
                setStates(p => ({...p, loading: false}))
                return 
            } 
            
            const { data: clientData, error } = await supabase.from('clients_table').insert({
                first_name: formData.fname,
                last_name: formData.lname,
                middle_name: formData.mname,
                contact: formData.contact,
                address: formData.address,
                app_user: false
            }).select().single();

            if(error) {
                setStates(p => ({
                    ...p, 
                    loading: false, 
                }))
                return console.log(error)
            }

            setId(clientData.uuid)

            console.log(clientData)

            setStates(p => ({
                ...p, 
                loading: false,
                tab: 1
            }))
        } 
        
    }, [formData])
 

    const handleCreate = async() => {
 

        const modal = document.getElementById('my_modal_1')
        const message = `Your application for ${totalLoan} pesos loan has been approved. ${new Date().toLocaleString()}.`
        try {
            setCreating(true)
            const phone = formData.contact.slice(1) 
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

            const data = await res.json(); 

            /* INSERT DATA TO LOANS_TABLE */
            const { data: loanRes } = await supabase.from('loans_table').insert({client_id: id, amount_loan: formData.loanAmount, total_amount: totalLoan}).select().single()
            const fixedAmount = Number(totalLoan) / 7;

            await supabase.from('payments_table')
                .insert({num: 1, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 16)});
            await supabase.from('payments_table')
                .insert({num: 2, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 31)})
            await supabase.from('payments_table')
                .insert({num: 3, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 46)})
            await supabase.from('payments_table')
                .insert({num: 4, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 61)})
            await supabase.from('payments_table')
                .insert({num: 5, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 76)})
            await supabase.from('payments_table')
                .insert({num: 6, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 91)})
            await supabase.from('payments_table')
                .insert({num: 7, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 106)})

 
            
            /* SMS ERROR */
            if(data.status === 400) {   
                setCreating(false)
                modal.checked = false
                setSmsErr(true);   
                setFormData({
                    address: "",
                    contact: "",
                    fname: "",
                    lname: "",
                    loanAmount: "",
                    mname: ""
                })
                setStates({
                    tab: 0  
                })
                return  setTimeout(() => setSmsErr(false), 3000)
            }

            setFormData({
                address: "",
                contact: "",
                fname: "",
                lname: "",
                loanAmount: "",
                mname: ""
            })
            
            setCreating(false)
            modal.checked = false 
            setNotify(true);
            setStates({
                tab: 0  
            })
            setFormData({
                address: "",
                contact: "",
                fname: "",
                lname: "",
                loanAmount: '',
                mname: "",
            });
            setTotalLoan(0);
            setInterest(0)
            setTimeout(() => { 
                setNotify(false)
            }, [3000]);


        }catch(err){
            setFormData({
                address: "",
                contact: "",
                fname: "",
                lname: "",
                loanAmount: "",
                mname: ""
            })
            setStates({
                tab: 0  
            })
            setCreating(false)
            console.log(err);
        }
    }
    

    const handleNavigate = (id) => navigate(`/client/${id}`);
    const handleAction = (client) => {
        setPhone(client?.contact)
        setAction({
            address: client.address,
            contact: client.contact,
            fname: client.first_name,
            id: client.uuid,
            lname: client.last_name,
            mname: client.middle_name,
            email: client?.email
        }); 
    }

    const handleSave = async() => {
        infoActionValidation()
        const modal = document.getElementById('my_modal_8')
        try {
            
            if(formError.address || formError.contact  || action.contact.length != 11  || action.contact.slice(0, 2) != "09" || formError.fname || formError.lname) { 
                return null
            }else{ 
                setStates(p => ({...p, saving: true}))
                 
                if(phone != action.contact){

                    const { data } = await supabase.from('clients_table')
                        .select()
                        .eq('contact', action.contact)


                    console.log(data)

                    if(data.length > 0){
                        setStates(p => ({...p, isError: true})); 
                        setTimeout(() => {
                            setStates(p => ({...p, isError: false})); 
                        }, 5000)
                        setStates(p => ({...p, saving: false}))
                        return 
                    } 
                    setStates(p => ({...p, saving: false}))
                }
                    // .or(`contact.${formData.contact}`) 
                // .or('id.eq.2,name.eq.Algeria')
          
                
                const { data: clientData, error } = await supabase.from('clients_table').update({
                    first_name: action.fname,
                    last_name: action.lname,
                    middle_name: action.mname,
                    contact: action.contact,
                    address: action.address, 
                }).eq('uuid', action.id).select()
    
                if(error) {
                    setStates(p => ({
                        ...p, 
                        saving: false, 
                    }))
                    return console.log(error)
                }
    
                setId(clientData.uuid)
    
                console.log("UPDATE", clientData)
                modal.checked = false
                setStates(p => ({
                    ...p, 
                    saving: false, 
                }))
            } 
        } catch (error) {
            console.log(error)
            setStates(p => ({...p, saving: false}))
        }
    }

    const handleDelete = async() => {  

        console.log(action.id)
        const modal = document.getElementById('my_modal_9')

        setStates(p => ({...p, deleting: true}))

        if(action.email){
            try {
                
                const res = await fetch('https://red-hilarious-worm.cyclic.cloud/get-users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: action.email  
                    })
                })
    
                const data = await res.json();
                console.log(data)
                // console.log(await res.json())
                
                await supabase.from("clients_table").delete('*').eq('uuid', action.id);
 
                setActionMessage(data.message)
                setTimeout(() => {
                    setActionMessage("")
                }, 3000)
                
                
            } catch (error) { 
                console.log(error)
    
                setActionMessage("Network Error!")
                setTimeout(() => {
                    setActionMessage("")
                }, 3000)
            }   
            modal.checked = false
            setStates(p => ({...p, deleting: false}))
        }else{
 
            const { error } = await supabase.from('clients_table').delete('*').eq('uuid', action.id);

            if(error){
                setActionMessage("Server Error!")
                setStates(p => ({...p, deleting: false}))
                return
            }
            setActionMessage("Deleted Successfully!")
            setTimeout(() => {
                setActionMessage("")
            }, 3000)
            
            modal.checked = false
            setStates(p => ({...p, deleting: false}))
        } 
        // modal.checked = false
    }

    return ( 
        <Suspense fallback={<SplashScreen />}> 
            <div className={`fixed bg-green-500 right-8 md:right-10 z-[1000] top-20 px-5 py-1 rounded-md shadow-xl text-white ${notify ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification Sent! 
            </div>
            <div className={`fixed  bg-red-600  right-8 md:right-10 z-[1000] top-20 px-5 py-1 rounded-md shadow-xl text-white ${smsErr ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification not sent!
            </div>
            {actionMessage &&
                <div className="alert alert-warning max-w-[300px] flex fixed z-[999] right-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg> 
                    <span>{actionMessage}</span>
                </div> 
            }
          {/*  <div className="alert alert-error md:max-w-[300px] right-10 absolute z-[1000]">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-stone-100 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-stone-100">Error! Task failed successfully.</span>
            </div> */}

            <h1 className="text-3xl md:text-4xl px-5 md:px-20 font-bold">Client Management</h1>
            <div className={`flex flex-col sm:flex-row gap-y-4 ${userData.role == "collector" ? "justify-end" : "justify-between"} px-5 mt-5 md:px-20 `}> 
                {/* <button className="btn btn-active bg-[#21461A] text-white hover:bg-green-800 " onClick={()=>window.my_modal_1.showModal()}>
                    
                </button> */}
               {userData.role !== "collector" && <label htmlFor="my_modal_1" className="btn btn-active bg-[#21461A] text-white hover:bg-green-800 " >
                    <BiSolidUserPlus />
                    Add Client
                </label>}
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md border border-stone-300 focus:input-warning focus:shadow-none w-full sm:max-w-xs" />
            </div>
            {/* <div className="flex justify-between md:pr-20 fixed right-0 pr-5 w-full"> 
                 
               <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md focus:input-warning focus:shadow-none w-full max-w-xs" /> 
            </div>   */}
            <div className="overflow-x-auto overflow-y-visible  md:px-20  mt-10  pb-32 z-[20]  "> 
                <table className="table shadow-xl overflow-visible">
                    {/* head */}
                    <thead className="bg-[#21461A] text-white sticky top-0">
                        <tr> 
                            <th>Client Name</th>
                            <th>Client Contact</th>
                            <th>Address</th>
                            <th>Date Joined</th>
                            <th className="text-center">Actions</th>
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
                                    <td><span className="loading loading-dots loading-xs"></span></td> 
                                </tr>
                            ))
                            :
                            filtered?.length ?
                                filtered?.map((client, index) => ( 
                                    <tr key={client.uuid} className="cursor-pointer" >
                                        <td /* onClick={() => handleNavigate(client.uuid)} */ >{`${client.first_name} ${client.last_name}`}</td>
                                        <td /* onClick={() => handleNavigate(client.uuid)} */ className="min-w-[180px]">{client.contact}</td>
                                        <td /* onClick={() => handleNavigate(client.uuid)} */ className="min-w-[200px]">{client.address}</td>
                                        <td /* onClick={() => handleNavigate(client.uuid)} */ >{new Date(client.created_at).toLocaleDateString()}</td>  
                                        <td className="hover:bg-yellow-100 p-0 px-4">
                                            <div className={`dropdown w-full ${filtered.length > 5 && (filtered.length - 3) < (index + 1) ? 'dropdown-top dropdown-end' : 'dropdown-end'} `}>
                                                <label tabIndex={0} className="h-full cursor-pointer flex items-center gap-x-2 justify-center">
                                                    <span>Actions</span> 
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                    </svg> 
                                                </label>
                                                <ul tabIndex={0} className="dropdown-content z-[999] shadow-2xl menu p-2 bg-base-100 rounded-box w-52">
                                                    <li onClick={() => handleNavigate(client.uuid)}> 
                                                        <a>View</a>
                                                    </li>
                                                    <li onClick={() => handleAction(client)}>
                                                        <label htmlFor="my_modal_8">Edit</label>
                                                    </li>
                                                    <li onClick={() => handleAction(client)}>
                                                        <label htmlFor="my_modal_9" className="text-red-600 hover:bg-red-600 hover:text-white active:bg-transparent bg-transparent active:border-red-600">Delete</label>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr> 
                                ))
                            :
                            <tr className=" cursor-pointer"> 
                                <td colSpan={5} className="text-center">{filtered.length ? 'Not found' : '0 Record'}</td>
                            </tr>

                        }
                    </tbody>
                </table>
            </div>
 
            
            <input type="checkbox" id="my_modal_8" className="modal-toggle" />
            <div className="modal overflow-x-hidden">
                <div className="modal-box  max-w-min overflow-x-hidden">
                    <h3 className="font-bold text-lg">Edit account</h3>
                    <div className="max-h-[400px] overflow-y-scroll px-2 ">
                        <div className={`alert alert-error absolute max-w-[350px] ${state.isError ? '-right-20' : '-right-full'} transition-all duration-1000 top-3`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="">Contact number is taken!</span>
                        </div>
                        {/* F NAME */}
                        <div className="form-control w-full max-w-min">
                            <label className="label">
                                <span className="label-text">First Name</span> 
                            </label>
                            <input 
                                onFocus={() => setFormError(p => ({...p, fname: ""}))}
                                value={action.fname}
                                name="fname"
                                onChange={handleActionChange}
                                type="text" placeholder="First Name" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                <label className="label">
                                    {formError.fname && 
                                        <span className="label-text text-error">{formError.fname}</span>  
                                    }
                                </label>
                        </div>
                        
                        {/* M NAME */}
                        <div className="form-control w-full max-w-min ">
                            <label className="label">
                                <span className="label-text">Middle Name</span> 
                            </label>
                            <input 
                                onFocus={() => setFormError(p => ({...p, fname: ""}))}
                                value={action.mname}
                                name="mname"
                                onChange={handleActionChange}
                                type="text" placeholder="Middle Name" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                <label className="label">
                                    {formError.fname && 
                                        <span className="label-text text-error">{formError.mname}</span>  
                                    }
                                </label>
                        </div>

                        {/* L NAME */} 
                        <div className="form-control w-full max-w-min">
                            <label className="label">
                                <span className="label-text">Last Name</span> 
                            </label>
                            <input 
                                onFocus={() => setFormError(p => ({...p, lname: ""}))}
                                value={action.lname}
                                name="lname"
                                onChange={handleActionChange}
                                type="text" placeholder="Last Name" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                <label className="label">
                                    {formError.fname && 
                                        <span className="label-text text-error">{formError.fname}</span>  
                                    }
                                </label>
                        </div>
                         
                         {/* CONTACT */}
                         <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Contact Number</span> 
                                </label>
                                <input 
                                    onFocus={() => setFormError(p => ({...p, contact: ""}))}
                                    value={action.contact}
                                    name="contact"
                                    onChange={(e) => { 
                                        if(/^\d+$/.test(e.target.value)){
                                            if(e.target.value.length < 12){
                                                setAction(p => ({
                                                    ...p,
                                                    contact: e.target.value
                                                }))
                                            }
                                        }else if(e.target.value.length <= 1){
                                            setAction(p => ({
                                                ...p,
                                                contact: ''
                                            }))
                                        }
                                    }}
                                    type="text" placeholder="098764254321" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                    <label className="label">
                                        {formError.contact && 
                                            <span className="label-text text-error">{formError.contact}</span>  
                                        }
                                    </label>
                        </div>
                         
                        {/* ADDRESS */} 
                        <div className="form-control w-full max-w-min">
                            <label className="label">
                                <span className="label-text">Address</span> 
                            </label>
                            <input 
                                onFocus={() => setFormError(p => ({...p, fname: ""}))}
                                value={action.address}
                                name="address"
                                onChange={handleActionChange}
                                type="text" placeholder="Address" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                <label className="label">
                                    {formError.fname && 
                                        <span className="label-text text-error">{formError.fname}</span>  
                                    }
                                </label>
                        </div>
                    </div>
                    <div className="modal-action">
                        <label htmlFor="my_modal_8" className="btn min-w-[100px] hover:bg-yellow-200">Cancel</label>
                        <button onClick={handleSave} className="btn min-w-[100px] bg-green-600  hover:bg-green-800 text-white">
                            {state.saving ? 
                                <span className="loading"></span>
                                :
                                "Save Changes"
                            }
                        </button>
                    </div>
                </div>
            </div>
 
 
            <input type="checkbox" id="my_modal_9" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete account</h3>
                    <p className="py-4">Do you really want to delete <span className="font-bold">{action.fname} {action.lname}</span> account?</p> 
                    <div className="modal-action">
                        
                        <label htmlFor="my_modal_9" className="btn min-w-[100px] hover:bg-yellow-200">Cancel</label>
                        <button onClick={handleDelete} className="btn min-w-[100px] bg-red-600 hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600 text-white">
                            {state.deleting ? 
                                <span className="loading"></span>:
                                "Delete"
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* ADD CLIENT DIALOG */}
            <input type="checkbox" id="my_modal_1" className="modal-toggle" /> 
            <div  className="modal">
                <div className="modal-box max-w-min overflow-hidden">  
                    <label htmlFor="my_modal_1" onClick={() => {
                        setFormData({
                            address: "",
                            contact: "",
                            fname: "",
                            lname: "",
                            loanAmount: "",
                            mname: ""
                        })
                        setStates(p => ({...p, tab: 0}))
                    }} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                    <div className="flex gap-x-2"> 
                        <h3 className="font-bold text-xl mb-1">{state.tab == 0 ? "Personal Information" : "Loan Information"}</h3>
                        <div className={`alert alert-error absolute max-w-[350px] ${state.isError ? '-right-20' : '-right-full'} transition-all duration-1000 top-3`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="">Client is already added!</span>
                        </div>
                    </div>
                    <div className="flex flex-col pb-3  w-full items-start justify-start md:items-center max-h-[300px] overflow-y-scroll modal-client md:px-3">
                        {state.tab == 0 ? <>
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">First Name</span> 
                                </label>
                                <input 
                                    onFocus={() => setFormError(p => ({...p, fname: ""}))}
                                    value={formData.fname}
                                    name="fname"
                                    onChange={handleChange}
                                    type="text" placeholder="First Name" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                    <label className="label">
                                        {formError.fname && 
                                            <span className="label-text text-error">{formError.fname}</span>  
                                        }
                                    </label>
                            </div>
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Middle Name</span> 
                                </label>
                                <input 
                                    value={formData.mname}
                                    name="mname"
                                    onChange={handleChange}
                                    type="text" placeholder="Middle Name" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                            </div>
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Last Name</span> 
                                </label>
                                <input 
                                    onFocus={() => setFormError(p => ({...p, lname: ""}))}
                                    value={formData.lname}
                                    name="lname"
                                    onChange={handleChange}
                                    type="text" placeholder="Last Name" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" />  
                                <label className="label">
                                    {formError.lname && 
                                        <span className="label-text text-error">{formError.lname}</span>  
                                    }
                                </label>
                            </div>
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Contact Number</span> 
                                </label>
                                <input 
                                    onFocus={() => setFormError(p => ({...p, contact: ""}))}
                                    value={formData.contact}
                                    name="contact"
                                    onChange={(e) => { 
                                        if(/^\d+$/.test(e.target.value)){
                                            if(e.target.value.length < 12){
                                                setFormData(p => ({
                                                    ...p,
                                                    contact: e.target.value
                                                }))
                                            }
                                        }else if(e.target.value.length <= 1){
                                            setFormData(p => ({
                                                ...p,
                                                contact: ''
                                            }))
                                        }
                                    }}
                                    type="text" placeholder="098764254321" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                    <label className="label">
                                        {formError.contact && 
                                            <span className="label-text text-error">{formError.contact}</span>  
                                        }
                                    </label>
                            </div>
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Address</span> 
                                </label>
                                <input 
                                    onFocus={() => setFormError(p => ({...p, address: ""}))}
                                    value={formData.address}
                                    name="address"
                                    onChange={handleChange}
                                    type="text" placeholder="Ligao City" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                <label className="label">
                                    {formError.address && 
                                        <span className="label-text text-error">{formError.address}</span>  
                                    }
                                </label>
                            </div>
                        </> : <>
                                    
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Amount Loan</span> 
                                </label>
                                <input 
                                    onFocus={() => setFormError(p => ({...p, address: ""}))}
                                    value={formData.loanAmount}
                                    name="loanAmount"
                                    onChange={(e) => {
                                        handleChange(e)
                                        setInterest(Math.floor(Number(e.target.value) * 0.19))
                                        setTotalLoan(Math.floor(Number(e.target.value) + (Number(e.target.value) * 0.19)))  
                                    }}
                                    type="text" placeholder="Amount" className="input min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" /> 
                                <label className="label">
                                    {formError.address && 
                                        <span className="label-text text-error">{formError.address}</span>  
                                    }
                                </label>
                            </div>
                            
                            <div className="form-control w-full max-w-min">
                                <label className="label">
                                    <span className="label-text">Interest (19%)</span> 
                                </label>
                                <input  
                                    name="Interest" 
                                    value={interest}
                                    type="text" placeholder="Interest" className="input input-ghost min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" />  
                            </div>
                            <div className="form-control w-full mt-3 max-w-min">
                                <label className="label">
                                    <span className="label-text">Total Amount</span> 
                                </label>
                                <input   
                                    name="totalLoan" 
                                    value={totalLoan}
                                    type="text" placeholder="Interest" className="input input-ghost min-w-[80vw] md:min-w-[350px] input-bordered focus:input-warning w-full max-w-xs" />  
                            </div>
                        </>}
                    </div>
                    <div className="mt-5 flex justify-end">      
                        {state.tab == 0 ?
                            
                            <input
                                type="button"
                                value="Next " 
                                className={`btn ${state.loading && 'loading loading-dots md:mr-5'} btn-warning px-5 text-[#21461A]`}
                                onClick={handleNext}
                                disabled={formData.address == "" || formError.address || formError.contact || formData.fname == "" || formData.lname == "" ? true : false}
                            /> 
                            :
                            <input 
                                disabled={totalLoan == 0 ? true : false}
                                type="button"
                                onClick={handleCreate}
                                className={`btn md:mr-5 btn-warning ${creating && 'loading loading-dots'}`}
                                value='create'

                            />
                        }      
                    </div>
                </div>
                {/* <div className="modal-backdrop" /> */}
            </div>  
        </Suspense>
    )
}

export default Client



/* 


                        <tr className="cursor-pointer hover:bg-[#21461A20] "> 
                            <td tabIndex={0} className="dropdown dropdown-bottom">
                                <span tabIndex={0}>
                                    Cy Ganderton
                                </span>
                                 <ul tabIndex={0} className="dropdown-content z-[1] shadow-2xl menu p-2 bg-base-100 rounded-box w-52">
                                    <li>
                                        <button className="" onClick={()=>window.my_modal_1.showModal()}>
                                            Add Payment
                                        </button>
                                    </li> 
                                    <li>
                                        <button className="" onClick={()=>window.my_modal_1.showModal()}>
                                            Records
                                        </button>
                                    </li> 
                                    <li>
                                        <button className="" onClick={()=>window.my_modal_1.showModal()}>
                                            Schedule
                                        </button>
                                    </li> 
                                </ul> 
                                </td>
                                <td tabIndex={0} className="min-w-[180px]">Quality Control Specialist</td>
                                <td tabIndex={0} className="min-w-[200px]">Blue</td>
                                <td tabIndex={0}>Blue</td>  
                            </tr> 
*/