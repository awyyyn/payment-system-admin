import { useState } from "react";
import supabase from "../lib/supabase";

export default function AddCollector() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({
		isShow: false,
		type: "",
		message: "",
		color: "",
	});
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
	});

	const handleChange = (e) => {
		// e.preventDefault();
		const { value, id } = e.target;
		setForm((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const { error, data } = await supabase.auth.admin.createUser({
			email: form.email,
			email_confirm: true,
			password: form.password,
		});

		if (error) {
			setMessage({
				color: "bg-red-500",
				isShow: true,
				message: error.message,
				// type: "error"
			});
			setLoading(false);
			setTimeout(() => setMessage((p) => ({ ...p, isShow: false })), 3000);
			return;
		}

		console.log(data);

		const { data: db, error: dbErr } = await supabase
			.from("lending_corp")
			.insert({ name: form.name, role: "collector" })
			.select();

		if (error) {
			alert(error.message);
			setLoading(false);
			return error.message;
		}

		setForm({
			email: "",
			name: "",
			password: "",
		});

		setMessage({
			color: "bg-green-500",
			isShow: true,
			message: "Created Successfully!",
			// type: "error"
		});

		setTimeout(() => setMessage((p) => ({ ...p, isShow: false })), 3000);

		setLoading(false);
	};

	return (
		<div className="md:px-5">
			<div
				className={`fixed ${
					message.color
				} right-8 md:right-10 top-20 px-5 py-1 rounded-md shadow-xl text-white z-[9999] ${
					message.isShow
						? "block translate-x-0 opacity-100"
						: "translate-x-10 opacity-0"
				} duration-700 transition-all`}>
				{message.message}
			</div>
			<h1 className="text-3xl font-bold">Add Collector</h1>

			<div className=" min-h-[500px]  pt-4  ">
				<form
					onSubmit={handleSubmit}
					className="w-full flex flex-wrap flex-col gap-y-5 h-full md:mt-20 items-center justify-center">
					<div className="form-control w-full max-w-xs space-y-3">
						<label htmlFor="name">Name</label>
						<input
							type="text"
							placeholder="Name"
							className="input focus:input-warning input-bordered input-md w-full max-w-xs"
							id="name"
							disabled={loading}
							onChange={handleChange}
							value={form.name}
						/>
					</div>

					<div className="form-control w-full max-w-xs space-y-3">
						<label htmlFor="email">Email</label>
						<input
							type="text"
							placeholder="email@example.com"
							className="input focus:input-warning input-bordered input-md w-full max-w-xs"
							id="email"
							disabled={loading}
							value={form.email}
							onChange={handleChange}
						/>
					</div>

					<div className="form-control w-full max-w-xs space-y-3">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							placeholder="**********"
							className="input focus:input-warning input-bordered input-md w-full max-w-xs"
							id="password"
							onChange={handleChange}
							disabled={loading}
							value={form.password}
						/>
					</div>

					<div className="form-control w-full mt-5 max-w-xs space-y-3">
						<button
							className="btn btn-warning min-w-full flex items-center justify-center w-full"
							disabled={
								!form.email ||
								!form.name ||
								!form.password ||
								form.password.length < 6
									? true
									: false
							}
							type="submit">
							{loading ? (
								<>
									<span className="loading loading-spinner"></span>
									<span>Creating</span>
								</>
							) : (
								<span>Create</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
