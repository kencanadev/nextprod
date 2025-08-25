import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';

interface PoGrupProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    userid: string;
    kode_entitas: string;
    handleKodeGrup: any;
    nilaiTotalId: any;
}

const PoGrup: React.FC<PoGrupProps> = ({ isOpen = false, onClose, onSelectData, userid, kode_entitas, handleKodeGrup, nilaiTotalId }) => {
    type ListPoGrup = {
        kodegrup: string;
    };

    const [recordListPoGrup, setRecordListGrup] = useState<ListPoGrup[]>([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedData, setSelectedData] = useState<string>('');

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let ent;
    if (kode_entitas === '99999') {
        ent = '999';
    } else {
        ent = kode_entitas;
    }

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const response = await axios.get(`${apiUrl}/erp/m_group`, {
                params: {
                    entitas: kode_entitas,
                },
            });

            const responseListGrup = response.data.data;
            setRecordListGrup(responseListGrup);
        };
        fetchDataUseEffect();
        setSearchKeywordPoGrup('');
    }, [isOpen]);

    const handleSelectData = (kodegrup: string, index: number) => {
        setSelectedData(kodegrup);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        onSelectData(selectedData);
        onClose();
    };

    const [searchKeywordPoGrup, setSearchKeywordPoGrup] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ListPoGrup[]>([]);

    const handleSearchPoGrup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordPoGrup(searchValue);
        const filteredData = searchDataPoGrup(searchValue);
        setFilteredData(filteredData);
    };

    const handleSearchValuePoGrup = (data: any) => {
        setSearchKodeGrupFocus(1);
        const searchValue = data;
        setSearchKeywordPoGrup(searchValue);
        const filteredData = searchDataPoGrup(searchValue);
        setFilteredData(filteredData);
    };

    const searchDataPoGrup = (keyword: any) => {
        if (keyword === '') {
            return recordListPoGrup;
        } else {
            const filteredData = recordListPoGrup.filter((item) => item.kodegrup.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const [searchKodeGrupFocus, setSearchKodeGrupFocus] = useState(1);

    useEffect(() => {
        console.log(handleKodeGrup, nilaiTotalId);
        handleSearchValuePoGrup(handleKodeGrup);
    }, [handleKodeGrup, nilaiTotalId]);

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
                            <Dialog.Panel className={`panel my-8 w-[35vh] rounded-lg border-0 p-0 text-black dark:text-white-dark`} style={{ minHeight: 250, height: 'auto', minWidth: 50 }}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">PO Grup</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input
                                            type="text"
                                            placeholder="Kode Grup.."
                                            defaultValue={handleKodeGrup}
                                            tabIndex={searchKodeGrupFocus}
                                            onChange={handleSearchPoGrup}
                                            className="form-input mb-1 h-[3.5vh]"
                                        />
                                    </label>

                                    <div className="datatables overflow-y-auto" style={{ height: '15vh' }}>
                                        <table>
                                            <tbody>
                                                {searchKeywordPoGrup !== ''
                                                    ? filteredData.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className={`hover:bg-gray-100`}
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() => handleSelectData(item.kodegrup, index)}
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td>{item.kodegrup}</td>
                                                          </tr>
                                                      ))
                                                    : recordListPoGrup.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className={`hover:bg-gray-100`}
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() => handleSelectData(item.kodegrup, index)}
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td>{item.kodegrup}</td>
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

export default PoGrup;
