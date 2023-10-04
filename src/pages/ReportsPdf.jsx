import { Document, Page, Text, StyleSheet, View, PDFViewer, Image,  } from "@react-pdf/renderer";
import supabase from "../lib/supabase";
import { useEffect, useState } from "react";


const styles = StyleSheet.create({

    text: {
        fontSize: 14,
    },
    title: {
        fontWeight: "bold"
    },
    row: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
 
const ReactPDF = ({data, clients, total}) => (
    <Document 
        style={{ 
            width: '100vw'
        }}
    >
        <Page size='A4' 
            wrap
            // dpi={400}
            style={{    
                padding: '1in',                 
                // padding: '0.1in 1in'
            }}
        >
            <View>
            <Image 

                src='https://bicol-amigo.vercel.app/assets/logo-ae3fc161.png'
                // source={{
                //     uri: '../assets/logo.png',
                //     // data: ''
                //     format: 'png',
                //     data: "Buffer",
                //     method: 'GET',
                //     body: ''
                // }}
                cache
                style={{
                    height: 300,
                    width: 300,
                    zIndex: 99,
                    position: 'absolute',
                    opacity: 0.05,
                    alignSelf: 'center',
                    top: '50%'
                    
                }}
            />
                <Text 
                    style={{
                        alignSelf: 'center',
                        fontSize: 22,
                        fontWeight: 'bold'
                    }}
                >Daily Sales Report</Text>
            </View>
            <View
                style={{
                    marginTop: '0.2in',
                    display: 'flex',
                    justifyContent: "space-between",
                    flexDirection: 'row'
                }}
            >
                <Text>BICOL AMIGO&apos;S LENDING CORP</Text>
                <Text>DATE: {new Date().toLocaleDateString()}</Text>
            </View>
            

            <View 
                style={styles.row}
            >
                <Text style={[styles.text, styles.title]}>Name</Text>
                <Text style={[styles.text, styles.title]}>Amount</Text>
            </View>

            {data?.map((pay, i) => {

                const name =  clients?.filter(item => item.uuid == pay.client_id).pop()

                return (
                    <View 
                        key={i}
                        style={styles.row}
                    >
                        <Text style={[styles.text, styles.title]}>{name.first_name} {name.last_name}</Text>
                        <Text style={[styles.text, styles.title]}>{pay.amount}  Php</Text>
                    </View>
                )
            })}    
            <View
                style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: "row",
                    justifyContent: 'space-between',
                    borderTop: '3px solid black',
                    paddingTop: 5,
                    alignItems: 'center'
                }}
            >
                <Text style={[styles.text, styles.title, { fontSize: 25}]}>Total</Text>
                <Text style={[styles.text, { fontWeight: 'extrabold',  }]}>{total} Php</Text>
            </View>
        </Page>
    </Document>
)

export default function ReportsPdf() {

    
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [paid, setPaid] = useState([])
    const [total, setTotal] = useState(false);  


    useEffect(() => {
        async function getClients() {  
            const currentDate = new Date().toISOString().split('T')[0]; 

            try {
                const { data: cleintData } = await supabase.from('clients_table').select("uuid, first_name, last_name, middle_name") 
                setClients(cleintData)
                const { data, error } = await supabase.from('payments_table').select().neq('is_paid', false);
                if(error) throw error  
                const data2 = data?.filter((item) => item.created_at.split('T')[0] == currentDate) 
                const values = data2.map(i => i.amount)
                setTotal(values.reduce((a, b) => a + b , 0))
                  
                 
                setPaid(data2); 
                setLoading(false) 
            } catch (error) { 
                console.log(error)
                setLoading(false)
            }
        }

        getClients();

    }, [])


    console.log(paid)
 
        
    return (
        <>

            {loading ? 
                <div className="w-screen h-screen  grid place-content-center">                     
                    <span className="loading loading-infinity loading-lg scale-150"></span>
                </div>
                : 
                <PDFViewer style={{width: '100vw', height: '100vh'}}>
                    <ReactPDF data={[...paid]} clients={[...clients]} total={total} />
                </PDFViewer>
            }
            
        </>
    )
}
