import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import supabase from '../lib/supabase'
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "../components";
import { BiSolidUserPlus } from 'react-icons/bi'
import { parse } from "postcss";
 

const initialValues = {
    fname: '',
    lname: '',
    mname: '',
    address: '',
    contact: '',
    loanAmount: '', 
}
const Client = () => {
    
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

    const [state, setStates] = useState({
        isError: false,
        loading: false,
        tab: 0,
    })

    useEffect(() => {
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

        getClients();

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
    
      
    
    function addDays(date, days){
        let preDate = new Date(date);
        let dateCopy = new Date(date);
        dateCopy.setDate(preDate.getDate() + days)
        return dateCopy.toDateString()
    }

    const handleNext = useCallback(async() => {
        infoValidation()
        if(formError.address || formError.contact  || formData.contact.length != 11 || formError.fname || formError.lname) { 
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
        const message = `Your application for ${totalLoan} pesos loan has been approved. ${new Date().toLocaleString()}.`
        try {
            setCreating(true)
            const phone = formData.contact.slice(1) 
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
            const { data: loanRes } = await supabase.from('loans_table').insert({client_id: id, amount_loan: totalLoan}).select().single()
            const fixedAmount = Number(totalLoan) / 7;
            await supabase.from('payments_table').insert([
                {num: 1, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 16)},
                {num: 2, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 31)},
                {num: 3, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 46)},
                {num: 4, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 61)},
                {num: 5, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 76)},
                {num: 6, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 91)},
                {num: 7, loan: loanRes.id, amount:  fixedAmount, client_id: id, is_paid: false, date: addDays(Date.now(), 106)},
            ]);


            console.log(loanRes)
            
            /* SMS ERROR */
            if(data.status === 400) {  
 
                setCreating(false)
                setSmsErr(true);   
                return  setTimeout(() => setSmsErr(false), 3000)
            }
            
            setCreating(false)
            const modal = document.getElementById('my_modal_1')
            modal.checked = false
            console.log(modal.classList)
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
            setCreating(false)
            console.log(err);
        }
    }
    

    return ( 
        <Suspense fallback={<SplashScreen />}> 
            <div className={`fixed bg-green-500 right-8 md:right-10 z-[1000] top-20 px-5 py-1 rounded-md shadow-xl text-white ${notify ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification Sent! 
            </div>
            <div className={`fixed  bg-red-600  right-8 md:right-10 z-[1000] top-20 px-5 py-1 rounded-md shadow-xl text-white ${smsErr ? 'block translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} duration-700 transition-all`}>
                Notification not sent!
            </div>
          {/*  <div className="alert alert-error md:max-w-[300px] right-10 absolute z-[1000]">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-stone-100 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-stone-100">Error! Task failed successfully.</span>
            </div> */}

            <h1 className="text-3xl md:text-4xl px-5 md:px-20 font-bold">Client Management</h1>
            <div className="flex flex-col sm:flex-row gap-y-4 justify-between px-5 mt-5 md:px-20"> 
                {/* <button className="btn btn-active bg-[#21461A] text-white hover:bg-green-800 " onClick={()=>window.my_modal_1.showModal()}>
                    
                </button> */}
                <label htmlFor="my_modal_1" className="btn btn-active bg-[#21461A] text-white hover:bg-green-800 " >
                    <BiSolidUserPlus />
                    Add Client
                </label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md border border-stone-300 focus:input-warning focus:shadow-none w-full max-w-xs" />
            </div>
            {/* <div className="flex justify-between md:pr-20 fixed right-0 pr-5 w-full"> 
                 
               <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md focus:input-warning focus:shadow-none w-full max-w-xs" /> 
            </div>   */}
            <div className="overflow-x-auto  md:px-20 p-5 pt-8 pb-10  "> 
                <table className="table shadow-xl overflow-hidden">
                    {/* head */}
                    <thead className="bg-[#21461A] text-white">
                        <tr> 
                            <th>Client Name</th>
                            <th>Client Contact</th>
                            <th>Address</th>
                            <th>Date Joined</th>
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
                            filtered?.length ?
                                filtered?.map(client => ( 
                                    <tr key={client.uuid} className="hover:bg-[#21461A20] cursor-pointer" onClick={() => navigate(`/client/${client.uuid}`)}>
                                        <td>{`${client.first_name} ${client.last_name}`}</td>
                                        <td className="min-w-[180px]">{client.contact}</td>
                                        <td className="min-w-[200px]">{client.address}</td>
                                        <td >{new Date(client.created_at).toLocaleDateString()}</td>  
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

            <input type="checkbox" id="my_modal_1" className="modal-toggle" /> 
            <div  className="modal">
                <div className="modal-box max-w-min overflow-hidden">  
                    <label htmlFor="my_modal_1" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
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
                                        setInterest(e.target.value * 0.19)
                                        setTotalLoan(Number(e.target.value) + (Number(e.target.value) * 0.19))
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