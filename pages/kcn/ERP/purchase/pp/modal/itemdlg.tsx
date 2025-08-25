import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useRef, createRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { isNull } from 'lodash';
import { cursorTo } from 'readline';

interface ItemDlgProps {
    isOpen: boolean;
    onClose: () => void;
    userid: any;
    kode_entitas: any;
    searchtype: any;
    cariNo: any;
    cariNama: any;
    onSelectData: any;
    // nilaiTotalId: any;
    tipeValue: any;
    jenisFilterBarang: any;
    vRefreshData: any;
}

const initialSortState = {
    field: '',
    order: 'asc',
};

const ItemDlg: React.FC<ItemDlgProps> = ({ isOpen = false, onClose, userid, kode_entitas, searchtype, cariNo, cariNama, onSelectData, tipeValue, jenisFilterBarang, vRefreshData }: ItemDlgProps) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedkode_item, setSelectedkode_item] = useState<string>('');
    const [selectedno_item, setSelectedno_item] = useState<string>('');
    const [selectednama_item, setSelectednama_item] = useState<string>('');
    const [selectedsatuan, setSelectedsatuan] = useState<string>('');
    const [selectedberat, setSelectedberat] = useState('');
    const [selectedfpp_diameter, setSelectedfpp_diameter] = useState('');
    const [selectedfpp_kg, setSelectedfpp_kg] = useState('');
    const [selectedpanjang, setSelectedpanjang] = useState('');

    const mounted = useRef(false);
    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [searchNama, setSearchNama] = useState('');
    const [searchNo, setSearchNo] = useState('');
    const [data, setData] = useState([]);

    const handleSelectData = (kode_item: string, no_item: string, nama_item: string, satuan: string, berat: any, fpp_diameter: any, fpp_kg: any, panjang: any, index: number) => {
        setSelectedkode_item(kode_item);
        setSelectedno_item(no_item);
        setSelectednama_item(nama_item);
        setSelectedsatuan(satuan);
        setSelectedberat(berat);
        setSelectedfpp_diameter(fpp_diameter);
        setSelectedfpp_kg(fpp_kg);
        setSelectedpanjang(panjang);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        const dataObject = {
            selectedkode_item,
            property: 'data',
            selectedno_item,
            selectednama_item,
            selectedsatuan,
            selectedberat,
            selectedfpp_diameter,
            selectedfpp_kg,
            selectedpanjang,
        };
        onSelectData(dataObject);
        onClose();
    };

    const tableStyle: React.CSSProperties = {
        border: '1px solid #dddddd',
        padding: '8px',
        textAlign: 'left',
        cursor: 'pointer',
        userSelect: 'none',
    };
    const [sort, setSort] = useState(initialSortState);

    const [searchNoFocus, setSearchNoFocus] = useState(1);
    const [searchNamaFocus, setSearchNamaFocus] = useState(1);

    useEffect(() => {
        if (tipeValue === 'tipeNoItem') {
            setSearchNoFocus(1);
            setSearchNamaFocus(2);

            const fetchData = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_barang_filter?`, {
                        params: {
                            entitas: kode_entitas,
                            kode: cariNo,
                            nama: cariNama,
                            limit: '25',
                            tipe: jenisFilterBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                        },
                    });
                    const result = response.data;
                    if (result.status) {
                        setData(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
            //  } else {};
        } else if (tipeValue === 'tipeNamaItem') {
            setSearchNoFocus(2);
            setSearchNamaFocus(1);

            const fetchData = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_barang_filter?`, {
                        params: {
                            entitas: kode_entitas,
                            kode: cariNo,
                            nama: cariNama,
                            limit: '25',
                            tipe: jenisFilterBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                        },
                    });
                    const result = response.data;
                    if (result.status) {
                        setData(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
            //  } else {};
        }
    }, [cariNo, cariNama]); //nilaiTotalId

    useEffect(() => {
        //   if (!mounted.current) {
        //       mounted.current = true;
        setSearchNo(cariNo);
        setSearchNama(cariNama);

        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/list_barang_filter?`, {
                    params: {
                        entitas: kode_entitas,
                        kode: cariNo,
                        nama: cariNama,
                        limit: '25',
                        tipe: jenisFilterBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                    },
                });
                const result = response.data;
                if (result.status) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
        //  } else {};
    }, [vRefreshData]);

    const handleNoInputChange = (value: any) => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/list_barang_filter?`, {
                    params: {
                        entitas: kode_entitas,
                        kode: value,
                        nama: searchNama,
                        limit: '25',
                        tipe: jenisFilterBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                    },
                });
                const result = response.data;

                if (result.status) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    };

    const handleNamaInputChange = (value: any) => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/list_barang_filter?`, {
                    params: {
                        entitas: kode_entitas,
                        kode: searchNo,
                        nama: value,
                        limit: '25',
                        tipe: jenisFilterBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                    },
                });
                const result = response.data;

                if (result.status) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    };

    const handleHungkul = () => {};

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
                            <Dialog.Panel className="panel my-8 h-[80vh] w-[80vh] rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="flex items-center justify-between bg-[#dedede] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Barang</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3" style={{ background: '#dedede' }}>
                                    <label className=" flex cursor-pointer items-center">
                                        <input
                                            type="text"
                                            placeholder="Cari No. Barang"
                                            className="form-input mb-1  h-[3.5vh] w-[28.5%]"
                                            defaultValue={cariNo}
                                            onChange={(e) => handleNoInputChange(e.target.value)}
                                            tabIndex={searchNoFocus}
                                        />
                                        {''}
                                        <input
                                            type="text"
                                            placeholder="Cari Nama Barang"
                                            className="form-input mb-1 h-[3.5vh] w-[71.5%] ltr:ml-1"
                                            defaultValue={cariNama}
                                            onChange={(e) => handleNamaInputChange(e.target.value)}
                                            tabIndex={searchNamaFocus}
                                        />
                                        {''}
                                    </label>
                                    <label className=" flex cursor-pointer items-center"></label>
                                    <div className="datatables overflow-y-auto" style={{ maxHeight: '56vh' }}>
                                        <table>
                                            <tbody>
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th style={tableStyle}>No. Barang</th>
                                                                <th style={tableStyle}>Nama Barang</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {data.map((item: any, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="hover:bg-gray-100"
                                                                    style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() =>
                                                                        handleSelectData(
                                                                            item.kode_item,
                                                                            item.no_item,
                                                                            item.nama_item,
                                                                            item.satuan,
                                                                            item.berat,
                                                                            item.diameter,
                                                                            item.fpp_kg,
                                                                            item.panjang,
                                                                            index
                                                                        )
                                                                    }
                                                                    // onClick={handleHungkul}
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>{item.no_item}</td>
                                                                    <td style={tableStyle}>{item.nama_item}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mr-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4"></div>

                                    <div className="mb-3 mt-3 flex space-x-4">
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

export default ItemDlg;
