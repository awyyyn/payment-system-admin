import { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../lib/supabase";
import { SplashScreen } from "../components";

export default function Record() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [client, setClient] = useState({});
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [loan, setLoan] = useState({});
	const [payments, setPayments] = useState([]);

	useEffect(() => {
		async function getClient() {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("clients_table")
					.select(`*, payments_table(*), loans_table(*)`)
					.eq("uuid", id)
					.single();
				if (error) throw error;
				console.log(data);
				setClient(data);
				let activeLoan = data?.loans_table
					?.filter((d) => d.is_paid != true)
					.pop();

				setLoan(activeLoan);
				// console.log(loan)
				const paid_data = data?.payments_table?.filter(
					(i) => i.is_paid == true && i.loan == activeLoan.id
				);
				// const total
				// setTotal(Object.values(paid_data).map(i => i.amount)?.reduce((a, b) => a + b))
				const total = Object.values(paid_data).map((i) => i.amount);
				console.log("total", total);
				setPayments(
					data?.payments_table
						.filter((i) => i.loan === activeLoan.id)
						.sort((a, b) => a.num - b.num)
				);
				console.log();
				if (total.length > 0) {
					setTotal(
						Object.values(paid_data)
							.map((i) => i.amount)
							.reduce((a, b) => a + b)
					);
				} else {
					setTotal(0);
				}
				console.log("PAID", total);
				// console.log("TOAL", total.length > 0 ? total.reduce((a, b) => a + b) : null)

				// console.log(data?.payments_table?.filter(d => d.loan == activeLoan?.id).sort((a, b) => a.num - b.num))
				setLoading(false);
			} catch (error) {
				console.log(error);
				setLoading(false);
			}
		}

		getClient();
	}, []);

	return (
		<Suspense fallback={<SplashScreen />}>
			<div className="md:px-20">
				<div className="flex justify-between flex-col flex-wrap sm:flex-row gap-y-3 pb-3 md:pb-0">
					<h1 className="text-3xl md:text-4xl font-bold">Client Record</h1>
					<div className="flex flex-wrap gap-x-4">
						<button
							className="btn btn-sm bg-yellow-400 md:btn-md text-green-950 hover:bg-yellow-200"
							onClick={() =>
								/* window.my_modal_2.showModal() */ navigate(
									`/loan-history/${client?.uuid}`
								)
							}>
							Loan History
						</button>
						<button
							className="btn btn-sm bg-green-700 md:btn-md text-white hover:bg-green-500"
							onClick={() => window.my_modal_3.showModal()}>
							Payment History
						</button>
					</div>
				</div>

				<div className="flex flex-col md:flex-row  gap-y-3 flex-wrap md:gap-x-10  md:justify-evenly md:mt-10 items-center">
					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">First Name</span>
						</label>
						<input
							type="text"
							value={loading ? "..." : client?.first_name}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">Middle Name</span>
						</label>
						<input
							type="text"
							value={loading ? "..." : client?.middle_name}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs ">
						<label className="label">
							<span className="label-text">Last Name</span>
						</label>
						<input
							type="text"
							value={loading ? "..." : client?.last_name}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">Contact Number</span>
						</label>
						<input
							type="text"
							value={loading ? "..." : client?.contact}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>
				</div>

				<div className="flex flex-col md:flex-row   gap-y-3 flex-wrap md:gap-x-10 md:justify-evenly md:mt-5 items-center">
					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">Email Address</span>
						</label>
						<input
							type="text"
							value={loading ? "..." : client?.email ? client?.email : ""}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">Date Joined</span>
						</label>
						<input
							type="text"
							value={
								loading
									? "..."
									: new Date(client?.created_at).toLocaleDateString()
							}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs ">
						<label className="label">
							<span className="label-text">Amount Loan</span>
						</label>
						<input
							type="text"
							value={
								loading
									? "..."
									: `₱ ${loan?.amount_loan ? loan?.amount_loan : ""}`
							}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs ">
						<label className="label">
							<span className="label-text">Interest (19%)</span>
						</label>
						<input
							type="text"
							value={
								loading
									? "..."
									: loan?.amount_loan
									? `₱ ${Number(loan?.amount_loan) * 0.19}`
									: "₱ "
							}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">Total Amount </span>
						</label>
						<input
							type="text"
							value={
								loading
									? "..."
									: `₱ ${loan?.total_amount ? loan?.total_amount : ""}`
							}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>

					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">Principal </span>
						</label>
						<input
							type="text"
							value={
								loading
									? "..."
									: `₱ ${loan?.amount_loan ? loan.total_amount - total : ""}`
							}
							className="input input-bordered w-full max-w-xs shadow-lgz"
							disabled
						/>
					</div>
				</div>

				{!loading && (
					<dialog id="my_modal_3" className="modal">
						<form method="dialog" className="modal-box">
							<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
								✕
							</button>
							<h3 className="font-bold text-lg">Payment History</h3>
							<div className="overflow-x-auto">
								<table className="table">
									{/* head */}
									<thead>
										<tr>
											<th className="text-center">Date</th>
											<th className="text-center">Amount</th>
											<th className="text-center">Status</th>
										</tr>
									</thead>
									<tbody>
										{/* row 1 */}
										{client?.loans_table?.length == 0 ? (
											<tr>
												<td className="text-center" colSpan={3}>
													No Active Loan
												</td>
											</tr>
										) : payments.length == 0 ? (
											<>
												<tr>
													<td colSpan={3} className="text-center">
														No active loan
													</td>
												</tr>
											</>
										) : (
											payments?.map((payment) => (
												<tr key={payment?.id}>
													<td className="text-center">
														{loading ? "..." : payment?.date}
													</td>
													<td className="text-center">
														{loading ? "..." : ` ₱ ${payment?.amount}`}
													</td>
													<td
														className={` ${
															payment?.is_paid
																? "text-green-700"
																: "text-red-500"
														} text-center font-bold`}>
														{loading
															? "..."
															: payment?.is_paid
															? "Paid"
															: "..."}
													</td>
												</tr>
											))
										)}
										{/* {loading ? 
                      <tr><td colSpan={2} className="text-center">Fetching Data</td></tr> : 
                      client?.loans_table?.length > 0 &&
                      <tr>
                        <td className="text-center">Total Paid Amount</td>
                        <td className="text-center font-bold text-lg">₱ {loading ? '...' : !loading &&  total}</td>
                      </tr> 
                    } */}
									</tbody>
								</table>
							</div>
						</form>
					</dialog>
				)}

				{!loading && (
					<dialog id="my_modal_2" className="modal">
						<form method="dialog" className="modal-box">
							<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
								✕
							</button>
							<h3 className="font-bold text-lg">Loan History</h3>
							<div className="overflow-x-auto">
								<table className="table">
									{/* head */}
									<thead>
										<tr>
											<th className="text-center">Date</th>
											<th className="text-center">Amount</th>
											<th className="text-center">Status</th>
										</tr>
									</thead>
									<tbody>
										{/* row 1 */}
										{client?.loans_table?.length == 0 ? (
											<tr>
												<td className="text-center" colSpan={3}>
													No Loan History
												</td>
											</tr>
										) : (
											client?.loans_table?.map((loan) => (
												<tr key={loan.id}>
													<td className="text-center">
														{loading
															? "..."
															: new Date(loan.created_at).toDateString()}
													</td>
													<td className="text-center">
														{loading ? "..." : `₱ ${loan.total_amount}`}
													</td>
													<td
														className={` ${
															loan?.is_paid ? "text-green-700" : "text-red-500"
														} font-bold`}>
														{loading
															? "..."
															: loan.is_paid
															? "Paid"
															: "Pending"}
													</td>
												</tr>
											))
										)}
										{/* {loading ? 
                      <tr><td colSpan={2} className="text-center">Fetching Data</td></tr> : 
                      client?.loans_table?.length > 0 &&
                      <tr>
                        <td className="text-center">Total Paid Amount</td>
                        <td className="text-center font-bold text-lg">₱ {loading ? '...' : !loading &&  total}</td>
                      </tr> 
                    } */}
									</tbody>
								</table>
							</div>
						</form>
					</dialog>
				)}
			</div>
		</Suspense>
	);
}
