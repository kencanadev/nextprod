import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import swal from 'sweetalert2';
import { showLoading } from '@/utils/routines';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

interface PilihBaruProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
}

const PilihBaru: React.FC<PilihBaruProps> = ({ isOpen = false, onClose, onSelectData }) => {
    const router = useRouter();

    const handleKontrak = () => {
        const encode = Buffer.from(`kontrak=Y`).toString('base64');
        router.push({ pathname: './new_pb', query: { str: encode } });
    };

    const handleNonKontrak = () => {
        const encode = Buffer.from(`kontrak=N`).toString('base64');
        router.push({ pathname: './new_pb', query: { str: encode } });
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
                                    <div className="text-lg font-bold">Jenis Transaksi</div>
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
                                                        <button
                                                            style={{
                                                                backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                                                                color: 'white',
                                                                borderColor: '#e6e6e6',
                                                                fontWeight: 'bold',
                                                                boxShadow: 'none',
                                                                width: '210px',
                                                            }}
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            // style={{ width: '210px' }}
                                                            onClick={handleKontrak}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            1. Kontrak
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button
                                                            style={{
                                                                backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                                                                color: 'white',
                                                                borderColor: '#e6e6e6',
                                                                fontWeight: 'bold',
                                                                boxShadow: 'none',
                                                                width: '210px',
                                                            }}
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            // style={{ width: '210px' }}
                                                            onClick={handleNonKontrak}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            2. Non Kontrak
                                                        </button>
                                                    </td>
                                                </tr>
                                                <br></br>
                                                <tr>
                                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button
                                                            style={{
                                                                backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                                                                color: 'white',
                                                                borderColor: '#e6e6e6',
                                                                fontWeight: 'bold',
                                                                boxShadow: 'none',
                                                                width: '210px',
                                                            }}
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            // style={{ width: '210px' }}
                                                            onClick={handleNonKontrak}
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
