import axios from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

interface FetchYearsOptions {
    yearsBefore?: number; // Jumlah tahun ke belakang
    yearsAfter?: number; // Jumlah tahun ke depan
}
export interface AnggaranTypes {
    id: number;
    tahun: string;
    kode_akun: string;
    budget1: string;
    budget2: string;
    budget3: string;
    budget4: string;
    budget5: string;
    budget6: string;
    budget7: string;
    budget8: string;
    budget9: string;
    budget10: string;
    budget11: string;
    budget12: string;
    userid: string;
    tgl_update: string;
    no_akun: string;
    nama_akun: string;
    state?: 'NEW' | 'EDIT' | 'DELETE';
    Old_tahun?: string;
    Old_kode_akun?: string;
}
export const fetchYears = async (
    setYears: (years: string[]) => void,
    setSelectedYear: (year: string) => void,
    token: string,
    entitas: string,
    options: FetchYearsOptions = { yearsBefore: 3, yearsAfter: 3 }
): Promise<void> => {
    const { yearsBefore = 3, yearsAfter = 3 } = options;

    // Fungsi untuk membuat daftar tahun
    const generateYearList = (tahun: number): string[] => {
        const yearList: string[] = [];
        for (let i = yearsBefore; i >= 0; i--) {
            yearList.push((tahun - i).toString());
        }
        for (let i = 1; i <= yearsAfter; i++) {
            yearList.push((tahun + i).toString());
        }
        return yearList;
    };

    try {
        const response = await axios.get(`${apiUrl}/erp/master/anggaran-akun/data`, {
            params: { entitas: entitas, param1: 'TAHUN' },
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data.data;
        const tahun = data?.tahun ?? new Date().getFullYear(); // Fallback ke tahun saat ini

        const yearList = generateYearList(tahun);
        setYears(yearList);
        setSelectedYear(tahun.toString());
    } catch (error) {
        console.error('Error fetching years:', error);
        const tahun = new Date().getFullYear();
        const yearList = generateYearList(tahun);
        setYears(yearList);
        setSelectedYear(tahun.toString());
    }
};
export const fetchAkunData = async (entitas: string, token: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/list_akun_global?`, {
            params: {
                entitas: entitas,
                param1: 'SQLAkunBebanAnggaranAkun',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
export const fetchDataList = async (setDsMaster: (data: AnggaranTypes[]) => void, token: string, entitas: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/anggaran-akun/data`, {
            params: { entitas: entitas, param1: 'LISTDATA' },
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data;
        setDsMaster(
            data.map((item: AnggaranTypes, index: number) => {
                return {
                    ...item,
                    id: index + 1,
                    budget1: item.budget1 === null ? null : parseFloat(item.budget1),
                    budget2: item.budget2 === null ? null : parseFloat(item.budget2),
                    budget3: item.budget3 === null ? null : parseFloat(item.budget3),
                    budget4: item.budget4 === null ? null : parseFloat(item.budget4),
                    budget5: item.budget5 === null ? null : parseFloat(item.budget5),
                    budget6: item.budget6 === null ? null : parseFloat(item.budget6),
                    budget7: item.budget7 === null ? null : parseFloat(item.budget7),
                    budget8: item.budget8 === null ? null : parseFloat(item.budget8),
                    budget9: item.budget9 === null ? null : parseFloat(item.budget9),
                    budget10: item.budget10 === null ? null : parseFloat(item.budget10),
                    budget11: item.budget11 === null ? null : parseFloat(item.budget11),
                    budget12: item.budget12 === null ? null : parseFloat(item.budget12),
                };
            })
        );
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const postProsesData = async (data: { entitas: string; data: AnggaranTypes[] }, token: string) => {
    try {
        const response = await axios.post(`${apiUrl}/erp/master/anggaran-akun/proses_data`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};
