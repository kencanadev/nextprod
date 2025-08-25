import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { DataTable } from 'mantine-datatable';
import axios from 'axios';
import { getServerSideProps } from '@/pages/api/getServerSide';
import moment from 'moment';
import styles from '../pblist.module.css';
import { formatNumber, frmNumber, generateNU } from '@/utils/routines';

interface DaftarPOProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDataPO: any;
    kodeSupp: any;
    kode_entitas: any;
    kontrak: any;
}

const DaftarPO: React.FC<DaftarPOProps> = ({ isOpen, onClose, onSelectDataPO, kodeSupp, kode_entitas, kontrak }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedRowIndex2, setSelectedRowIndex2] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<string>('');
    const [selectedDataPO, setSelectedDataPO] = useState<string>('');
    const [selectedNoSp, setSelectedNoSp] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState('');
    const [listDlgPO, setListDlgPO] = useState([]);
    const [listDlgPOUpdate, setListDlgPOupdate] = useState([]);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    // Gunakan `filteredData` sebagai records di DataTable

    const currentDate = moment().format('YYYY-MM-DD');

    useEffect(() => {
        // alert(kodeSupp);
        const Async = async () => {
            const obj = {
                entitas: kode_entitas,
                where: {
                    // kode_supp: `${kodeSupp}`,
                    kode_supp: `${kodeSupp}`, // di hilangkan persen pada tanggal 21/05/2025 agar supplier sesuai
                    tgl_sp: `${currentDate}`,
                    no_sp: '%',
                    kontrak: `${kontrak}`,
                    id_sp: '%',
                },
            };

            const jsonString = JSON.stringify(obj);
            const encodedString = btoa(jsonString);
            console.log('🚀 ~ Async ~ encodedString:', encodedString);

            try {
                const responseListDlgPO = await axios.get(`${apiUrl}/erp/dlg_detail_po`, {
                    params: {
                        cmd: encodedString,
                    },
                });

                const response = responseListDlgPO.data.data;
                setListDlgPO(response);
                setListDlgPOupdate([]);
                console.log('DLG RESPONSE', response);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error scenario
            }
        };

        Async();
    }, [kodeSupp]);

    const handleSelectData = (data: string, index: number) => {
        setSelectedData(data);
        setSelectedRowIndex(index);
    };

    // const handleOKClick = () => {
    //     onSelectDataPO(selectedData);
    //     onClose();
    // };

    const Async = async (no_sp: any) => {
        const obj = {
            entitas: kode_entitas,
            where: {
                kode_supp: `%`,
                tgl_sp: `${currentDate}`,
                no_sp: `${no_sp}`,
                kontrak: `${kontrak}`,
                id_sp: '%',
            },
        };

        const jsonString = JSON.stringify(obj);
        const encodedString = btoa(jsonString);

        try {
            const responseListDlgPO = await axios.get(`${apiUrl}/erp/dlg_detail_po`, {
                params: {
                    cmd: encodedString,
                },
            });

            const response = responseListDlgPO.data.data;
            setListDlgPOupdate(response);
            console.log('DLG RESPONSE', response);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error scenario
        }
    };

    const handleRowClick = (no_sp: any, index: number) => {
        Async(no_sp);
        setSelectedRowIndex(index);
        setSelectedRowIndex2(null);
        setSelectedNoSp(no_sp);
    };

    const handleRowClick2 = (no_sp: any, index: number) => {
        setSelectedRowIndex2(index);
    };

    const handleRowDoubleClick = (no_sp: any) => {
        onSelectDataPO(no_sp);
        onClose();
    };

    const handleOKClick = () => {
        onSelectDataPO(selectedNoSp);
        onClose();
    };

    const filteredData = (listDlgPO: any[], searchTerm: string) => {
        return listDlgPO.reduce((result: any[], item: any) => {
            const existingItem = result.find((resultItem) => resultItem.no_sp === item.no_sp);

            const matchesSearchTerm = searchTerm ? item.no_sp.toLowerCase().includes(searchTerm.toLowerCase()) : true;

            if (!existingItem && matchesSearchTerm) {
                result.push(item);
            }

            return result;
        }, []);
    };
    const filterNoSp = filteredData(listDlgPO, searchTerm);

    const filteredDatabyNoSP = listDlgPOUpdate.filter((item: any) => item.no_sp.toLowerCase().includes(searchTerm.toLowerCase()));

    // const filteredData = [...Array(20)].map((_, index) => `Supplier ${index + 1}`).filter((data) => data.toLowerCase().includes(searchTerm.toLowerCase()));

    const detailPO = filteredDatabyNoSP.map((item: any) => ({
        no_sp: item.no_sp,
        kodegrup: item.kodegrup,
        no_item: item.no_item,
        diskripsi: item.diskripsi,
        satuan: item.satuan,
        qty: item.qty,
        sisa: item.sisa,
        jumlah_rp: item.jumlah_rp,
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
                            {/* <Dialog.Panel className={`panel my-8 rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Order Pembelian</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    <form className="ml-2 flex flex-col items-center gap-1 font-semibold md:flex-row">
                                        <label className="ml-3 mt-2">Cari</label>
                                        <input type="text" placeholder="Nomor PO" className="form-input mb-2 md:mb-0 md:w-auto" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </form>
                                </div>
                                <table className="w-full" style={{ cursor: 'pointer' }}>
                                    <thead>
                                        <tr>
                                            <th>No. PO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item: any, index) => (
                                            <tr key={index} onClick={() => handleRowClick(item.no_sp)}>
                                                <td>{item.no_sp}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table> */}

                            <Dialog.Panel className={`panel my-8 rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Order Pembelian (PO)</div>
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
                                                            <th style={tableStyleHeader}>Daftar PO</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {filterNoSp.map((item: any, index: any) => (
                                                            <tr
                                                                key={index}
                                                                className={`hover:bg-gray-100`}
                                                                style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                onDoubleClick={() => handleRowDoubleClick(item.no_sp)}
                                                                onClick={() => handleRowClick(item.no_sp, index)}
                                                            >
                                                                <td style={tableStyle}>{item.no_sp}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* <DataTable
                                    withBorder={true}
                                    withColumnBorders={true}
                                    highlightOnHover
                                    className={`ticky-table table-hover whitespace-nowrap`}
                                    striped
                                    style={{ background: '#e8e8e8' }}
                                    columns={[
                                        {
                                            accessor: 'no_sp',
                                            title: 'No. PO',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ no_sp }) => (
                                                <div
                                                    style={{ textAlign: 'right', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        handleRowClick(no_sp);
                                                        // alert(`Item with No. PO: ${no_lpb} was clicked.`);
                                                    }}
                                                    onDoubleClick={() => {
                                                        // alert(`DOUBLE CLICK Item with No. PO: ${no_sp} was clicked.`);
                                                        // handleRowClick(no_sp);
                                                        handleRowDoubleClick(no_sp);
                                                    }}
                                                >
                                                    {selectedRow === no_sp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {no_sp}</div> : <div> {no_sp}</div>}
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'PO Grup',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ kodegrup }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{kodegrup}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'PPN Atas Nama',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ nama_cabang }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{nama_cabang}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'No. Barang',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ no_item }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{no_item}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'Nama Barang',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ diskripsi }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{diskripsi}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'Satuan',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ satuan }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{satuan}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'Qty',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ qty }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{qty}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'Sisa',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ sisa }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{sisa}</div>,
                                        },
                                        {
                                            accessor: 'no_lpb',
                                            title: 'Jumlah (Rp)',
                                            textAlignment: 'center',
                                            sortable: true,
                                            render: ({ jumlah_rp }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{jumlah_rp}</div>,
                                        },
                                        // Tambahkan kolom lain di sini sesuai kebutuhan Anda
                                    ]}
                                    records={filteredDatabyNoSP}
                                /> */}

                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <div className="overflow-x-auto overflow-y-auto" style={{ height: '35vh', width: '90vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ ...tableStyleHeader, width: '18vh', textAlign: 'center' }}>No. PO</th>
                                                            <th style={{ ...tableStyleHeader, width: '13vh', textAlign: 'center' }}>PO Grup</th>
                                                            <th style={{ ...tableStyleHeader, width: '35vh', textAlign: 'center' }}>PPN Atas Nama</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>No. Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Nama Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Satuan</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Qty</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Sisa</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Jumlah (Rp)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {detailPO.length > 0 ? (
                                                            detailPO?.map((item: any, index) => (
                                                                <tr
                                                                    className={`cursor-pointer hover:bg-gray-100`}
                                                                    style={selectedRowIndex2 === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onDoubleClick={() => {
                                                                        handleRowDoubleClick(item.no_sp);
                                                                    }}
                                                                    onClick={() => handleRowClick2(item.no_sp, index)}
                                                                >
                                                                    <td style={tableStyle}>{item.no_sp}</td>
                                                                    <td style={tableStyle}>{item.kodegrup}</td>
                                                                    <td style={tableStyle}>{item.nama_cabang}</td>
                                                                    <td style={tableStyle}>{item.no_item}</td>
                                                                    <td style={tableStyle}>{item.diskripsi}</td>
                                                                    <td style={tableStyle}>{item.satuan}</td>
                                                                    <td style={tableStyle}>{frmNumber(item.qty)}</td>
                                                                    <td style={tableStyle}>{frmNumber(item.sisa)}</td>
                                                                    <td style={tableStyle}>{frmNumber(item.jumlah_rp)}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={14} style={{ ...tableStyle, textAlign: 'center', height: detailPO.length > 0 ? 'auto' : '20vh' }}>
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

export { getServerSideProps };

export default DaftarPO;
