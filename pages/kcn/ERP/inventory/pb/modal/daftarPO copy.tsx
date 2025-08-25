import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { DataTable } from 'mantine-datatable';
import axios from 'axios';
import { getServerSideProps } from '@/pages/api/getServerSide';
import moment from 'moment';

interface DaftarPOProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDataPO: any;
    kodeSupp: any;
    kode_entitas: any;
}

const DaftarPO: React.FC<DaftarPOProps> = ({ isOpen, onClose, onSelectDataPO, kodeSupp, kode_entitas }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<string>('');
    const [selectedDataPO, setSelectedDataPO] = useState<string>('');
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
                    kode_supp: `${kodeSupp}%`,
                    tgl_sp: `${currentDate}`,
                    no_sp: '%',
                    kontrak: 'Y',
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

    // const handleSelectData = (data: string, index: number) => {
    //     setSelectedData(data);
    //     setSelectedRowIndex(index);
    // };

    // const handleOKClick = () => {
    //     onSelectDataPO(selectedData);
    //     onClose();
    // };

    const Async = async (no_sp: any) => {
        const obj = {
            entitas: '99999',
            where: {
                kode_supp: `%`,
                tgl_sp: `${currentDate}`,
                no_sp: `${no_sp}`,
                kontrak: 'Y',
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

    const handleRowClick = (no_sp: any) => {
        Async(no_sp);
        // onSelectDataPO(no_sp);
        // onClose();
        // alert(no_sp);
    };

    const handleRowDoubleClick = (no_sp: any) => {
        // Async(no_sp);
        onSelectDataPO(no_sp);
        onClose();
        // alert(no_sp);
    };

    const filteredData = listDlgPO.reduce((result: any[], item: any) => {
        const existingItem = result.find((resultItem) => resultItem.no_sp === item.no_sp);

        if (!existingItem) {
            result.push(item);
        }

        return result;
    }, []);

    const filteredDatabyNoSP = listDlgPOUpdate.filter((item: any) => item.no_sp.toLowerCase().includes(searchTerm.toLowerCase()));

    // const filteredData = [...Array(20)].map((_, index) => `Supplier ${index + 1}`).filter((data) => data.toLowerCase().includes(searchTerm.toLowerCase()));

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
                            <Dialog.Panel className={`panel my-8 h-[75vh] w-[90vw] max-w-[1800px] rounded-lg border-0 p-0 text-black transition-all duration-300 ease-in-out dark:text-white-dark`}>
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
                                </table>

                                <DataTable
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
                                            render: ({ jumlah_mu }) => <div style={{ textAlign: 'center', cursor: 'pointer' }}>{jumlah_mu}</div>,
                                        },
                                        // Tambahkan kolom lain di sini sesuai kebutuhan Anda
                                    ]}
                                    records={filteredDatabyNoSP}
                                />
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
