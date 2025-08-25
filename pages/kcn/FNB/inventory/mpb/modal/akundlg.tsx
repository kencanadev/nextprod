import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useRef, createRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { isNull } from 'lodash';
import { cursorTo } from 'readline';

interface AkunDlgProps {
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
}

const initialSortState = {
    field: '',
    order: 'asc',
};

const AkunDlg: React.FC<AkunDlgProps> = ({ isOpen = false, onClose, userid, kode_entitas, searchtype, cariNo, cariNama, onSelectData, tipeValue }: AkunDlgProps) => {
    type ListAkun = {
            kode_akun: string;
            no_akun: string;
            nama_akun: string;
            header: string;
            aktif: string;
            tipe: string;
            normal: string;
            kurs : number;
            kurs_pajak: number;
            kode_mu: string;
            noakun: string;
            namaakun: string;
            isledger: string;
            balance: number;
    };
    
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedkode_akun, setSelectedkode_akun] = useState<string>('');
    const [selectedno_akun, setSelectedno_akun] = useState<string>('');
    const [selectednama_akun, setSelectednama_akun] = useState<string>('');
    const [selectedheader, setSelectedheader] = useState<string>('');
    const [selectedaktif, setSelectedaktif] = useState<string>('');
    const [selectedtipe, setSelectedtipe] = useState('');
    const [selectednormal, setSelectednormal] = useState('');
    const [selectednoakun, setSelectednoakun] = useState('');
    const [selectednamaakun, setSelectednamaakun] = useState('');
    const [selectedisledger, setSelectedisledger] = useState('');
    const [selectedbalance, setSelectedbalance] = useState(0);
    const [searchKeywordNoAkun, setSearchKeywordNoAkun] = useState<string>('');
    const [searchKeywordNamaAkun, setSearchKeywordNamaAkun] = useState<string>('');

    const mounted = useRef(false);
    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [searchNama, setSearchNama] = useState('');
    const [searchNo, setSearchNo] = useState('');
    //const [data, setData] = useState([]);
    // const [filteredData, setFilteredData] = useState<ListSupplier[]>([]);
    
    //const [data, setData] = useState<ListAkun[]>([]);
    const[filteredData, setFilteredData] = useState<ListAkun[]>([]);
    const [recordListAkun, setRecordListAkun] = useState<ListAkun[]>([]);

    

    const handleSelectData = (kode_akun: string, no_akun: string, nama_akun: string, header: string, aktif: any,tipe:any,normal:any,noakun:any,namaakun:any,isledger:any,balance:number, index: number) => {
        setSelectedkode_akun(kode_akun);
        setSelectedno_akun(no_akun);
        setSelectednama_akun(nama_akun);
        setSelectedheader(header);
        setSelectedaktif(aktif);
        setSelectedtipe(tipe);
        setSelectednormal(normal);
        setSelectednoakun(noakun);
        setSelectednamaakun(namaakun);
        setSelectedisledger(isledger);
        setSelectedbalance(balance);
        setSelectedRowIndex(index);  
    };

   

    const searchDataNo = (keyword: any) => {
        if (keyword === '') {
            return recordListAkun;
        } else 
        {
            const filteredData = recordListAkun.filter((item) => item.no_akun.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const searchDataNama = (keyword: any) => { 
        if (keyword === '') {
            return recordListAkun;
        } else 
        {
            const filteredData = recordListAkun.filter((item) => item.nama_akun.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const handleSearchNo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNoAkun(searchValue);
        const filteredData = searchDataNo(searchValue);
        setFilteredData(filteredData);
       

        const namaAkunInput = document.getElementById('namaAkunInput') as HTMLInputElement;

        if (namaAkunInput) {
            namaAkunInput.value = '';
        }
    };

    const handleSearchNama = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNamaAkun(searchValue);
        const filteredData = searchDataNama(searchValue);
        setFilteredData(filteredData);

        // Mendapatkan elemen input No. Supplier
        const noAkunInput = document.getElementById('noAkunInput') as HTMLInputElement;

        // Membersihkan nilai input No. Supplier
        if (noAkunInput) {
            noAkunInput.value = '';
        }
    };

    const handleOKClick = () => {
  
        const dataObject = {
            selectedkode_akun, property: 'data', selectedno_akun, selectednama_akun, selectedheader, selectedaktif,selectedtipe,selectednormal,selectednoakun,selectednamaakun,selectedisledger  
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

      
        const fetchData = async () => {
            try {
          
                const response = await axios.get(`${apiUrl}/erp/akun_jurnal`, {
                    params: {
                        entitas: kode_entitas,
             
                    },
                });

                const responseListAkun = response.data.data;
                 setRecordListAkun(responseListAkun);
            
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

     //   setSearchNo(cariNo);
     //   setSearchNama(cariNama);
  
    }, [cariNo, cariNama,kode_entitas,isOpen]);


    useEffect(() => {
       // handleSearchValueNo(cariNo);
 
        if (tipeValue==='tipeNoAkun'){
            handleSearchValueNo(cariNo);
        } 
     
    }, [cariNo,kode_entitas,tipeValue]);

    useEffect(() => {
        // handleSearchValueNo(cariNo);
       
         if (tipeValue==='tipeNamaAkun'){
             handleSearchValueNama(cariNama);
         } 
      
     }, [ cariNama,kode_entitas,tipeValue]);

    const handleSearchValueNo = (data: any) => {
        setSearchNoFocus(1);
        setSearchNamaFocus(2);
        const searchValue = data;

        setSearchKeywordNoAkun(searchValue) 
        const filteredData = searchDataNo(searchValue);
        setFilteredData(filteredData);

      //  Mendapatkan elemen input Nama. Supplier
        const namaAkunInput = document.getElementById('namaAkunInput') as HTMLInputElement;

        // Membersihkan nilai input Nama. Akun
        if (namaAkunInput) {
            namaAkunInput.value = '';
       }
    };

    const handleSearchValueNama = (data: any) => {
        setSearchNoFocus(2);
        setSearchNamaFocus(1);
        const searchValue = data;

        setSearchKeywordNamaAkun(searchValue) 
        const filteredData = searchDataNama(searchValue);
        setFilteredData(filteredData);

      //  Mendapatkan elemen input No. Supplier
        const noAkunInput = document.getElementById('noAkunInput') as HTMLInputElement;

        // Membersihkan nilai input No. Akun
        if (noAkunInput) {
            noAkunInput.value = '';
       }
    };



    return (
        <Transition appear show={isOpen} as={React.Fragment} >
            <Dialog as="div" open={isOpen} onClose={onClose} >
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
                                    <div className="text-lg font-bold">Daftar Akun</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3" style={{ background: '#dedede' }}>
                                    <label className=" flex cursor-pointer items-center">
                                        <input
                                            type="text"
                                            placeholder="Cari No. Akun"
                                            className="form-input mb-1  h-[3.5vh] w-[28.5%]"
                                            id="noAkunInput"
                                            defaultValue={cariNo}
                                            //defaultValue={searchNo}
                                            //onChange={(e) => handleNoInputChange(e.target.value)}
                                            onChange={handleSearchNo}
                                            tabIndex={searchNoFocus}   
                                          
                                        />
                                        {''}
                                        <input
                                            type="text"
                                            placeholder="Cari Nama Akun"
                                            className="form-input mb-1 h-[3.5vh] w-[71.5%] ltr:ml-1"
                                            id="namaAkunInput"
                                            defaultValue={cariNama}
                                         //   onChange={(e) => handleNamaInputChange(e.target.value)}
                                            onChange={handleSearchNama}
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
                                                                <th style={tableStyle}>No. Akun</th>
                                                                <th style={tableStyle}>Keterangan</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            { searchKeywordNoAkun !== '' || searchKeywordNamaAkun !== ''
                                                             ? filteredData.map((item: any, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="hover:bg-gray-100"
                                                                    style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() => handleSelectData(item.kode_akun, item.no_akun, item.nama_akun, item.header, item.aktif,item.tipe,
                                                                                    item.normal,item.noakun,item.namaakun,item.isledger,item.balance, index)}
                                                             
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>&nbsp;{item.noakun}</td>  
                                                                    <td style={tableStyle}>&nbsp;{item.namaakun}</td>
                                                                </tr>
                                                            ))
                                                            : recordListAkun.map((item, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className={`hover:bg-gray-100`}
                                                                    style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() => handleSelectData(item.kode_akun, item.no_akun, item.nama_akun, item.header, item.aktif,item.tipe,
                                                                                   item.normal,item.noakun,item.namaakun,item.isledger,item.balance, index)}
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>&nbsp;{item.noakun}</td>  
                                                                    <td style={tableStyle}>&nbsp;{item.namaakun}</td>
                                                                </tr>
                                                            ))
                                                            }
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

export default AkunDlg;
