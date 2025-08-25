import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../polist.module.css';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';

interface listPPProps {
    isOpen: boolean;
    onClose: () => void;
    produksi: any;
    kode_entitas: any;
    onSelectData: any;
    jenisBarang: any;
    vRefreshData: any;
}

const DaftarPp: React.FC<listPPProps> = ({ isOpen = false, onClose, produksi, kode_entitas, onSelectData, jenisBarang, vRefreshData }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [kodePp, setKodePp] = useState<string>('');
    const [noPp, setNoPp] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDaftarPp, setSelectedDaftarPp] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const handleSelectData = (kode_pp: string, no_pp: any, index: number) => {
        setKodePp(kode_pp);
        setNoPp(no_pp);
        setSelectedRowIndex(index);
        setSelectedDaftarPp(true);
    };

    const handleOKClick = () => {
        const dataObject = {
            noPp,
            property: 'data',
            produksi,
            tanggal,
        };
        onSelectData(dataObject);
        onClose();
    };

    const [apiResponse, setApiResponse] = useState({
        status: false,
        message: '',
        data: [],
    });

    const [apiResponseDetail, setApiResponseDetail] = useState({
        status: false,
        message: '',
        data: [],
    });

    const currentDate = moment();
    const tanggal = currentDate.format('YYYY-MM-DD');
    const tanggalBaru = currentDate.format('YYYY-MM-DD HH:mm:ss');

    console.log('produksi = ', produksi, tanggal, jenisBarang, vRefreshData);

    useEffect(() => {
        const obj = {
            entitas: kode_entitas,
            where: {
                // kode_supp: ${kodeSupp},
                produksi: produksi,
                tgl: tanggal,
            },
        };

        const jsonString = JSON.stringify(obj);
        const encodedString = btoa(jsonString);

        const fetchData = async () => {
            try {
                // const response = await axios.get(`${apiUrl}/erp/list_daftar_pp`, {
                //     params: {
                //         cmd: encodedString,
                //     },
                // });
                const response = await axios.get(`${apiUrl}/erp/list_daftar_pp_filter`, {
                    params: {
                        entitas: kode_entitas,
                        produksi: produksi,
                        tgl: tanggal,
                        tipe: jenisBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                    },
                });
                setApiResponse(response.data);
                console.log('response.data.data 1= ', response.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [produksi, tanggalBaru]);

    const listPP = apiResponse.data.map((item: any) => ({
        kode_pp: item.kode_pp,
        no_pp: item.no_pp,
    }));

    const filteredData = listPP.filter((data) => data.no_pp.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        const obj = {
            entitas: kode_entitas,
            where: {
                produksi: produksi,
                tgl: tanggal,
                no_pp: noPp,
            },
        };

        const jsonString = JSON.stringify(obj);
        const encodedString = btoa(jsonString);

        const fetchDataDetail = async () => {
            try {
                const response2 = await axios.get(`${apiUrl}/erp/dlg_detail_pp`, {
                    params: {
                        cmd: encodedString,
                    },
                });
                setApiResponseDetail(response2.data);
                console.log(response2.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataDetail();
    }, [noPp]);

    const detailPP = apiResponseDetail.data.map((item: any) => ({
        no_pp: item.no_pp,
        no_item: item.no_item,
        diskripsi: item.diskripsi,
        satuan: item.satuan,
        sisa: item.sisa,
    }));

    const commonTableStyle: React.CSSProperties = {
        border: '1px solid #bbbbbb',
        padding: '8px',
        cursor: 'pointer',
        userSelect: 'none',
    };

    const tableStyle: React.CSSProperties = {
        ...commonTableStyle,
    };

    const tableStyleHeader: React.CSSProperties = {
        ...commonTableStyle,
        backgroundColor: 'rgb(94, 98, 98)',
        color: 'white',
        textAlign: 'left',
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                {/* ... Modal Overlay ... */}
                <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] bg-[black]/60">
                    <div className="flex min-h-screen items-center justify-center px-4">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {/* ... Modal Content ... */}
                            <Dialog.Panel className={`panel my-8 rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Permintaan Pembelian (PP)</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className={styles['flex-container']}>
                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <input
                                                type="text"
                                                placeholder="No PP"
                                                style={{ borderColor: '#958b8b' }}
                                                className="form-input mb-3 h-[3.5vh]"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="overflow-y-auto" style={{ height: '35vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={tableStyleHeader}>Daftar PP</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {filteredData.map((item: any, index: any) => (
                                                            <tr
                                                                key={index}
                                                                className={`hover:bg-gray-100`}
                                                                style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                onClick={() => handleSelectData(item.kode_pp, item.no_pp, index)}
                                                                onDoubleClick={handleOKClick}
                                                            >
                                                                <td style={tableStyle}>{item.no_pp}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Form Grid Layouts */}

                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <div className="overflow-x-auto overflow-y-auto" style={{ height: '35vh', width: '90vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ ...tableStyleHeader, width: '18vh', textAlign: 'center' }}>No. PP</th>
                                                            <th style={{ ...tableStyleHeader, width: '13vh', textAlign: 'center' }}>No. Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '35vh', textAlign: 'center' }}>Nama Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Satuan</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>SPP</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Sisa</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {detailPP.length > 0 ? (
                                                            detailPP?.map((item: any, index) => (
                                                                <tr
                                                                    className={`hover:bg-gray-100`}
                                                                    style={selectedDaftarPp === true ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() => handleSelectData(item.kode_pp, item.no_pp, index)}
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>{item.no_pp}</td>
                                                                    <td style={tableStyle}>{item.no_item}</td>
                                                                    <td style={tableStyle}>{item.diskripsi}</td>
                                                                    <td style={tableStyle}>{item.satuan}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.sisa)}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.sisa)}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={14} style={{ ...tableStyle, textAlign: 'center', height: detailPP.length > 0 ? 'auto' : '20vh' }}>
                                                                    Silahkan Pilih Data Terlebih Dahulu
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mr-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4"></div>

                                    <div className="mb-3 flex space-x-4">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleOKClick}
                                            style={{ width: '8vh', height: '4vh', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                        >
                                            OK
                                        </button>
                                        <button type="button" className="btn btn-outline-danger" onClick={onClose} style={{ width: '8vh', height: '4vh' }}>
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DaftarPp;
