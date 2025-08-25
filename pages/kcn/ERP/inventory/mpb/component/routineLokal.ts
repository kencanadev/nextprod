import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import store from '@/store';

// export default function Home() {
export default function Qty2QtyStd32(entitas: any, kode_item: any, satuan: any, sat_std: any, qty: any) {
    // export default function Qty2QtyStd32(a:any, b : any) {
    //     const [nilai, setNilai] = useState(0);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    let vkode_item, vsatuan, vsatuan2, vsatuan3: string;
    let vstd2, vkonversi2, vstd3, vkonversi3, vNilai, vQty: any;
    const getApinya = async () => {
        const response = await axios.get(`${apiUrl}/erp/qty_2Qty_Std?`, {
            params: {
                entitas: entitas,
                param1: kode_item,
            },
        });

        const responseData = response.data.data;
        const transformedData_getinfo = responseData.map((item: any) => ({
            satuan: item.satuan,
            satuan2: item.satuan2,
            std2: item.std2,
            konversi2: item.konversi2,
            satuan3: item.satuan3,
            std3: item.std3,
            konversi3: item.konversi3,
        }));
        vsatuan2 = transformedData_getinfo[0].satuan2;
        vstd2 = parseFloat(transformedData_getinfo[0].std2);
        vkonversi2 = parseFloat(transformedData_getinfo[0].konversi2);
        vstd3 = parseFloat(transformedData_getinfo[0].std3);
        vkonversi3 = parseFloat(transformedData_getinfo[0].konversi3);
        vsatuan3 = transformedData_getinfo[0].satuan3;

        if (satuan.toLowerCase() === sat_std.toLowerCase()) {
            vQty = qty;
        } else if (satuan.toLowerCase() === vsatuan2.toLowerCase()) {
            vQty = (qty * vstd2) / vkonversi2;
        } else if (satuan.toLowerCase() === vsatuan3.toLowerCase()) {
            vQty = (qty * vstd3) / vkonversi3;
        }
        const data = { vQty };

        return data;
        // return await vQty;
        // return getApinya().then((result: any) => {
        //     console.log('result', result);
        //     console.log('data', data);
        //     return result;
        // });
    };

    return getApinya().then((response) => {
        const jsonPromise = response.vQty;
        jsonPromise.then((PromiseResult: { value: any }[]) => {
            console.log('tessss ' + PromiseResult[0].value);
        });
        // console.log('result', result);
        // return result;
    });
    // const fetchPromise = fetch('getApinya()');

    // fetchPromise.then((response) => {
    //     const jsonPromise = response.json();
    //     jsonPromise.then((data) => {
    //         console.log(data[0].value);
    //     });
    // });

    // function eksekusiPromise() {
    //     let data: any;
    //     getApinya().then((result) => {
    //         data = result;
    //     });
    //     return data;
    // }

    // async function eksekusiPromise() {
    //     const token = store.getState().token;
    //     const data = { token };
    //     return getApinya(data)
    //         .then((result) => {
    //             console.log(result);
    //             return result;
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //             return null;
    //         });
    // }

    // console.log('ini data', eksekusiPromise());
    // return  eksekusiPromise();

    // return <div className="datatable-crud-demo surface-card border-round shadow-2 p-4"></div>;
}
