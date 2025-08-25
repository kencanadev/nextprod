import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../fblist.module.css';

interface listPBProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    kodeSupp: any;
    kode_entitas: any;
    tanggalDokumen: any;
}

const ListPB: React.FC<listPBProps> = ({ isOpen = false, onClose, onSelectData, kodeSupp, kode_entitas, tanggalDokumen }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [kode_lpb, setKode_lpb] = useState<string>('');
    const [no_lpb, setNo_lpb] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSelectData = (kode_lpb: string, no_lpb: any, index: number) => {
        setKode_lpb(kode_lpb);
        setNo_lpb(no_lpb);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        onSelectData(kode_lpb, no_lpb);
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

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/dlg_header_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        ucode: kodeSupp,
                        tanggal: tanggalDokumen,
                    },
                });
                setApiResponse(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [kodeSupp, tanggalDokumen]);

    const listPB = apiResponse.data.map((item: any) => ({
        no_lpb: item.no_lpb,
        kode_lpb: item.kode_lpb,
    }));

    const filteredData = listPB.filter((data) => data.no_lpb.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        const fetchDataDetail = async () => {
            try {
                const response2 = await axios.get(`${apiUrl}/erp/dlg_detail_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        ucode: kode_lpb,
                    },
                });
                setApiResponseDetail(response2.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataDetail();
    }, [kode_lpb]);

    const detailFB = apiResponseDetail.data.map((item: any) => ({
        no_item: item.no_item,
        diskripsi: item.diskripsi,
        satuan: item.satuan,
        qty: item.qty,
        qty_mpb: item.qty_mpb,
        brt: item.brt,
        harga_mu: parseFloat(item.harga_mu).toLocaleString('en-US', {
            minimumFractionDigits: 2,
        }),
        diskon_mu: parseFloat(item.diskon_mu).toLocaleString('en-US', {
            minimumFractionDigits: 2,
        }),
        potongan_mu: parseFloat(item.potongan_mu).toLocaleString('en-US', {
            minimumFractionDigits: 2,
        }),
        pajak_mu: parseFloat(item.pajak_mu).toLocaleString('en-US', {
            minimumFractionDigits: 2,
        }),
        jumlah_mu: parseFloat(item.jumlah_mu).toLocaleString('en-US', {
            minimumFractionDigits: 2,
        }),
        ket: item.ket,
        nama_dept: item.nama_dept,
        nama_kerja: item.nama_kerja,
    }));

    const tableStyle: React.CSSProperties = {
        border: '1px solid #dddddd',
        padding: '8px',
        cursor: 'pointer',
        userSelect: 'none',
    };

    const tableStyleCell: React.CSSProperties = {
        ...tableStyle,
    };

    const tableStyleHeader: React.CSSProperties = {
        ...tableStyle,
        backgroundColor: 'rgb(94, 98, 98)',
        color: 'white',
        textAlign: 'center',
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment} >
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
                                    <div className="text-lg font-bold">Daftar Penerimaan Barang</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className={styles['flex-container']}>
                                        <div className="panel">
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                style={{ borderColor: 'rgb(94, 98, 98)' }}
                                                className="form-input mb-3 h-[3.5vh]"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="overflow-y-auto" style={{ maxHeight: '20vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={tableStyleHeader}>Penerimaan Barang</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {filteredData.map((item: any, index: any) => (
                                                            <tr
                                                                key={index}
                                                                className={`hover:bg-gray-100`}
                                                                style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                onClick={() => handleSelectData(item.kode_lpb, item.no_lpb, index)}
                                                            >
                                                                <td style={tableStyleCell}>{item.no_lpb}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Form Grid Layouts */}

                                        <div className="panel">
                                            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '20vh', maxWidth: '140vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={tableStyleHeader}>No. Barang</th>
                                                            <th style={tableStyleHeader}>Nama Barang</th>
                                                            <th style={tableStyleHeader}>Satuan</th>
                                                            <th style={tableStyleHeader}>Kuantitas</th>
                                                            <th style={tableStyleHeader}>Retur</th>
                                                            <th style={tableStyleHeader}>Berat</th>
                                                            <th style={tableStyleHeader}>Harga</th>
                                                            <th style={tableStyleHeader}>Diskon</th>
                                                            <th style={tableStyleHeader}>Potongan</th>
                                                            <th style={tableStyleHeader}>Pajak</th>
                                                            <th style={tableStyleHeader}>Jumlah</th>
                                                            <th style={tableStyleHeader}>Keterangan</th>
                                                            <th style={tableStyleHeader}>Departmen</th>
                                                            <th style={tableStyleHeader}>Kegiatan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {detailFB.length > 0 ? (
                                                            detailFB?.map((item: any) => (
                                                                <tr className={`hover:bg-gray-100`}>
                                                                    <td style={tableStyleCell}>{item.no_item}</td>
                                                                    <td style={tableStyleCell}>{item.diskripsi}</td>
                                                                    <td style={tableStyleCell}>{item.satuan}</td>
                                                                    <td style={tableStyleCell}>{item.qty}</td>
                                                                    <td style={tableStyleCell}>{item.qty_mpb}</td>
                                                                    <td style={tableStyleCell}>{item.brt}</td>
                                                                    <td style={tableStyleCell}>{item.harga_mu}</td>
                                                                    <td style={tableStyleCell}>{item.diskon_mu}</td>
                                                                    <td style={tableStyleCell}>{item.potongan_mu}</td>
                                                                    <td style={tableStyleCell}>{item.pajak_mu}</td>
                                                                    <td style={tableStyleCell}>{item.jumlah_mu}</td>
                                                                    <td style={tableStyleCell}>{item.ket}</td>
                                                                    <td style={tableStyleCell}>{item.nama_dept}</td>
                                                                    <td style={tableStyleCell}>{item.nama_kerja}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={14} style={{ ...tableStyleCell, textAlign: 'center', height: detailFB.length > 0 ? 'auto' : '20vh' }}>
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
                                        <button type="button" className="btn btn-primary" onClick={handleOKClick} style={{ width: '8vh', height: '4vh' }}>
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

export default ListPB;
