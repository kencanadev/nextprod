import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';
import NamaGudangSama from './NamaGudangSama';
import PenulisanNamaGudang from './PenulisanNamaGudang';
import ModalSuccess from './ModalSuccess';

interface CreateGudangProps {
    isOpen: boolean;
    onClose: () => void;
    userid: string;
    kode_entitas: any;
    fetchData: any;
    entitasUser: any;
}

export default function CreateGudang({ entitasUser, isOpen = false, onClose, userid = '', fetchData }: CreateGudangProps) {
    const [formData, setFormData] = useState({
        nama_gudang: '',
        alamat: '',
        alamat2: '',
        personal: '',
        catatan: '',
        aktif: 'Y',
        userid: userid?.toUpperCase(),
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        jenis: 'I',
        kpi: 'Y',
        // entitas: kode_entitas,
        entitas: entitasUser,
    });

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);

    const [modalSuccess, setModalSuccess] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/master_gudang?entitas=${entitasUser}`);
            const existingGudangs = response.data.data.map((item: any) => item.nama_gudang);
            const isExisting = existingGudangs.includes(formData.nama_gudang);

            if (isExisting) {
                setModal1(true);
            } else if (/^(GD|GU|GC|GB|GV)[. ]/.test(formData.nama_gudang)) {
                console.log('Masuk Sini = ', formData);

                const insertResponse = await axios.post(`${apiUrl}/erp/simpan_master_gudang`, {
                    ...formData,
                });
                if (response.data.status === true) {
                    setModalSuccess(true);
                    console.log('Data berhasil disimpan:', insertResponse.data);
                    fetchData();
                }
            } else {
                setModal2(true);
            }
        } catch (error) {
            console.error('Error saat menyimpan data:', error);
            console.log('Data yang dikirim:', formData);
        }
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                {/* ... Modal Overlay ... */}
                <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
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
                            <Dialog.Panel className="panel my-8 w-full max-w-[70vh] rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Gudang Baru</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="p-3">
                                    <div className="ml-2 flex flex-col items-center gap-1 font-semibold md:flex-row">
                                        <label className="w-[20vh]" style={{ fontSize: '1.5vh' }}>
                                            Nama Gudang
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nama_gudang}
                                            onChange={(e) => setFormData({ ...formData, nama_gudang: e.target.value })}
                                            placeholder="Nama Gudang.."
                                            className="form-input md:w-[26vh]"
                                        />
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox ml-1"
                                                checked={formData.aktif === 'N'}
                                                onChange={(e) => setFormData({ ...formData, aktif: e.target.checked ? 'N' : 'Y' })}
                                            />
                                            <label className="absolute left-full top-1/2 -translate-y-1/2 transform cursor-pointer whitespace-nowrap" style={{ fontSize: '1.5vh' }}>
                                                Non Aktif
                                            </label>
                                        </div>
                                    </div>
                                    <div className="ml-2 mt-0.5 flex flex-col items-center gap-1 font-semibold md:flex-row">
                                        <label className="w-[20vh]" style={{ fontSize: '1.5vh' }}>
                                            Keterangan
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.catatan}
                                            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                            placeholder="Keterangan.."
                                            className="form-input md:w-[40vh]"
                                        />
                                    </div>
                                    <div className="ml-2 mt-0.5 flex flex-col items-center gap-1 font-semibold md:flex-row">
                                        <label className="w-[20vh]" style={{ fontSize: '1.5vh' }}>
                                            Alamat
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.alamat}
                                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                            placeholder="Alamat.."
                                            className="form-input mb-2 md:mb-0 md:w-[40vh]"
                                        />
                                    </div>
                                    <div className="ml-2 mt-1 flex flex-col items-center gap-1 font-semibold md:flex-row">
                                        <label className="w-[20vh]" style={{ fontSize: '1.5vh' }}></label>
                                        <input
                                            type="text"
                                            value={formData.alamat2}
                                            onChange={(e) => setFormData({ ...formData, alamat2: e.target.value })}
                                            placeholder="Alamat2.."
                                            className="form-input mb-2 md:mb-0 md:w-[40vh]"
                                        />
                                    </div>
                                    <div className="ml-2 mt-1 flex flex-col items-center gap-1 font-semibold md:flex-row">
                                        <label className="w-[20vh]" style={{ fontSize: '1.5vh' }}>
                                            Penanggung Jawab{' '}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.personal}
                                            onChange={(e) => setFormData({ ...formData, personal: e.target.value })}
                                            placeholder="Penanggung Jawab.."
                                            className="form-input md:mb-0 md:w-[40vh]"
                                        />
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="flex space-x-2">
                                        <div className="ml-5 font-bold" style={{ fontSize: '1.5vh' }}>
                                            Jenis Gudang
                                        </div>
                                        {/* Radio Buttons */}
                                        <label style={{ marginLeft: '117px' }}>
                                            <input
                                                checked={formData.jenis === 'I'}
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio"
                                                value="I"
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span className="peer-checked:text-primary" style={{ fontSize: '1.5vh' }}>
                                                Internal
                                            </span>
                                        </label>

                                        <label>
                                            <input
                                                checked={formData.jenis === 'E'}
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio text-success"
                                                value="E"
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span className="peer-checked:text-success" style={{ fontSize: '1.5vh' }}>
                                                Eksternal
                                            </span>
                                        </label>

                                        <label>
                                            <input
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio text-secondary"
                                                value="C"
                                                checked={formData.jenis === 'C'}
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span className="peer-checked:text-secondary" style={{ fontSize: '1.5vh' }}>
                                                Cabang
                                            </span>
                                        </label>

                                        <label>
                                            <input
                                                checked={formData.jenis === 'P'}
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio text-danger"
                                                value="P"
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span className="peer-checked:text-danger" style={{ fontSize: '1.5vh' }}>
                                                Pabrik
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-4.5" style={{ marginLeft: '235px' }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={formData.kpi === 'N'}
                                            onChange={(e) => setFormData({ ...formData, kpi: e.target.checked ? 'N' : 'Y' })}
                                        />
                                        <span style={{ fontSize: '1.5vh', backgroundColor: '#ffabb0' }}>Exclude Perhitungan Stok Overdue</span>
                                    </label>
                                </div>
                                <div className="mb-4 mr-5 flex justify-end space-x-4">
                                    <button type="button" className="btn btn-primary mb-4" onClick={handleSubmit} style={{ width: '9vh', height: '4.5vh' }}>
                                        Simpan
                                    </button>
                                    {/* Modal Failed Submit */}
                                    <ModalSuccess isOpen={modalSuccess} onCloseSuccess={() => setModalSuccess(false)} onClose={() => onClose()} />
                                    <NamaGudangSama isOpen={modal1} onClose={() => setModal1(false)} />
                                    <PenulisanNamaGudang isOpen={modal2} onClose={() => setModal2(false)} />
                                    <button type="button" className="btn btn-outline-danger mb-4" onClick={onClose} style={{ width: '9vh', height: '4.5vh' }}>
                                        Batal
                                    </button>
                                </div>
                                {/* userId: {userid}, Entitas: {kode_entitas} */}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
