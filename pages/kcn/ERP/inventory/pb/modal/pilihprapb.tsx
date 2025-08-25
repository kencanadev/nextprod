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
    onSelectData: any;
}

const PilihBaru: React.FC<PilihBaruProps> = ({ isOpen = false, onClose, onSelectData }) => {
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

    const handlePraPBShow = (id: any) => {
        router.push({ pathname: '/kcn/ERP/inventory/pb/pblist' });
        onClose();
    };

    const handlePraPBHide = (id: any) => {
        router.push({ pathname: '/kcn/ERP/inventory/pb/pblist' });
        onClose();
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
                                    <div className="text-lg font-bold">Apakah menggunakan pra PB</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className="datatables overflow-y-hidden" style={{ maxHeight: '30vh' }}>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <button
                                                            style={{
                                                                backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                                                                color: 'white',
                                                                borderColor: '#e6e6e6',
                                                                fontWeight: 'bold',
                                                                boxShadow: 'none',
                                                                width: '130px',
                                                            }}
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            // style={{ width: '130px' }}
                                                            onClick={handlePraPBShow}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            Yes
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            style={{
                                                                backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                                                                color: 'white',
                                                                borderColor: '#e6e6e6',
                                                                fontWeight: 'bold',
                                                                boxShadow: 'none',
                                                                width: '130px',
                                                            }}
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            // style={{ width: '130px' }}
                                                            onClick={handlePraPBHide}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            No
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
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
