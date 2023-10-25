import { useParams } from "react-router-dom";
import supabase from "../lib/supabase";
import { useEffect, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";

export default function CollectorHistory() {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [collectorData, setCollectorData] = useState(null);
	const [history, setHistory] = useState([]);

	useEffect(() => {
		(async () => {
			const { data, error } = await supabase
				.from("lending_corp")
				.select()
				.eq("id", id)
				.single();

			if (error) return alert(error.message);

			setCollectorData(data);

			const { data: history, error: historyError } = await supabase
				.from("payments_table")
				.select(`*`)
				.eq("collected_by_id", id);
			if (historyError) return alert(historyError.message);

			const { data: client, error: clientError } = await supabase
				.from("clients_table")
				.select();

			if (clientError) return alert(clientError.message);

			setHistory(
				history.map((item) => {
					const name = client.find((it) => it.uuid == item.client_id);
					// console.log(name, "ASDASD");
					return {
						id: item.id,
						name: `${name.first_name} ${name.last_name}`,
						amount: item.amount,
						date: item.date,
						time_collected: item.time_collected,
					};
				})
			);
			// setHistory(0);
			setLoading(false);
		})();
	}, [id]);

	console.log(history);

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
						{collectorData?.name}&apos;s history
					</h1>
				)}
			</div>
			<div className="divider"></div>
			<div className="overflow-x-auto  shadow-md px-1">
				<table className="table table-xs mb-5">
					<thead>
						<td className="td-header">#</td>
						<td className="td-item td-header">Name</td>
						<td className="td-item td-header">Time Collected</td>
						<td className="td-item td-header">Date</td>
						<td className="td-item td-header">Amount</td>
					</thead>
					<tbody>
						{loading ? (
							[1, 2, 3, 4, 5].map((i) => {
								return (
									<tr key={i}>
										<td>
											<div className="animate-pulse rounded-md bg-gray-200 h-8 w-4"></div>
										</td>
										<td>
											<div className="animate-pulse rounded-md bg-gray-200 h-8 w-64"></div>
										</td>
										<td>
											<div className="animate-pulse rounded-md bg-gray-200 h-8 w-64"></div>
										</td>
										<td>
											<div className="animate-pulse rounded-md bg-gray-200 h-8 w-64"></div>
										</td>
										<td>
											<div className="animate-pulse rounded-md bg-gray-200 h-8 w-64"></div>
										</td>
									</tr>
								);
							})
						) : !history.length ? (
							<>
								<tr>
									<td colSpan={5} className="">
										<div className="h-20 grid place-content-center text-lg">
											Empty history
										</div>
									</td>
								</tr>
							</>
						) : (
							history?.map((item, k) => {
								return (
									<tr key={k}>
										<td className="td-item">{k + 1}</td>
										<td className="td-item">{item?.name}</td>
										<td className="td-item">{item?.time_collected}</td>
										<td className="td-item">{item?.date}</td>
										<td className="td-item">{item?.amount}</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
