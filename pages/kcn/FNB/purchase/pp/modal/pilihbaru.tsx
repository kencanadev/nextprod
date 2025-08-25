import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import swal from 'sweetalert2';
import { showLoading } from '@/utils/routines';

interface PilihBaruProps {
    isOpen: boolean;
    onClose: () => void;
    date1: any;
    date2: any;
    tipeDokumen: any;
    onSelectData: any;
}

const PilihBaru: React.FC<PilihBaruProps> = ({ isOpen = false, onClose, date1, date2, tipeDokumen, onSelectData }) => {
    const router = useRouter();

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSelectData = (data: string, index: number) => {
        setSelectedData(data);
        setSelectedRowIndex(index);
    };

    const handleOKClick = () => {
        onSelectData(selectedData);
        onClose();
    };

    //handle button click

    const handleBuBarangProduksiClick = (id: any) => {
        router.push({ pathname: '/kcn/ERP/purchase/pp/spp', query: { kode_pp: 'BARU', name: 'produksi', tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` } });
    };

    const handleBuBarangJadiClick = (tipe: any) => {
        router.push({ pathname: '/kcn/ERP/purchase/pp/spp', query: { kode_pp: 'BARU', name: tipe, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` } });
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
                            <Dialog.Panel className={`panel my-8 w-[35vh] rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Jenis Barang</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className="datatables overflow-y-auto" style={{ maxHeight: '30vh' }}>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button type="submit" className="btn bg-[#3a3f5c] text-white" style={{ width: '210px' }} onClick={handleBuBarangProduksiClick}>
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            1. Barang Produksi
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button type="submit" className="btn bg-[#3a3f5c] text-white" style={{ width: '210px' }} onClick={() => handleBuBarangJadiClick('barangjadi')}>
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            2. Barang Jadi
                                                        </button>
                                                    </td>
                                                </tr>
                                                <br></br>
                                                <tr>
                                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button
                                                            type="submit"
                                                            className="btn bg-[#3a3f5c] text-white"
                                                            style={{ width: '210px' }}
                                                            onClick={() => handleBuBarangJadiClick('nonPersediaan')}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            3. Barang Non Persediaan
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mr-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4"></div>

                                    <div className="mb-3 flex space-x-4">
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

export default PilihBaru;
