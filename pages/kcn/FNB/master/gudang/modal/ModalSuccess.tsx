import React from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalSuccessProps {
    isOpen: boolean;
    onCloseSuccess: () => void;
    onClose: () => void;
}

const ModalSuccess: React.FC<ModalSuccessProps> = ({ isOpen = false, onCloseSuccess, onClose }) => {
    const handleButtonClick = () => {
        onCloseSuccess();
        onClose();
    };
    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" open={isOpen} onClose={onCloseSuccess}>
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
                            <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="p-6">
                                    <p>Data Telah Berhasil Disimpan</p>
                                    <div className="mt-8 flex items-center justify-end">
                                        <button type="button" className="btn btn-primary" onClick={handleButtonClick} style={{ width: '8vh', height: '4vh' }}>
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

export default ModalSuccess;
