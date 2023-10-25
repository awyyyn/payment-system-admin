import { useEffect, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";
import { useParams } from "react-router-dom";
import supabase from "../lib/supabase";
import { FaChevronDown } from "react-icons/fa";
import { AiFillCheckCircle } from "react-icons/ai";

export default function ClientRecord() {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [clientsData, setClientData] = useState({
		name: "",
		loans: [],
	});

	useEffect(() => {
		setLoading(true);
		(async () => {
			const { data, error } = await supabase
				.from("clients_table")
				.select(`*, loans_table(*, payments_table(*) )`)
				.eq("uuid", id)
				.single();

			if (error) return alert(error.message);
			setClientData({
				name: `${data.first_name} ${data.last_name}`,
				loans: data.loans_table,
			});
			setLoading(false);
		})();
	}, [id]);

	return (
		<div>
			<div className="flex flex-row items-center gap-x-4">
				<button
					onClick={() => window.history.back()}
					className="btn flex flex-row items-center btn-ghost max-w-[50px] md:max-w-[100px]">
					<MdArrowBackIos /> <span className="hidden md:block">Back</span>
				</button>
				{loading ? (
					<div className="animate-pulse rounded-md bg-gray-200 h-8 w-64"></div>
				) : (
					<h1 className="font-bold text-2xl">
						{clientsData?.name}&apos;s loan history
					</h1>
				)}
			</div>
			<div className="divider" />
			{loading ? (
				<div className="w-full  grid place-content-center min-h-[300px] sm:min-h-[550px]">
					<span className="loading loading-infinity loading-lg scale-[2]"></span>
				</div>
			) : (
				<div className="join join-vertical w-full shadow-md">
					{clientsData?.loans?.map((loan) => {
						let date = new Date(loan.created_at);
						date = date.toLocaleDateString();
						console.log(loan);

						return (
							<div
								key={loan.id}
								className="collapse rounded-none bg-base-50 overflow-hidden  ">
								<input type="checkbox" className="peer" />
								<div className="collapse-title  peer-checked:bg-base-200">
									<span className="absolute text-gray-500 text-xs top-2 left-2">
										Date: {date}
									</span>
									<div className="flex justify-between mt-3">
										<h1 className=" ">Amount Loan: {loan.total_amount}</h1>
										<div
											className="tooltip z-50"
											data-tip={`${loan?.is_paid ? "Paid" : "Pending"}`}>
											<AiFillCheckCircle
												className={`scale-125 z-50 ${
													loan?.is_paid ? "fill-green-500" : "fill-gray-400"
												}`}
											/>
										</div>
										{/* <h1>{loan?.is_paid ? "Paid" : "Pending"}</h1> */}
									</div>
								</div>
								{/* <h1 className="peer-checked:text-red-400 absolute right-5 top-5">
									ads
								</h1> */}
								<FaChevronDown className="peer-checked:rotate-[180deg] transition-transform duration-500 absolute right-5 top-6" />
								<div className="collapse-content relative peer-checked:duration-700 duration-700 ">
									{loan?.payments_table?.map((payment) => {
										return (
											<div
												key={payment.id}
												className="relative py-2 pl-0  border-b border-gray-200 flex-wrap">
												<div className="flex flex-row justify-between flex-wrap">
													<p className="w-[50%] flex flex-wrap">
														<span>Amount:</span>
														<span>{payment?.amount}</span>
													</p>
													<p className="w-[50%]">
														<span>Date Collected:</span>
														<span>{payment?.date}</span>
													</p>
												</div>
												<div className="flex flex-row justify-between">
													<p className="w-[50%]">
														<span>Collected By:</span>
														<span>{payment?.collected_by}</span>
													</p>
													<p className="w-[50%]">
														<span>Time Collected:</span>
														<span>{payment?.time_collected}</span>
													</p>
												</div>
												{/* <div
													className="tooltip z-50 absolute top-3 right-5"
													data-tip={`${payment?.is_paid ? "Paid" : "Pending"}`}>
													<AiFillCheckCircle
														className={`scale-125 z-50 ${
															payment?.is_paid
																? "fill-green-500"
																: "fill-gray-400"
														}`}
													/>
												</div> */}
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
