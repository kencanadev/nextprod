import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';

interface PpnAtasNamaProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    userid: string;
    kode_entitas: string;
    handlePpnAtasNama: any;
    nilaiTotalId: any;
}

const PpnAtasNama: React.FC<PpnAtasNamaProps> = ({ isOpen = false, onClose, onSelectData, userid, kode_entitas, handlePpnAtasNama, nilaiTotalId }) => {
    type ListPpnAtasNama = {
        kodecabang: string;
        nama_cabang: string;
    };

    const [recordListPpnAtasNama, setRecordListPpnAtasNama] = useState<ListPpnAtasNama[]>([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedData, setSelectedData] = useState<string>('');
    const [selectedNamaCabang, setSelectedNamaCabang] = useState<string>('');

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let ent;
    if (kode_entitas === '99999') {
        ent = '999';
    } else {
        ent = kode_entitas;
    }

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const response = await axios.get(`${apiUrl}/erp/m_ppn_atas_nama`, {
                params: {
                    entitas: kode_entitas,
                },
            });

            const responseListGrup = response.data.data;
            setRecordListPpnAtasNama(responseListGrup);
        };
        fetchDataUseEffect();
        setSearchKeywordPpnAtasNama('');
    }, [isOpen]);

    const handleSelectData = (kodecabang: string, nama_cabang: string, index: number) => {
        setSelectedData(kodecabang);
        setSelectedNamaCabang(nama_cabang);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        onSelectData(selectedData, selectedNamaCabang);
        onClose();
    };

    const [searchKeywordPpnAtasNama, setSearchKeywordPpnAtasNama] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ListPpnAtasNama[]>([]);

    const handleSearchPpnAtasNama = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordPpnAtasNama(searchValue);
        const filteredData = searchDataPpnAtasNama(searchValue);
        setFilteredData(filteredData);
    };

    const handleSearchValuePpnAtasNama = (data: any) => {
        setSearchPpnAtasNamaFocus(1);
        const searchValue = data;
        setSearchKeywordPpnAtasNama(searchValue);
        const filteredData = searchDataPpnAtasNama(searchValue);
        setFilteredData(filteredData);
    };

    const searchDataPpnAtasNama = (keyword: any) => {
        if (keyword === '') {
            return recordListPpnAtasNama;
        } else {
            const filteredData = recordListPpnAtasNama.filter((item) => item.nama_cabang.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const [searchPpnAtasNamaFocus, setSearchPpnAtasNamaFocus] = useState(1);

    useEffect(() => {
        console.log(handlePpnAtasNama, nilaiTotalId);
        handleSearchValuePpnAtasNama(handlePpnAtasNama);
    }, [handlePpnAtasNama, nilaiTotalId]);

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
                            <Dialog.Panel className={`panel my-8 w-[35vh] rounded-lg border-0 p-0 text-black dark:text-white-dark`} style={{ minHeight: 300, height: 'auto', minWidth: 400 }}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">PPN Atas Nama</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input
                                            type="text"
                                            placeholder="Nama Cabang.."
                                            defaultValue={handlePpnAtasNama}
                                            tabIndex={searchPpnAtasNamaFocus}
                                            onChange={handleSearchPpnAtasNama}
                                            className="form-input mb-1 h-[3.5vh]"
                                        />
                                    </label>

                                    <div className="datatables overflow-y-auto" style={{ height: '25vh' }}>
                                        <table>
                                            <tbody>
                                                {searchKeywordPpnAtasNama !== ''
                                                    ? filteredData.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className={`hover:bg-gray-100`}
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() => handleSelectData(item.kodecabang, item.nama_cabang, index)}
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td className="w-[80%]">{item.nama_cabang}</td>
                                                              <td className="w-[20%]">{item.kodecabang}</td>
                                                          </tr>
                                                      ))
                                                    : recordListPpnAtasNama.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className={`hover:bg-gray-100`}
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() => handleSelectData(item.kodecabang, item.nama_cabang, index)}
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td className="w-[80%]">{item.nama_cabang}</td>
                                                              <td className="w-[20%]">{item.kodecabang}</td>
                                                          </tr>
                                                      ))}
                                            </tbody>
                                        </table>
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

export default PpnAtasNama;
