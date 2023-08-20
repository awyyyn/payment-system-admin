import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Layout from "./layouts/Layout"
import Dashboard from './pages/Dashboard'
import Signin from './pages/Signin' 
import Client from "./pages/Client"
import PaymentLedger from "./pages/PaymentLedger"
import Message from "./pages/Message" 
import Record from "./pages/Record"
import AddPayment from "./pages/AddPayment"
import { useEffect } from "react"
import supabase from "./lib/supabase"
import AddLoan from "./pages/AddLoan"

function App() {
  
  useEffect(() => {
    async function getSession () {      
      const { data } = await supabase.auth.getUser()
      console.log(data)
    } 

    getSession(); 
  }, [])
  

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: '/',
          index: true,
          element: <Dashboard />
        },
        {
          path: '/client', 
          element: <Client />
        },
        {
          path: '/payment-ledger',
          element: <PaymentLedger />
        },
        {
          path: '/create-loan',
          element: <AddLoan />
        },
        {
          path: '/message',
          element: <Message />
        },
        {
          path: '/create-payment',
          element: <AddPayment />
        },
        {
          path: '/client/:id',
          element: <Record />
        }
      ]
    },
    {
      path: '/sign-in',
      element: <Signin />
    }
  ])
  
  return ( 
    <RouterProvider router={router} />
  )
}

export default App
