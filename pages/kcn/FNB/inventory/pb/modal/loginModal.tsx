import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Swal from 'sweetalert2';

interface LoginProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    kode_entitas: any;
    // onSelectRelasi: any;
}

const LoginModal: React.FC<LoginProps> = ({ isOpen = false, onClose, onSelectData, kode_entitas }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedData, setSelectedData] = useState<boolean>(false);
    const [S_NamaRelasi, setNamaRelasi] = useState<string>('');
    const [S_KodeTermin, setKodeTermin] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [listSupplier, setListSupplier] = useState([]);
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    // const handleSelectData = (data: string, index: number, nama_relasi: string, kode_termin: any) => {
    //     setSelectedData(data);
    //     setSelectedRowIndex(index);
    //     setNamaRelasi(nama_relasi);
    //     setKodeTermin(kode_termin);
    // };

    // const handleOKClick = () => {
    //     onSelectData(selectedData, S_NamaRelasi, S_KodeTermin);
    //     onClose();
    // };

    const handleLogin = async (user: any, pass: any) => {
        const response = await axios.get(`${apiUrl}/erp/login?`, {
            params: {
                entitas: kode_entitas,
                user: user,
                pwd: pass,
            },
        });

        const responseLogin = response.data.data[0];
        if (responseLogin) {
            console.log('responseLogin');
            console.log(responseLogin);

            const response_approval = await axios.get(`${apiUrl}/erp/users_app?`, {
                params: {
                    entitas: kode_entitas,
                    param1: responseLogin.userid,
                },
            });
            const responseApp = response_approval.data.data[0];
            if (responseApp.fdo_app1 === 'Y' || responseApp.fdo_app2 === 'Y' || responseApp.kode_user === 'ADMIN') {
                console.log('masuk');
                setUser('');
                setPass('');
                onClose();
                // setSelectedData(true)
                onSelectData(true);
                return true;
            } else {
                Swal.fire({
                    title: 'Gagal',
                    text: 'Anda harus mempunyai hak approval',
                    icon: 'error',
                });
                setUser('');
                setPass('');
                onClose();
                return false;
            }
        } else {
            setUser('');
            setPass('');
            Swal.fire({
                title: 'Gagal',
                text: 'User pass salah tidak dapat ditemukan',
                icon: 'error',
            });
            onClose();
            console.log('salah');
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
                            <Dialog.Panel
                                className="panel my-8 flex w-full max-w-[500px] flex-col rounded-lg border-0 p-0 text-black dark:text-white-dark"
                                style={{ minHeight: 300, height: 'auto', minWidth: 400 }}
                            >
                                <div className="flex items-center  px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Persetujuan Stok &lt; 100 di GU</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                            User ID
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={user}
                                            onChange={(e) => setUser(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={pass}
                                            onChange={(e) => setPass(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            style={{ backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))' }}
                                            onClick={() => handleLogin(user, pass)}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            OK
                                        </button>
                                        <button
                                            style={{ backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))' }}
                                            onClick={() => {
                                                onClose();
                                                setUser('');
                                                setPass('');
                                            }}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
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

export default LoginModal;
