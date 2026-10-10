import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
	baseURL:
		import.meta.env.MODE === "development"
			? `http://${window.location.hostname}:5000/api`
			: `${API_URL}/api`,
});
// Get a fresh Clerk token before every request so it never expires
axiosInstance.interceptors.request.use(async (config) => {
	try {
		const token = await (window as any).Clerk?.session?.getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	} catch (error) {
		console.log("Error getting Clerk token", error);
	}
	return config;
});