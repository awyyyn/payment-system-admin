import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import supabase from "../lib/supabase";

 

export default function Record() {

  const { id } = useParams();
  const [client, setClient] = useState({});
  const [loading, setLoading] = useState(true); 
  const [loanBalance, setLoanBalance] = useState(0);
   

  useEffect(() => {
    async function getClient() {
      try {
        const { data, error } = await supabase.from('clients_table').select(`*, payments_table(*), loans_table(*)`).eq('uuid', id).single()
        let sum = 0; 
        console.log(data)
        if(data.loans_table?.length != 0){
          setLoanBalance(data?.loans_table[0]?.amount_loan - data?.payments_table?.map((d) => sum += d.amount).pop())
        }
        if(error) throw error
        setClient(data)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    getClient(); 

  }, [])
 
  return (
    <div className="md:px-20">
      <div className="flex justify-between flex-col sm:flex-row gap-y-3 pb-3 md:pb-0">
        <h1 className="text-3xl md:text-4xl font-bold">Client Record</h1>
        <button className="btn btn-sm bg-yellow-200 md:btn-md text-green-950 hover:bg-yellow-300" onClick={()=>window.my_modal_3.showModal()}>
          Payment History
        </button>
      </div>

      <div className="flex flex-col md:flex-row  gap-y-3 flex-wrap md:gap-x-10  md:justify-evenly md:mt-10 items-center">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">First Name</span> 
          </label>
          <input type="text" value={loading ? '...' : client.first_name} className="input input-bordered w-full max-w-xs" disabled />
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Middle Name</span> 
          </label>
          <input type="text" value={loading ? '...' : client.middle_name} className="input input-bordered w-full max-w-xs" disabled />
        </div>

        <div className="form-control w-full max-w-xs ">
          <label className="label">
            <span className="label-text">Last Name</span> 
          </label>
          <input type="text" value={loading ? '...' : client.last_name} className="input input-bordered w-full max-w-xs" disabled />
        </div>
        
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Contact Number</span> 
          </label>
          <input type="text" value={loading ? '...' : client.contact} className="input input-bordered w-full max-w-xs" disabled />
        </div>
      </div>

      <div className="flex flex-col md:flex-row   gap-y-3 flex-wrap md:gap-x-10 md:justify-evenly md:mt-5 items-center">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Email Address</span> 
          </label>
          <input type="text" value={loading ? '...' : client.email} className="input input-bordered w-full max-w-xs" disabled />
        </div>


        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Date Joined</span> 
          </label>
          <input type="text" value={loading ? '...' : new Date(client.created_at).toLocaleDateString()} className="input input-bordered w-full max-w-xs" disabled />
        </div>

        <div className="form-control w-full max-w-xs ">
          <label className="label">
            <span className="label-text">Amount Loan</span> 
          </label>
          <input type="text" value={loading ? '...' : `₱ ${client?.loans_table[0]?.amount_loan ? client?.loans_table[0]?.amount_loan : 0 }`} className="input input-bordered w-full max-w-xs" disabled />
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Principal </span> 
          </label>
          <input type="text" value={loading ? '...' : `₱ ${loanBalance}`} className="input input-bordered w-full max-w-xs" disabled />
        </div>

      </div> 
      <dialog id="my_modal_3" className="modal">
        <form method="dialog" className="modal-box">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <h3 className="font-bold text-lg">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr> 
                  <th className="text-center">Date</th>
                  <th className="text-center">Amount</th> 
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {client?.loans_table?.length == 0 ?
                  <tr>  
                      <td className="text-center" colSpan={2}>No Active Loan</td> 
                    </tr> 
                :
                  client?.payments_table?.map(payment => (
                    <tr key={payment.id}> 
                      <td className="text-center">{loading ? '...' : new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="text-center">{loading ? '...' : payment.amount}</td> 
                    </tr> 
                  ))
                }
                {client?.loans_table?.length > 0 && 
                  <tr>
                    <td className="text-center">Total Remaining Balance</td>
                    <td className="text-center font-bold text-lg">₱ {loading ? '...' : !loading &&  loanBalance}</td>
                  </tr>
                }
              </tbody>
            </table> 
          </div>
        </form>
      </dialog>
    </div>
  )
}

 