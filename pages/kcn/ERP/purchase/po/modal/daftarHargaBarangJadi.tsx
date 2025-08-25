import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../polist.module.css';
import moment from 'moment';
import { DlgHargaItemTerakhir } from '../model/api';
import { frmNumber } from '@/utils/routines';

interface listHargaBarangJadiProps {
    isOpen: boolean;
    onClose: () => void;
    produksi: any;
    kode_item: any;
    idFilterHarga: any;
    kode_entitas: any;
    onSelectData: any;
}

const DaftarHargaBarangJadi: React.FC<listHargaBarangJadiProps> = ({ isOpen = false, onClose, produksi, kode_item, idFilterHarga, kode_entitas, onSelectData }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [kodePp, setKodePp] = useState<string>('');
    const [noPp, setNoPp] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDaftarPp, setSelectedDaftarPp] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    // let dataObject: any;
    const [dataObject, setDataObject] = useState({});
    const handleSelectData = (id: any, harga_mu: string, index: number) => {
        setSelectedRowIndex(index);
        setDataObject({
            id,
            harga_mu,
        });
    };

    const handleOKClick = () => {
        onSelectData(dataObject);
        onClose();
    };

    const [apiResponseDetail, setApiResponseDetail] = useState({
        status: false,
        message: '',
        data: [],
    });

    const [apiResHargaItemTerakhir, setApiResHargaItemTerakhir] = useState([]);

    const currentDate = moment();
    const tanggal = currentDate.format('YYYY-MM-DD');

    useEffect(() => {
        const fetchDataDetail = async () => {
            try {
                await DlgHargaItemTerakhir(kode_entitas, kode_item)
                    .then((result) => {
                        console.log(result);
                        setApiResHargaItemTerakhir(result);
                        // alert(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataDetail();
    }, [kode_item]);

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
                                    <div className="text-lg font-bold">Harga Pembelian</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className={styles['flex-container']}>
                                        {/* Form Grid Layouts */}

                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <div className="overflow-x-auto overflow-y-auto" style={{ height: '35vh', width: '90vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ ...tableStyleHeader, width: '18vh', textAlign: 'center' }}>No. Order</th>
                                                            <th style={{ ...tableStyleHeader, width: '13vh', textAlign: 'center' }}>Tanggal</th>
                                                            <th style={{ ...tableStyleHeader, width: '35vh', textAlign: 'center' }}>Nama Relasi</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Harga(MU)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {apiResHargaItemTerakhir.length > 0 ? (
                                                            apiResHargaItemTerakhir?.map((item: any, index) => (
                                                                <tr
                                                                    className={`hover:bg-gray-100`}
                                                                    style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() => handleSelectData(idFilterHarga, item.harga_mu, index)}
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>{item.no_dok}</td>
                                                                    <td style={tableStyle}>{moment(item.tgl).format('DD-MM-YYYY')}</td>
                                                                    <td style={tableStyle}>{item.nama_relasi}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.harga_mu)}</td>
                                                                    {/* <td style={tableStyle}>{item.sisa}</td>
                                                                    <td style={tableStyle}>{item.sisa}</td> */}
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

export default DaftarHargaBarangJadi;
