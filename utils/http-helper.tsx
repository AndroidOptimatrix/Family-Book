import { BASEURL } from "../config/config";
import { ApiResponse } from "../types/api.types";

const API_BASE_URL = 'https://www.demo.optiinfo.com/project/saraswatshakti/WebServices/WS.php';
// const LOCAL_BASE_URL = 'http://192.168.1.25:8074/saraswatshakti/WebServices/WS.php'; -- not work in this environment, only work in RDP
const DEMO_BASE_URL = `${BASEURL}/WebServices/WS.php`;

// Helper function for making API calls with fetch
export const makeApiCall = async (endpoint: string, params: Record<string, string>): Promise<ApiResponse> => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${DEMO_BASE_URL}?${queryString}`;

    console.log('🌐 Making API call to:', url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();

        // Try to parse JSON
        let parsedData: ApiResponse;
        try {
            parsedData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            throw new Error('Invalid JSON response from server');
        }

        console.log('✅ Parsed response:', parsedData);
        return parsedData;

    } catch (error: any) {
        console.error('🔥 API call error:', {
            message: error.message,
            stack: error.stack,
        });
        throw error;
    }
};