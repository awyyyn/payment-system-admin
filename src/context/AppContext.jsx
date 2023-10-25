import { createContext, useState } from "react";

export const CorpContext = createContext();

const AppContext = ({ children }) => {
	const [userData, setUserData] = useState({
		id: "",
		name: "",
		role: "",
		email: "",
	});

	return (
		<CorpContext.Provider value={{ userData, setUserData }}>
			{children}
		</CorpContext.Provider>
	);
};

export default AppContext;
