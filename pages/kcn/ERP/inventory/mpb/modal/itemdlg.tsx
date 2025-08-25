import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

interface ItemDlgProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    userid: any;
    kode_entitas: any;
    searchtype: any;
    searchvalue: any;
}

const initialSortState = {
    field: '',
    order: 'asc',
};

// const ItemDlg: React.FC<ItemDlgProps> = ({ isOpen, onClose, onSelectData, userid, kode_entitas, searchtype, searchvalue }: ItemDlgProps) => {
const ItemDlg: React.FC<ItemDlgProps> = ({ isOpen = false, onClose, onSelectData, userid, kode_entitas, searchtype, searchvalue }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedkode_item, setSelectedkode_item] = useState<string>('');
    const [selectedno_item, setSelectedno_item] = useState<string>('');
    const [selectednama_item, setSelectednama_item] = useState<string>('');
    const [selectedsatuan, setSelectedsatuan] = useState<string>('');
    const [selectedberat, setSelectedberat] = useState('');
    const [selectedData, setSelectedData] = useState<string>('');

    const mounted = useRef(false);
    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [searchNama, setSearchNama] = useState('');
    const [searchNo, setSearchNo] = useState('');
    const [data, setData] = useState([]);

    const handleSelectData = (kode_item: string, no_item: string, nama_item: string, satuan: string, berat: any, index: number) => {
        setSelectedkode_item(kode_item);
        setSelectedno_item(no_item);
        setSelectednama_item(nama_item);
        setSelectedsatuan(satuan);
        setSelectedberat(berat);
        setSelectedRowIndex(index);
        setSelectedData(nama_item);
        onSelectData(kode_item, no_item, nama_item, satuan, berat, index);
    };

    // const handleSelectData = (kode_item: string, index: number) => {
    //     setSelectedData(kode_item);
    //     setSelectedRowIndex(index);
    // };
    const handleOKClick = () => {
        onSelectData(selectedkode_item, selectedno_item, selectednama_item, selectedsatuan, selectedberat);
        //onSelectData(selectedData);
        onClose();
    };

    // const DataBarang = data.map((item: any) => ({
    //     potongan_mu: item.potongan_mu,
    //     harga_akhir: item.harga_akhir ,
    //     kode_item: item.kode_item,
    //     no_item: item.no_item,
    //     harga1: item.harga1,
    //     harga2: item.harga2,
    //     harga3: item.harga3,
    //     harga4: item.harga4,
    //     harga5: item.harga5,
    //     berat: item.berat,
    //     nama_item: item.nama_item,
    //     satuan: item.satuan,
    //     satuan2: item.satuan2,
    //     satuan3: item.satuan3,
    //     std2: item.std2,
    //     konversi2: item.konversi2,
    //     std3: item.std3,
    //     konversi3: item.konversi3,
    //     tipe: item.tipe,
    //     grp: item.grp,
    //     kustom10: item.kustom10,
    //     status: item.status,
    //     margin: item.margin,
    //     ambil1: item.ambil1,
    //     ambil2: item.ambil2,
    //     min_qty: item.min_qty,
    //     pot_qty: item.pot_qty,
    //     potkg_qty: item.potkg_qty,
    //     min_qty2: item.minqty2,
    //     pot_qty2: item.potqty2,
    //     potkg_qty2: item.potkg_qty2,
    //     berlaku_ms: item.berlaku_ms,
    //     bunga: item.bunga,
    //     min_tunai: item.min_tunai,
    //     min_kredit: item.min_kredit,
    //     kustom2: item.kustom2,
    //     kustom3: item.kustom3,
    //     franco: item.franco,
    //     tempo_supp: item.tempo_supp,
    //     marginonly: item.margin_only,
    // }));
    // console.log(DataBarang,'xcbxcb');

    const handleSearch = (value: any) => {
        //  console.log(value,'bbbbbbbbb');
        // if (searchtype==='searchno_barang'){
        setSearchNo(value);

        // }
    };

    useEffect(() => {
        //  setSearchNo('');
        //    if (searchtype==='searchno_barang'){
        //  handleSearch(searchvalue);
        //      setSearchNo(searchvalue);
        //      alert(searchvalue)
        //   }
    }, [searchvalue, searchtype, searchNama, searchNo]);

    useEffect(() => {
        //  setSearchNo('');
        if (searchtype === 'searchno_barang') {
            handleSearch(searchvalue);
            //   alert(searchvalue)
        }

        // if (!mounted.current) {
        //     mounted.current = true;

        const fetchData = async () => {
            try {
                // console.log(searchNo, 'sssssssss');
                const response = await axios.get(`${apiUrl}/erp/list_barang?`, {
                    params: {
                        entitas: kode_entitas,
                        kode: searchNo,
                        nama: searchNama,
                        limit: '25',
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

        // } else {
        // }
    }, [kode_entitas, searchNama, searchNo, searchvalue, searchtype, apiUrl]);

    const tableStyle: React.CSSProperties = {
        border: '1px solid #dddddd',
        padding: '8px',
        textAlign: 'left',
        cursor: 'pointer',
        userSelect: 'none',
    };
    const [sort, setSort] = useState(initialSortState);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // console.log(searchvalue, 'sssssssss');
                const response = await axios.get(`${apiUrl}/erp/list_barang?`, {
                    params: {
                        entitas: kode_entitas,
                        kode: searchvalue,
                        nama: searchNama,
                        limit: '25',
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
    }, [apiUrl, kode_entitas, searchNama, searchvalue]);

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
                                            value={searchvalue}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        {''}
                                        <input
                                            type="text"
                                            placeholder="Cari Nama Barang"
                                            className="form-input mb-1 h-[3.5vh] w-[71.5%] ltr:ml-1"
                                            value={searchNama}
                                            onChange={(e) => setSearchNama(e.target.value)}
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
                                                                    onClick={() => handleSelectData(item.kode_item, item.no_item, item.nama_item, item.satuan, item.berat, index)}
                                                                    // onDoubleClick={handleOKClick}
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
