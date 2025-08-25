import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';

interface TerminBayarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    userid: string;
    kode_entitas: string;
    handleNamaTermin: any;
    nilaiTotalId: any;
}

const TerminBayar: React.FC<TerminBayarProps> = ({ isOpen = false, onClose, onSelectData, userid, kode_entitas, handleNamaTermin, nilaiTotalId }) => {
    type ListTermin = {
        kode_termin: string;
        nama_termin: string;
        tempo: string;
    };

    const [recordListTermin, setRecordListTermin] = useState<ListTermin[]>([]);

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<string>('');
    const [selectedNamaTermin, setSelectedNamaTermin] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let ent;
    if (kode_entitas === '99999') {
        ent = '999';
    } else {
        ent = kode_entitas;
    }

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const response = await axios.get(`${apiUrl}/erp/m_termin`, {
                params: {
                    entitas: kode_entitas,
                },
            });

            const responseListTermin = response.data.data;
            setRecordListTermin(responseListTermin);
        };
        fetchDataUseEffect();
        setSearchKeywordNamaTermin('');
    }, [isOpen]);

    const handleSelectData = (data: string, nama_termin: string, index: number) => {
        setSelectedData(data);
        setSelectedNamaTermin(nama_termin);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        onSelectData(selectedData, selectedNamaTermin);
        onClose();
    };

    const [searchKeywordNamaTermin, setSearchKeywordNamaTermin] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ListTermin[]>([]);

    const handleSearchNamaTermin = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNamaTermin(searchValue);
        const filteredData = searchDataNamaTermin(searchValue);
        setFilteredData(filteredData);
    };

    const handleSearchValueNamaTermin = (data: any) => {
        setSearchNamaTerminFocus(1);
        const searchValue = data;
        setSearchKeywordNamaTermin(searchValue);
        const filteredData = searchDataNamaTermin(searchValue);
        setFilteredData(filteredData);
    };

    const searchDataNamaTermin = (keyword: any) => {
        if (keyword === '') {
            return recordListTermin;
        } else {
            const filteredData = recordListTermin.filter((item) => item.nama_termin.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const [searchNamaTerminFocus, setSearchNamaTerminFocus] = useState(1);

    useEffect(() => {
        console.log(handleNamaTermin, nilaiTotalId);
        handleSearchValueNamaTermin(handleNamaTermin);
    }, [handleNamaTermin, nilaiTotalId]);

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
                            <Dialog.Panel className={`panel my-8 w-[35vh] rounded-lg border-0 p-0 text-black dark:text-white-dark`} style={{ minHeight: 360, height: 'auto', minWidth: 150 }}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Termin</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input
                                            type="text"
                                            placeholder="Nama Termin.."
                                            defaultValue={handleNamaTermin}
                                            tabIndex={searchNamaTerminFocus}
                                            onChange={handleSearchNamaTermin}
                                            className="form-input mb-1 h-[3.5vh]"
                                        />
                                    </label>

                                    <div className="datatables overflow-y-auto" style={{ height: '25vh' }}>
                                        <table>
                                            <tbody>
                                                {searchKeywordNamaTermin !== ''
                                                    ? filteredData.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className={`hover:bg-gray-100`}
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() => handleSelectData(item.kode_termin, item.nama_termin, index)}
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td>{item.nama_termin}</td>
                                                          </tr>
                                                      ))
                                                    : recordListTermin.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className={`hover:bg-gray-100`}
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() => handleSelectData(item.kode_termin, item.nama_termin, index)}
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td>{item.nama_termin}</td>
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

export default TerminBayar;
