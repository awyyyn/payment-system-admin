import { Suspense, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { SplashScreen } from "../components";
import { Link /* useNavigate */, useNavigate } from "react-router-dom";
import { CorpContext } from "../context/AppContext";

const Tally = () => {
	// const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const { userData } = useContext(CorpContext);
	const [clients, setClients] = useState([]);
	const navigate = useNavigate();
	const [paid, setPaid] = useState([]);
	const [total, setTotal] = useState(false);

	useEffect(() => {
		async function getClients() {
			const currentDate = new Date().toISOString().split("T")[0];
			const collector_name = localStorage.getItem("name");
			let data;
			let error;

			try {
				const { data: cleintData } = await supabase
					.from("clients_table")
					.select("uuid, first_name, last_name, middle_name");
				setClients(cleintData);

				if (userData?.role == "collector") {
					const { data: cData, error: cError } = await supabase
						.from("payments_table")
						.select()
						.eq("collected_by", collector_name);
					data = cData
						.filter((item) => item.time_collected != null)
						.filter((item) => item.collected_by != null);
					error = cError;
				} else {
					const { data: aData, error: aError } = await supabase
						.from("payments_table")
						.select();
					data = aData
						.filter((item) => item.time_collected != null)
						.filter((item) => item.collected_by != null);
					error = aError;
				}

				if (error) throw error;
				const data2 = data?.filter(
					(item) => item.created_at.split("T")[0] == currentDate
				);
				const values = data2.map((i) => i.amount);
				setTotal(values.reduce((a, b) => a + b, 0));
				setPaid(data2);
				console.log(paid.length);
				setLoading(false);
			} catch (error) {
				console.log(error);
				setLoading(false);
			}
		}

		getClients();
	}, []);

	console.log(paid, "Paid");
	// useEffect(() => {
	//     setFiltered(clients?.filter(client => client.first_name.toLowerCase().includes(search.toLowerCase()) || client.last_name.toLowerCase().includes(search.toLowerCase()) ))
	// clients?.filter(client => String(client.first_name).toLowerCase().includes(String(search).toLowerCase()) || String(client.last_name).toLowerCase().includes(String(search).toLower()))
	// }, [search, clients])

	// console.log(new Date().toISOString())

	console.log(clients);

	return (
		<Suspense fallback={<SplashScreen />}>
			{/* <div className="flex justify-end md:px-20">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." className="input shadow-md focus:input-warning focus:shadow-none w-full max-w-xs" />
            </div>   */}
			<div className="flex justify-between md:px-20  px-5 ">
				<h1 className="text-left text-xl md:text-4xl font-bold leading-8 ">
					Reports
				</h1>

				<Link
					className="btn btn-outline text-warning-focus"
					to={"/pdf"}
					target="_blank">
					Open PDF
				</Link>
			</div>
			<div className="overflow-x-auto  md:px-20 mt-10 p-5 pb-10  ">
				<table className="table shadow-xl overflow-hidden">
					{/* head */}
					<thead className="bg-[#21461A] text-white">
						<tr>
							<th>Client Name</th>
							{userData?.role != "collector" && <th>Collected By</th>}
							<th>Time Collected</th>
							<th>Date</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{/* row 1 */}
						{loading ? (
							["1", "2", "3", "4", "5"].map((item) => (
								<tr key={item}>
									<td className="min-w-[180px]">
										<span className="loading loading-dots loading-xs"></span>
									</td>
									{userData?.role != "collector" && (
										<td className="min-w-[180px]">
											<span className="loading loading-dots loading-xs"></span>
										</td>
									)}
									<td className="min-w-[180px]">
										<span className="loading loading-dots loading-xs"></span>
									</td>
									<td className="min-w-[180px]">
										<span className="loading loading-dots loading-xs"></span>
									</td>
									<td className="min-w-[200px]">
										<span className="loading loading-dots loading-xs"></span>
									</td>
								</tr>
							))
						) : paid?.length ? (
							paid?.map((pay) => {
								const name = clients
									?.filter((item) => item.uuid == pay.client_id)
									.pop();
								console.log(pay);
								return (
									<tr
										key={pay.id}
										className="hover:bg-[#21461A20] cursor-pointer">
										<td className="min-w-[200px]">{`${name?.first_name}  ${name?.middle_name}   ${name?.last_name}`}</td>
										{userData?.role != "collector" && (
											<td
												className="min-w-[200px]"
												onClick={() => {
													navigate(`/collector-history/${pay.collected_by_id}`);
												}}>{`${pay?.collected_by}`}</td>
										)}
										<td className="min-w-[200px]">{`${pay?.time_collected}`}</td>
										<td className="min-w-[200px]">
											{new Date(pay.created_at).toDateString()}
										</td>
										<td className="min-w-[180px]">₱ {pay.amount}</td>
										{/* <td >{new Date(client.created_at).toLocaleDateString()}</td>   */}
									</tr>
								);
							})
						) : (
							<tr className="hover:bg-[#21461A20] cursor-pointer">
								<td colSpan={5} className="text-center text-lg">
									No collection this day
								</td>
							</tr>
						)}
						<tr className="hover:bg-[#21461A20] cursor-pointer">
							{total ? (
								<>
									<td
										className="min-w-[200px]"
										colSpan={userData?.role != "collector" ? 4 : 3}>
										Total
									</td>
									<td className="min-w-[180px]">₱ {total ? total : 0}</td>
								</>
							) : null}
							{/* <td >{new Date(client.created_at).toLocaleDateString()}</td>   */}
						</tr>
					</tbody>
				</table>
			</div>
		</Suspense>
	);
};

export default Tally;
