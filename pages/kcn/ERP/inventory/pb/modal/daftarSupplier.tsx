import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface TerminBayarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    kode_entitas: any;
    // onSelectRelasi: any;
    routeJenisBarang: any;
    vRefreshData: any;
}

const TerminBayar: React.FC<TerminBayarProps> = ({ isOpen = false, onClose, onSelectData, kode_entitas, routeJenisBarang, vRefreshData }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<string>('');
    const [S_NamaRelasi, setNamaRelasi] = useState<string>('');
    const [S_KodeTermin, setKodeTermin] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTerm2, setSearchTerm2] = useState<string>('');
    const [listSupplier, setListSupplier] = useState([]);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const handleSelectData = (data: string, index: number, nama_relasi: string, kode_termin: any) => {
        setSelectedData(data);
        setSelectedRowIndex(index);
        setNamaRelasi(nama_relasi);
        setKodeTermin(kode_termin);
    };

    const handleOKClick = () => {
        onSelectData(selectedData, S_NamaRelasi, S_KodeTermin);
        onClose();
        setSearchTerm('');
        setSearchTerm2('');
    };

    console.log('routeJenisBarang = ', routeJenisBarang, vRefreshData);

    useEffect(() => {
        const Async = async () => {
            // const responseListSupplier = await axios.get(`${apiUrl}/erp/supplier_pb?`, {
            //     params: {
            //         entitas: kode_entitas,
            //     },
            // });

            const responseListSupplier = await axios.get(`${apiUrl}/erp/supplier_pb_filter?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeJenisBarang === 'nonPersediaan' ? 'E' : 'all',
                },
            });

            console.log(kode_entitas);

            const responseSupplier = responseListSupplier.data.data;
            setListSupplier(responseSupplier);
            console.log(responseSupplier);
        };
        Async();
    }, [vRefreshData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let responseListSupplier;
                if (searchTerm) {
                    responseListSupplier = await axios.get(`${apiUrl}/erp/supplier_pb`, {
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const filteredSuppliers = responseListSupplier.data.data.filter((supplier: any) => supplier.nama_relasi.toLowerCase().includes(searchTerm.toLowerCase()));
                    setListSupplier(filteredSuppliers);
                } else if (searchTerm2) {
                    responseListSupplier = await axios.get(`${apiUrl}/erp/supplier_pb`, {
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const filteredSuppliers = responseListSupplier.data.data.filter((supplier: any) => supplier.no_supp.toLowerCase().includes(searchTerm2.toLowerCase()));
                    setListSupplier(filteredSuppliers);
                } else {
                    responseListSupplier = await axios.get(`${apiUrl}/erp/supplier_pb`, {
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const suppliers = responseListSupplier.data.data;
                    setListSupplier(suppliers);
                }
            } catch (error) {
                console.error('Error fetching data from API:', error);
            }
        };

        fetchData();
    }, [searchTerm, searchTerm2, kode_entitas]);

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
                            <Dialog.Panel
                                className="panel my-8 flex w-full max-w-4xl flex-col rounded-lg border-0 p-0 text-black dark:text-white-dark"
                                style={{ minHeight: 700, height: 'auto', minWidth: 600 }}
                            >
                                <div style={{ borderRadius: 10 }} className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Supplier</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive flex-grow whitespace-nowrap p-3">
                                    <div className="flex">
                                        <label className="flex cursor-pointer items-center">
                                            <input type="text" placeholder="No. Supplier" className="form-input mb-1 h-[3.5vh]" value={searchTerm2} onChange={(e) => setSearchTerm2(e.target.value)} />
                                        </label>
                                        <label className="flex cursor-pointer items-center" style={{ marginLeft: 10 }}>
                                            <input type="text" placeholder="Nama Supplier" className="form-input mb-1 h-[3.5vh]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </label>
                                    </div>

                                    <div className="datatables overflow-y-auto" style={{ maxHeight: '55vh' }}>
                                        <table>
                                            <tbody>
                                                {listSupplier.map((data: any, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`cursor-pointer hover:bg-gray-100`}
                                                        style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                        onClick={() => handleSelectData(data.kode_supp, index, data.nama_relasi, data.kode_termin)}
                                                        onDoubleClick={handleOKClick}
                                                    >
                                                        <td>{data.no_supp}</td>
                                                        <td>{data.kode_mu}</td>
                                                        <td>{data.nama_relasi}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="mr-3 flex items-center justify-end space-x-4">
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

export default TerminBayar;
