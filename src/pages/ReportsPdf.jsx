import {
	Document,
	Page,
	Text,
	StyleSheet,
	View,
	PDFViewer,
	Image,
} from "@react-pdf/renderer";
import supabase from "../lib/supabase";
import { useContext, useEffect, useState } from "react";
import { CorpContext } from "../context/AppContext";

const styles = StyleSheet.create({
	text: {
		fontSize: 14,
		textAlign: "center",
	},
	title: {
		fontWeight: "bold",
	},
	row: {
		marginTop: 10,
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-around",
	},
});

const ReactPDF = ({ data, clients, total, collectorName, userData }) => {
	let dataa =
		userData?.role == "collector"
			? data?.filter((item) => item.collected_by == collectorName)
			: data;

	return (
		<Document
			style={{
				width: "100vw",
			}}>
			<Page
				size="A4"
				wrap
				// dpi={400}
				style={{
					padding: "1in",
					// padding: '0.1in 1in'
				}}>
				<View>
					<Image
						src="https://bicol-amigo.vercel.app/assets/logo-ae3fc161.png"
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
							position: "absolute",
							opacity: 0.05,
							alignSelf: "center",
							top: "50%",
						}}
					/>
					<Text
						style={{
							alignSelf: "center",
							fontSize: 22,
							fontWeight: "bold",
						}}>
						Daily Report
					</Text>
				</View>
				<View
					style={{
						marginTop: "0.2in",
						display: "flex",
						justifyContent: "space-between",
						flexDirection: "row",
					}}>
					<Text>BICOL AMIGO&apos;S LENDING CORP</Text>
					<Text>DATE: {new Date().toLocaleDateString()}</Text>
				</View>
				{userData.role == "collector" && (
					<View>
						<Text style={{ marginTop: 4, textTransform: "capitalize" }}>
							Collector: {"\t"} {collectorName}
						</Text>
					</View>
				)}

				<View style={styles.row}>
					<Text
						style={[
							styles.text,
							styles.title,
							{ minWidth: userData.role == "collector" ? "40%" : "26.6%" },
						]}>
						Name
					</Text>
					{userData.role != "collector" && (
						<Text
							style={[
								styles.text,
								styles.title,
								{ minWidth: userData.role == "collector" ? "40%" : "26.6%" },
							]}>
							Collected By
						</Text>
					)}
					<Text
						style={[
							styles.text,
							styles.title,
							{ minWidth: userData.role == "collector" ? "40%" : "26.6%" },
						]}>
						Time Collected
					</Text>
					<Text
						style={[
							styles.text,
							styles.title,
							{ minWidth: "20%", textAlign: "center" },
						]}>
						Amount
					</Text>
				</View>

				{dataa?.map((pay, i) => {
					const name = clients
						?.filter((item) => item.uuid == pay.client_id)
						.pop();

					return (
						<View key={i} style={styles.row}>
							<Text
								style={[
									styles.text,
									styles.title,
									{
										minWidth: userData.role == "collector" ? "40%" : "26.6%",
										flexShrink: 1,
									},
								]}>
								{name.first_name} {name.last_name}
							</Text>
							{userData.role != "collector" && (
								<Text
									style={[
										styles.text,
										styles.title,
										{
											// backgroundColor: "blue",
											minWidth: userData.role == "collector" ? "40%" : "26.6%",
										},
									]}>
									{pay.collected_by}
								</Text>
							)}
							<Text
								style={[
									styles.text,
									styles.title,
									{
										// backgroundColor: "blue",
										minWidth: userData.role == "collector" ? "40%" : "26.6%",
									},
								]}>
								{pay.time_collected}
							</Text>
							<Text
								style={[
									styles.text,
									styles.title,
									{
										textAlign: "left",
										minWidth: "20%%",
										display: "flex",
										// justifyContent: "flex-end",
									},
								]}>
								<Text>{pay.amount} Php</Text>
							</Text>
						</View>
					);
				})}
				<View
					style={{
						marginTop: "20px",
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						borderTop: "3px solid black",
						paddingTop: 5,
						alignItems: "center",
					}}>
					<Text
						style={[
							styles.text,
							styles.title,
							{ fontSize: 25, minWidth: "80%" },
						]}>
						Total
					</Text>
					<Text
						style={[styles.text, { fontWeight: "extrabold", minWidth: "20%" }]}>
						{total} Php
					</Text>
				</View>
			</Page>
		</Document>
	);
};

export default function ReportsPdf() {
	const [loading, setLoading] = useState(true);
	const [clients, setClients] = useState([]);
	const [paid, setPaid] = useState([]);
	const [total, setTotal] = useState(false);
	const [cName, setCname] = useState({
		name: "",
		role: "",
	});

	useEffect(() => {
		(async () => {
			const { data } = await supabase
				.from("lending_corp")
				.select()
				.eq("name", localStorage.getItem("name"));

			setCname({
				name: data[0].name,
				role: data[0].role,
			});
		})();

		async function getClients() {
			const currentDate = new Date().toISOString().split("T")[0];
			let error;
			let data;
			try {
				const { data: cleintData } = await supabase
					.from("clients_table")
					.select("uuid, first_name, last_name, middle_name");
				setClients(cleintData);
				if (cName?.role == "collector") {
					const { data: cData, error: cError } = await supabase
						.from("payments_table")
						.select()
						.eq("collected_by", cName.name);
					data = cData;
					error = cError;
					console.log(data, "CCCCCCCCCCCCCCCCCCC");
				} else {
					const { data: aData, error: aError } = await supabase
						.from("payments_table")
						.select();
					data = aData;
					console.log(data, "AAAAAAAAAAAAAAAAAAAA");
					error = aError;
				}
				if (error) throw error;
				const data2 = data?.filter(
					(item) => item.created_at.split("T")[0] == currentDate
				);
				const values = data2.map((i) => i.amount);
				setTotal(values.reduce((a, b) => a + b, 0));
				let dataaToPass =
					cName.role == "collector"
						? data2.filter((item) => item.collected_by == cName.name)
						: data2;
				setPaid(dataaToPass);
				setLoading(false);
			} catch (error) {
				console.log(error);
				setLoading(false);
			}
		}

		setTimeout(() => {
			getClients();
		}, 1500);
	}, []);

	return (
		<>
			{loading ? (
				<div className="w-screen h-screen  grid place-content-center">
					<span className="loading loading-infinity loading-lg scale-150"></span>
				</div>
			) : (
				<PDFViewer style={{ width: "100vw", height: "100vh" }}>
					<ReactPDF
						data={[...paid]}
						clients={[...clients]}
						total={total}
						collectorName={cName.name}
						userData={cName}
					/>
				</PDFViewer>
			)}
		</>
	);
}
