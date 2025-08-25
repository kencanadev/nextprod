import { fetchPreferensi } from '@/utils/routines';
import axios from 'axios';
import Swal from 'sweetalert2';

export const overQTYAllCustom = async (kode_entitas: string, kodeGudang: string, kodeItem: string, tgl: string, kode_dokumen: string, qty: any, jenis: any, jenisWarning: any, target: any = '') => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let Lskip_persediaan;

    try {
        const result = await fetchPreferensi(kode_entitas, `${apiUrl}/erp/preferensi?`);
        Lskip_persediaan = result[0]?.skip_persediaan || '';

        console.log('Lskip_persediaan = ', Lskip_persediaan);

        if (Lskip_persediaan === 'N') {
            const response = await axios.get(`${apiUrl}/erp/qty_stock_all`, {
                params: {
                    entitas: kode_entitas,
                    param1: kodeItem,
                    param2: tgl,
                    param3: kodeGudang,
                    param4: kode_dokumen,
                    param5: jenis,
                },
            });

            const responseData = response.data.data;
            console.log('responseData[0].stok = ', responseData[0]?.stok, parseFloat(qty));

            if (responseData[0]?.stok < parseFloat(qty)) {
                const swalResult = await Swal.fire({
                    title: 'Warning',
                    text: `${jenisWarning} (${qty}) melebihi stok yang ada (${responseData[0].stok}).`,
                    icon: 'warning',
                    target,
                });
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
