import React from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface PenulisanNamaGudangProps {
    isOpen: boolean;
    onClose: () => void;
}

const PenulisanNamaGudang: React.FC<PenulisanNamaGudangProps> = ({ isOpen = false, onClose }) => {
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
                            <Dialog.Panel className="panel my-8 w-[60vh] rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="table-responsive whitespace-nowrap p-3">
                                    Penulisan Nama Gudang Harus Diawali dengan Huruf : <br />
                                    GD, GU, GC, GB, dan GV
                                </div>

                                <div className="mr-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4"></div>

                                    <div className="mb-4 flex space-x-4">
                                        <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '8vh', height: '4vh' }}>
                                            OK
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

export default PenulisanNamaGudang;
