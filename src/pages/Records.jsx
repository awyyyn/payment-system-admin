import { Suspense, useEffect, useState } from "react"
import supabase from '../lib/supabase'
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "../components";

 

const Records = () => {

    const navigate = useNavigate()
    
    const [clients, setClients] =  useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(clients)

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

    }, [])
 

    useEffect(() => {
        setFiltered(clients?.filter(client => client.first_name.toLowerCase().includes(search.toLowerCase()) || client.last_name.toLowerCase().includes(search.toLowerCase()) ))
        // clients?.filter(client => String(client.first_name).toLowerCase().includes(String(search).toLowerCase()) || String(client.last_name).toLowerCase().includes(String(search).toLower()))
    }, [search, clients]) 
    
 
 
    

    return ( 
        <Suspense fallback={<SplashScreen />}> 
            <div className="flex justify-end md:px-20">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md focus:input-warning focus:shadow-none w-full max-w-xs" />
            </div>  
            <div className="overflow-x-auto  md:px-20 mt-10 p-5 pb-10  "> 
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
                                    <tr key={client.uuid} className="hover:bg-[#21461A20] cursor-pointer" onClick={() => navigate(`/records/${client.uuid}`)}>
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
 
        </Suspense>
    )
}

export default Records

 