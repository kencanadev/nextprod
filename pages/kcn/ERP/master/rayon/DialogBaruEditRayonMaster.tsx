import { useProgress } from '@/context/ProgressContext';
import { useSession } from '@/pages/api/sessionContext';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import React, { useEffect, useRef, useState } from 'react';
import GridTambahSales from './GridTambahSales';
import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import GlobalProgressBar from '@/components/GlobalProgressBar';

const DialogBaruEditRayonMaster = ({ masterData, masterState, visible, onClose, refreshData }: { masterData: any; masterState: any; visible: boolean; onClose: Function; refreshData: Function }) => {
    const { sessionData } = useSession();
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const { startProgress, isLoading, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const header = 'Rayon ' + masterState + (Object?.keys(masterData || {}).length !== 0 && masterState !== 'BARU' ? ' Kode : ' + masterData?.area : '');
    const gridSales = useRef<any>(null);

    const [headerState, setHeaderState] = useState({
        kode: '',
        wilayah_penjualan: '',
        salesman_utama: '',
    });

    const [salesLis, setSalesLis] = useState([]);

    const handleHeaderChange = (e: any) => {
        const { name, value }: { name: string; value: string } = e.target;

        // Update filterState
        setHeaderState((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }

    const getSales = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/salesman?entitas=${kode_entitas}&param1=Y&param2=all&param3=N&param4&param5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSalesLis(response.data.data);
        } catch (error) {}
    };
    useEffect(() => {
        getSales();
    }, []);

    const getDetail = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/detail_rayon?entitas=${kode_entitas}&param1=${masterData.kode_area}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const hasil = response.data.data;
            setHeaderState({
                kode: hasil.master.area,
                wilayah_penjualan: hasil.master.lokasi,
                salesman_utama: hasil.master.kode_sales,
            });
            const remapData = hasil.detail.map((item: any, index: any) => ({
                ...item,
                id: index,
            }));
            gridSales.current.dataSource = [...remapData];
            gridSales.current!.refresh();
        } catch (error) {}
    };

    useEffect(() => {
        if (masterState === 'EDIT') {
            getDetail();
        }
    }, []);

    const validasi = () => {
        const allStates = {
            kode: headerState.kode,
            wilayah_penjualan: headerState.wilayah_penjualan,
        };

        // Iterasi setiap properti di objek gabungan
        for (const [key, value] of Object?.entries(allStates || {})) {
            if (value === '' || value === null || value === undefined) {
                // Tampilkan pesan error swal jika ada properti yang kosong
                Swal.fire({
                    icon: 'warning',
                    title: 'Perhatian',
                    target: '#forDialogAndSwall',
                    text: `${formatString(key)} belum diisi`,
                }).then(() => {
                    // Fokus ke input jika key adalah "kode"
                    if (key === 'kode') {
                        document.getElementById('kode')?.focus();
                    } else if (key === 'wilayah_penjualan') {
                        document.getElementById('wilayah_penjualan')?.focus();
                    } else if (key === 'salesman_utama') {
                        document.getElementById('salesman_utama')?.focus();
                    }
                });
                return false; // Berhenti validasi jika ada yang kosong
            }
        }

        return masterState === 'BARU' ? savedoc() : editdoc();
    };

    const savedoc = async () => {
        startProgress();
        const master = {
            entitas: kode_entitas,
            area: headerState.kode,
            lokasi: headerState.wilayah_penjualan,
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            kode_sales: headerState.salesman_utama,
            subArea: [...gridSales.current.dataSource],
        };

        try {
            const response: any = await axios.post(`${apiUrl}/erp/simpan_rayon?`, master, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response);

            if (response.data.status) {
                const auditReqBodySPM = {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'AR',
                    kode_dokumen: '',
                    no_dokumen: '',
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'NEW',
                    diskripsi: `Penambahan Area Rayon : ${moment().format('DD-MM-YYY')} ${headerState.kode}`,
                    userid: userid.toUpperCase(),
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBodySPM);
                await refreshData();
                Swal.fire({
                    title: 'Berhasil Simpan',
                    target: '#forDialogAndSwallAwal',
                    icon: 'success',
                    timer: 1500,
                });
                refreshData();
                endProgress();
                onClose();
            }
        } catch (error: any) {
            endProgress();
            if (error) {
                console.log(error);
                Swal.fire({
                    title: 'Gagal Simpan',
                    text: `${error?.response?.data?.message} 
                (${error?.response?.data?.error})`,
                    target: '#forDialogAndSwall',
                    icon: 'warning',
                });
            }
        }

        endProgress();
    };

    const editdoc = async () => {
        startProgress();
        const modData = gridSales.current!.dataSource.map((item: any) => ({
            ...item,
            kode_area: masterData.kode_area,
        }));
        const master = {
            entitas: kode_entitas,
            kode_area: masterData.kode_area,
            area: headerState.kode,
            lokasi: headerState.wilayah_penjualan,
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            kode_sales: headerState.salesman_utama,
            subArea: modData,
        };

        try {
            const response: any = await axios.patch(`${apiUrl}/erp/update_rayon?`, master, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response);

            if (response.data.status) {
                const auditReqBodySPM = {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'AR',
                    kode_dokumen: '',
                    no_dokumen: '',
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'Update',
                    diskripsi: `Update Area Rayon : ${moment().format('DD-MM-YYY')} ${headerState.kode}`,
                    userid: userid.toUpperCase(),
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBodySPM);
                await refreshData();
                Swal.fire({
                    title: 'Berhasil Edit',
                    target: '#forDialogAndSwallAwal',
                    icon: 'success',
                    timer: 1500,
                });
                refreshData();
                endProgress();
                onClose();
            }
        } catch (error: any) {
            endProgress();
            if (error) {
                console.log(error);
                Swal.fire({
                    title: 'Gagal Simpan',
                    text: `${error?.response?.data?.message} 
                (${error?.response?.data?.error})`,
                    target: '#forDialogAndSwall',
                    icon: 'warning',
                });
            }
        }

        endProgress();
    };

    return (
        <DialogComponent
            id="forDialogAndSwall"
            isModal={true}
            width="50%"
            height="90%"
            visible={visible}
            close={() => onClose()}
            header={header}
            showCloseIcon={true}
            target="#forDialogAndSwallAwal"
            // closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
        >
            <div className="flex flex-col gap-1">
                <GlobalProgressBar />
                <div className="flex h-[30%] w-full flex-col gap-1">
                    <div className="flex h-[40px] w-[40%] flex-col ">
                        <div className="h-[15px] w-full bg-sky-600 text-center text-xs text-white">KODE</div>
                        <div className="h-[25px]  w-full bg-white-dark">
                            <input
                                type="text"
                                autoComplete="off"
                                id="kode"
                                className={`h-[25px] w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 `}
                                placeholder={formatString('kode')}
                                value={headerState.kode}
                                onChange={handleHeaderChange}
                                name="kode"
                            />
                        </div>
                    </div>

                    <div className="flex h-[40px] w-[60%] flex-col ">
                        <div className="h-[15px] w-full bg-sky-600 text-center text-xs text-white">Wilayah Penjualan</div>
                        <div className="h-[25px]  w-full bg-white-dark">
                            <input
                                type="text"
                                autoComplete="off"
                                id="wilayah_penjualan"
                                className={`h-[25px] w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 `}
                                placeholder={formatString('wilayah_penjualan')}
                                value={headerState.wilayah_penjualan}
                                onChange={handleHeaderChange}
                                name="wilayah_penjualan"
                            />
                        </div>
                    </div>

                    <div className="flex h-[40px] w-[60%] flex-col">
                        <div className="h-[15px] w-full bg-sky-600 text-center text-xs text-white">Salesman Utama</div>
                        <div className="h-[25px] w-full bg-white-dark">
                            <select
                                id="salesman_utama"
                                className="h-[25px] w-full rounded-sm border border-gray-400 bg-gray-50 p-1 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                value={headerState.salesman_utama}
                                onChange={handleHeaderChange}
                                name="salesman_utama"
                            >
                                <option value="" disabled>
                                    {formatString('salesman_utama')}
                                </option>
                                {salesLis.map((item: any) => (
                                    <option value={item.kode_sales}>{item.nama_sales}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex h-[60%] w-full flex-col">
                    <h2 className="text-xs">Daftar Salesman</h2>
                    <GridTambahSales gridSales={gridSales} apiUrl={apiUrl} kode_entitas={kode_entitas} token={token} />
                </div>
                <div className="flex h-[10%] justify-end gap-2">
                    <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={validasi}>
                        Simpan
                    </button>
                    <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={() => onClose()}>
                        Tutup
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
};

export default DialogBaruEditRayonMaster;
