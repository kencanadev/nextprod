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
    // handleNamaSupp: any;
    // nilaiTotalId: any;
}

const SubledgerModal: React.FC<SupplierModalProps> = ({ isOpen = false, onClose, onSelectData, userid, kode_entitas }) => {
    type ListSupplier = {
        kode_subledger: string;
        no_subledger: string;
        nama_subledger: string;
        subledger: string;
        aktif: string;
        // kode_termin: string;
        // kode_pajak: string;
        // nilai_pajak: string;
        // kode_relasi: string;
    };

    const [recordListSupp, setRecordListSupp] = useState<ListSupplier[]>([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    // const [selectedData, setSelectedData] = useState<string>('');
    // const [selectedNamaTermin, setSelectedNamaTermin] = useState<string>('');
    // const [selectedKodeSupp, setSelectedKodeSupp] = useState<string>('');
    // const [searchTerm, setSearchTerm] = useState<string>('');

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let ent;
    if (kode_entitas === '99999') {
        ent = '999';
    } else {
        ent = kode_entitas;
    }

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const response = await axios.get(`${apiUrl}/erp/list_subledger`, {
                // list_subledger_by_kodeakun ubah ke sini dan modal baru
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
    }, [isOpen]);

    // const [selectedKodeTermin, setSelectedKodeTermin] = useState<string>('');
    // const [selectedKodePajak, setSelectedKodePajak] = useState<string>('');
    // const [selectedNilaiPajak, setSelectedNilaiPajak] = useState<string>('');

    // let dataObject: any;

    const [dataObject, setDataObject] = useState({});

    const handleSelectData = (
        selectedKode: string,
        selectedNoSubledger: string,
        selectedNamaSubledger: string,
        selectedSubledger: string,
        selectedAktif: string,
        // selectedKodePajak: string,
        // selectedNilaiPajak: string,
        // selectedKodeRelasi: string,
        index: number
    ) => {
        // setSelectedData(data);
        // setSelectedNamaTermin(nama_termin);
        // setSelectedKodeSupp(kode_supp);
        // setSelectedKodeTermin(kode_termin);
        // setSelectedKodePajak(kode_pajak);
        // setSelectedNilaiPajak(nilai_pajak);
        setSelectedRowIndex(index);

        // console.log('asdasdsadsdasdad');
        setDataObject({
            selectedKode,
            selectedNoSubledger,
            selectedNamaSubledger,
            selectedSubledger,
            selectedAktif,
            // selectedKodePajak,
            // selectedNilaiPajak,
            // selectedKodeRelasi,
        });
    };

    const handleOKClick = () => {
        onSelectData(dataObject);
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

    const handleSearchValueNama = (data: any) => {
        setSearchNamaSuppFocus(1);
        const searchValue = data;
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
            const filteredData = recordListSupp.filter((item) => item.nama_subledger.toLowerCase().startsWith(keyword.toLowerCase()));
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
        console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return recordListSupp;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = recordListSupp.filter((item) => item.no_subledger.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const [searchNamaSuppFocus, setSearchNamaSuppFocus] = useState(1);

    // useEffect(() => {
    //     console.log(handleNamaSupp, nilaiTotalId);
    //     handleSearchValueNama(handleNamaSupp);
    // }, [handleNamaSupp, nilaiTotalId]);

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
                                    <div className="text-lg font-bold">Daftar Subledger</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input type="text" id="noSuppInput" placeholder="No. Subledger.." onChange={handleSearchNoSupp} className="form-input h-[3.5vh] rtl:mr-4" />
                                        <input
                                            type="text"
                                            id="namaSuppInput"
                                            placeholder="Nama Subledger.."
                                            // defaultValue={handleNamaSupp}
                                            tabIndex={searchNamaSuppFocus}
                                            onChange={handleSearchNama}
                                            className="form-input h-[3.5vh] ltr:ml-4 rtl:mr-4"
                                        />
                                    </label>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ border: '0px', textAlign: 'center', background: '#dedede' }} className="w-[22%]">
                                                    No. Subledger
                                                </th>
                                                {/* <th style={{ border: '0px', textAlign: 'center', background: '#dedede' }} className="w-[10%]">
                                                    MU
                                                </th> */}
                                                <th style={{ border: '0px', textAlign: 'center', background: '#dedede' }} className="w-[68%]">
                                                    Nama Subledger
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
                                                                      item.kode_subledger,
                                                                      item.no_subledger,
                                                                      item.nama_subledger,
                                                                      item.subledger,
                                                                      item.aktif,
                                                                      //   item.kode_pajak,
                                                                      //   item.nilai_pajak,
                                                                      //   item.kode_relasi,
                                                                      index
                                                                  )
                                                              }
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              {/* <td className="w-[22%]">{item.kode_subledger}</td> */}
                                                              <td className="w-[20%]">{item.no_subledger}</td>
                                                              <td className="w-[58%]">{item.nama_subledger}</td>
                                                          </tr>
                                                      ))
                                                    : recordListSupp.map((item, index) => (
                                                          <tr
                                                              key={index}
                                                              className="hover:bg-gray-100"
                                                              style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                              onClick={() =>
                                                                  handleSelectData(
                                                                      item.kode_subledger,
                                                                      item.no_subledger,
                                                                      item.nama_subledger,
                                                                      item.subledger,
                                                                      item.aktif,
                                                                      //   item.kode_pajak,
                                                                      //   item.nilai_pajak,
                                                                      //   item.kode_relasi,
                                                                      index
                                                                  )
                                                              }
                                                              onDoubleClick={handleOKClick}
                                                          >
                                                              {/* <td className="w-[22%]">{item.kode_subledger}</td> */}
                                                              <td className="w-[20%]">{item.no_subledger}</td>
                                                              <td className="w-[58%]">{item.nama_subledger}</td>
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

export default SubledgerModal;
