import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? `http://${window.location.hostname}:5000/api` : "/api",
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