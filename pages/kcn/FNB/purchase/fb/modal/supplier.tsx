import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { getEncodedParams } from '@/utils/routines';

interface SupplierProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    kode_entitas: any;
}

const initialSortState = {
    field: '',
    order: 'asc',
};

const Supplier: React.FC<SupplierProps> = ({ isOpen = false, onClose, onSelectData, kode_entitas }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [terminSelected, setTerminSelected] = useState<string>('');
    const [namaRelasiSelected, setNamaRelasiSelected] = useState<string>('');
    const [noSupplierSelected, setNoSupplierSelected] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSelectData = (termin: string, relasi: string, no_supp: any, index: number) => {
        setTerminSelected(termin);
        setNamaRelasiSelected(relasi);
        setNoSupplierSelected(no_supp);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        onSelectData(terminSelected, namaRelasiSelected, noSupplierSelected);
        onClose();
    };

    const [apiResponse, setApiResponse] = useState({
        status: false,
        message: '',
        data: [],
    });

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jsonParams = {
                    entitas: kode_entitas,
                    where: '',
                };
                const encodedParams = getEncodedParams(jsonParams);
                const response = await axios.get(`${apiUrl}/erp/supplier_fb?`, {
                    params: {
                        cmd: encodedParams,
                    },
                });
                setApiResponse(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const detailFB = apiResponse.data.map((item: any) => ({
        no_supp: item.no_supp,
        kode_mu: item.kode_mu,
        nama_relasi: item.nama_relasi,
        nama_termin: item.nama_termin,
        kode_supp: item.kode_supp,
    }));
    const filteredData = detailFB.filter((data) => data.no_supp.toLowerCase().includes(searchTerm.toLowerCase()));

    const commonTableStyle: React.CSSProperties = {
        border: '1px solid #dddddd',
        padding: '8px',
        textAlign: 'left',
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
    };

    const [sort, setSort] = useState(initialSortState);

    const handleSort = (field: string) => {
        setSort((prevSort) => ({
            field,
            order: prevSort.field === field && prevSort.order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedData = [...filteredData].sort((a, b) => {
        const compareValue = (a: any, b: any) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        };

        const sortOrder = sort.order === 'asc' ? 1 : -1;

        switch (sort.field) {
            case 'no_supp':
                return compareValue(a.no_supp, b.no_supp) * sortOrder;
            case 'kode_mu':
                return compareValue(a.kode_mu, b.kode_mu) * sortOrder;
            case 'nama_relasi':
                return compareValue(a.nama_relasi, b.nama_relasi) * sortOrder;
            default:
                return 0;
        }
    });

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
                            <Dialog.Panel className={`panel my-8 w-[60vh] rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Supplier</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input
                                            type="text"
                                            placeholder="Masukkan no. Supplier..."
                                            style={{ borderColor: 'rgb(94, 98, 98)' }}
                                            className="form-input mb-1 h-[3.5vh]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </label>

                                    <div className="overflow-y-auto" style={{ maxHeight: '25vh' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th style={tableStyleHeader} onClick={() => handleSort('no_supp')}>
                                                        No Supplier {sort.field === 'no_supp' && (sort.order === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th style={tableStyleHeader} onClick={() => handleSort('kode_mu')}>
                                                        MU {sort.field === 'kode_mu' && (sort.order === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th style={tableStyleHeader} onClick={() => handleSort('nama_relasi')}>
                                                        Nama Relasi {sort.field === 'nama_relasi' && (sort.order === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ cursor: 'pointer' }}>
                                                {sortedData.map((item: any, index: any) => (
                                                    <tr
                                                        key={index}
                                                        className={`hover:bg-gray-100`}
                                                        style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                        onClick={() => handleSelectData(item.nama_relasi, item.nama_termin, item.kode_supp, index)}
                                                        onDoubleClick={handleOKClick}
                                                    >
                                                        <td style={tableStyle}>{item.no_supp}</td>
                                                        <td style={tableStyle}>{item.kode_mu}</td>
                                                        <td style={tableStyle}>{item.nama_relasi}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

export default Supplier;
