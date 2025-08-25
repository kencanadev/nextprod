import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    userid: any;
    kode_entitas: any;
    onSelectData: any;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen = false, onClose, onSelectData, userid, kode_entitas }) => {
    type ListSupplier = {
        kode_supp: string;
        kode_mu: string;
        no_supp: string;
        nama_relasi: string;
        nama_termin: string;
        kode_akun_pajakbeli: string;
        no_pajakbeli: string;
        nama_pajakbeli: string;
        tipe_pajakbeli: string;
    };

    const [recordListSupp, setRecordListSupp] = useState<ListSupplier[]>([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<string>('');
    const [selectedNamaTermin, setSelectedNamaTermin] = useState<string>('');
    const [selectedKodeSupp, setSelectedKodeSupp] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedNoSupp, setSelectedNoSupp] = useState<string>('');
    const [selectedNamaSupp, setSelectedNamaSupp] = useState<string>('');
    const [mKodeAkunPajakbeli, mSetKodeAkunPajakBeli] = useState('');
    const [mNoPajakbeli, mSetNoPajakBeli] = useState('');
    const [mNamaPajakbeli, mSetNamaPajakBeli] = useState('');
    const [mTipePajakbeli, mSetTipePajakBeli] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let ent;
    if (kode_entitas === '99999') {
        ent = '999';
    } else {
        ent = kode_entitas;
    }

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const response = await axios.get(`${apiUrl}/erp/list_supplierMpb?`, {
                params: {
                    entitas: kode_entitas,
                },
            });

            const responseListSupp = response.data.data;
            setRecordListSupp(responseListSupp);
        };
        fetchDataUseEffect();
        setSearchKeywordNama('');
        setSearchKeywordNoSupp('');
        // alert(searchKeywordNoSupp);
        // alert(searchKeywordNama);
        // showLoading();
    }, [apiUrl, isOpen, kode_entitas]);

    // console.log(setRecordListSupp);

    const handleSelectData = (
        nama_relasi: string,
        nama_termin: string,
        kode_supp: string,
        no_supp: string,
        kode_akun_pajakbeli: string,
        no_pajakbeli: string,
        nama_pajakbeli: string,
        tipe_pajakbeli: string,
        index: number
        // kodeindex: number
    ) => {
        setSelectedData(nama_relasi);
        setSelectedNamaSupp(nama_relasi);
        setSelectedNamaTermin(nama_termin);
        setSelectedKodeSupp(kode_supp);
        setSelectedNoSupp(no_supp);
        setSelectedRowIndex(index);
        mSetKodeAkunPajakBeli(kode_akun_pajakbeli);
        mSetNoPajakBeli(no_pajakbeli);
        mSetNamaPajakBeli(nama_pajakbeli);
        mSetTipePajakBeli(tipe_pajakbeli);
    };

    const handleOKClick = () => {
        onSelectData(selectedData, selectedNoSupp, selectedKodeSupp, selectedNamaSupp, mKodeAkunPajakbeli, mNoPajakbeli, mNamaPajakbeli, mTipePajakbeli);
        onClose();
    };

    const [searchKeywordNoSupp, setSearchKeywordNoSupp] = useState<string>('');
    const [searchKeywordNama, setSearchKeywordNama] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ListSupplier[]>([]);

    const handleSearchNama = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNama(searchValue);
        const filteredData = searchDataNama(searchValue);
        setFilteredData(filteredData);

        // Mendapatkan elemen input No. Supplier
        const noSuppInput = document.getElementById('noSuppInput') as HTMLInputElement;

        // Membersihkan nilai input No. Supplier
        if (noSuppInput) {
            noSuppInput.value = '';
        }
    };

    const searchDataNama = (keyword: any) => {
        if (keyword === '') {
            return recordListSupp;
        } else {
            const filteredData = recordListSupp.filter((item) => item.nama_relasi.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const handleSearchNoSupp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNoSupp(searchValue);
        const filteredData = searchDataNoSupp(searchValue);
        setFilteredData(filteredData);

        const namaSuppInput = document.getElementById('namaSuppInput') as HTMLInputElement;

        if (namaSuppInput) {
            namaSuppInput.value = '';
        }
    };

    const searchDataNoSupp = (keyword: any) => {
        // console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return recordListSupp;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = recordListSupp.filter((item) => item.no_supp.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
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
                            <Dialog.Panel className="panel my-8 w-full max-w-4xl rounded-lg border-0 p-0 text-black dark:text-white-dark" style={{ minHeight: 700, height: 'auto', minWidth: 600 }}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Supplier</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input type="text" id="noSuppInput" placeholder="No. Supplier.." onChange={handleSearchNoSupp} className="form-input h-[3.5vh] rtl:mr-4" />
                                        <input type="text" id="namaSuppInput" placeholder="Nama.." onChange={handleSearchNama} className="form-input h-[3.5vh] ltr:ml-4 rtl:mr-4" />
                                    </label>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ border: '0px', textAlign: 'center', background: '#dedede' }} className="w-[22%]">
                                                    No Supplier
                                                </th>
                                                <th style={{ border: '0px', textAlign: 'center', background: '#dedede' }} className="w-[10%]">
                                                    MU
                                                </th>
                                                <th style={{ border: '0px', textAlign: 'center', background: '#dedede' }} className="w-[68%]">
                                                    Nama
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div className="datatables overflow-y-auto" style={{ height: '62vh' }}>
                                        <table>
                                            <tbody>
                                                {searchKeywordNoSupp !== '' || searchKeywordNama !== ''
                                                    ? filteredData.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className="hover:bg-gray-100"
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() =>
                                                                  handleSelectData(
                                                                      item.nama_relasi,
                                                                      item.nama_termin,
                                                                      item.kode_supp,
                                                                      item.no_supp,
                                                                      item.kode_akun_pajakbeli,
                                                                      item.no_pajakbeli,
                                                                      item.nama_pajakbeli,
                                                                      item.tipe_pajakbeli,
                                                                      index
                                                                  )
                                                              }
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td className="w-[22%]">{item.no_supp}</td>
                                                              <td className="w-[20%]">{item.kode_mu}</td>
                                                              <td className="w-[58%]">{item.nama_relasi}</td>
                                                          </tr>
                                                      ))
                                                    : recordListSupp.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className="hover:bg-gray-100"
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() =>
                                                                  handleSelectData(
                                                                      item.nama_relasi,
                                                                      item.nama_termin,
                                                                      item.kode_supp,
                                                                      item.no_supp,
                                                                      item.kode_akun_pajakbeli,
                                                                      item.no_pajakbeli,
                                                                      item.nama_pajakbeli,
                                                                      item.tipe_pajakbeli,
                                                                      index
                                                                  )
                                                              }
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              <td className="w-[22%]">{item.no_supp}</td>
                                                              <td className="w-[20%]">{item.kode_mu}</td>
                                                              <td className="w-[58%]">{item.nama_relasi}</td>
                                                          </tr>
                                                      ))}

                                                {/* {recordListSupp.map((item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-100"
                                                        style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                        onClick={() => handleSelectData(item.nama_relasi, item.nama_termin, item.kode_supp, index)}
                                                    >
                                                        <td className="w-[22%]">{item.no_supp}</td>
                                                        <td className="w-[20%]">{item.kode_mu}</td>
                                                        <td className="w-[58%]">{item.nama_relasi}</td>
                                                    </tr>
                                                ))} */}
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

export default SupplierModal;
