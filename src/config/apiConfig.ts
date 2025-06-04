const useLocal = false; // Set to true to use local URL, false to use hosted URL

const VITE_API_URL = import.meta.env.VITE_API_URL;
const VITE_LOCAL_URL = import.meta.env.VITE_LOCAL_URL;

export const API_BASE_URL = useLocal ? VITE_LOCAL_URL : VITE_API_URL;
