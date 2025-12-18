import { useEffect, useState } from "react"
import { makeApiCall } from "../utils/http-helper";
import { BirthDayOrAnniversary } from "../types/dashboard.types";

const useBirthdayOrAnnivarsary = () => {
    const [loading, setLoading] = useState(false);
    const [dataType, setDataType] = useState<'birthday' | 'anniversary'>('birthday');

    const [data, setData] = useState<BirthDayOrAnniversary[]>([]);

    async function fetchData() {
        setLoading(true);
        try {
            const params = {
                type: 'birthday_remainder',
                data_for: dataType
            };

            const response = await makeApiCall('', params);
            console.log("🎂 Birthday/Anniversary data fetched:", response.DATA);

            if (response.DATA) {
                setData(response.DATA);
            }
        } catch (error) {
            console.error("❌ Error fetching Birthday/Anniversary data:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [dataType])

    return {
        data,
        loading,
        dataType,
        setDataType,
        refetch: fetchData,
    }
}

export default useBirthdayOrAnnivarsary