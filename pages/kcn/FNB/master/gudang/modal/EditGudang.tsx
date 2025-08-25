import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';
import NamaGudangSama from './NamaGudangSama';
import PenulisanNamaGudang from './PenulisanNamaGudang';

interface EditGudangProps {
    isOpen: boolean;
    onClose: () => void;
    userid: string;
    kode_entitas: any;
    fetchData: any;
    selectedRow: any;
    entitasUser: any;
}

export default function EditGudang({ isOpen =  false, onClose, userid = '', fetchData, selectedRow, entitasUser }: EditGudangProps) {
    const [formData, setFormData] = useState({
        kode_gudang: '',
        nama_gudang: '',
        alamat: '',
        alamat2: '',
        personal: '',
        catatan: '',
        aktif: 'Y',
        userid: userid,
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        jenis: 'I',
        kpi: 'Y',
        entitas: entitasUser,
    });

    // console.log(selectedRow?.nama_gudang, 'selectedRow dari edit gudang');

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/master_gudang?entitas=${entitasUser}`);
            const existingGudangs = response.data.data.map((item: any) => item.nama_gudang);

            const isExisting = existingGudangs.includes(formData.nama_gudang) && formData.nama_gudang !== selectedRow.nama_gudang;

            if (isExisting) {
                setModal1(true);
            } else if (/^(GD|GU|GC|GB|GV)[. ]/.test(formData.nama_gudang)) {
                const insertResponse = await axios.patch(`${apiUrl}/erp/update_master_gudang`, {
                    ...formData,
                });
                if (insertResponse.data.status === true) {
                    console.log('Data berhasil disimpan:', insertResponse.data);
                    onClose();
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

    useEffect(() => {
        if (isOpen) {
            const getIdData = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/id_master_gudang`, {
                        params: {
                            kode_gudang: selectedRow?.kode_gudang,
                            entitas: entitasUser,
                        },
                    });

                    const data = response.data.data[0];

                    setFormData({
                        kode_gudang: data.kode_gudang,
                        nama_gudang: data.nama_gudang || '',
                        alamat: data.alamat || '',
                        alamat2: data.alamat2 || '',
                        personal: data.personal || '',
                        catatan: data.catatan || '',
                        aktif: data.aktif || 'Y',
                        userid: userid,
                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        jenis: data.jenis || 'I',
                        kpi: data.kpi || 'Y',
                        entitas: entitasUser,
                    });

                    console.log('Response:', response.data);
                } catch (error) {
                    console.error('Error Id record:', error);
                }
            };

            getIdData();
        }
    }, [isOpen, selectedRow?.kode_gudang]);

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
                                    <div className="text-lg font-bold">Ubah Gudang</div>
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
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio"
                                                value="I"
                                                checked={formData.jenis === 'I'}
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span style={{ fontSize: '1.5vh' }}>Internal</span>
                                        </label>

                                        <label>
                                            <input
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio"
                                                value="E"
                                                checked={formData.jenis === 'E'}
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span style={{ fontSize: '1.5vh' }}>Eksternal</span>
                                        </label>

                                        <label>
                                            <input
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio"
                                                value="C"
                                                checked={formData.jenis === 'C'}
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span style={{ fontSize: '1.5vh' }}>Cabang</span>
                                        </label>

                                        <label>
                                            <input
                                                name="jenis"
                                                type="radio"
                                                className="peer form-radio"
                                                value="P"
                                                checked={formData.jenis === 'P'}
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                            />
                                            <span style={{ fontSize: '1.5vh' }}>Pabrik</span>
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
                                    <button type="button" style={{ background: '#3b3f5c', color: 'white', width: '9vh', height: '4.5vh' }} className="btn  mb-4" onClick={handleSubmit}>
                                        Simpan
                                    </button>
                                    {/* Modal Failed Submit */}
                                    <NamaGudangSama isOpen={modal1} onClose={() => setModal1(false)} />
                                    <PenulisanNamaGudang isOpen={modal2} onClose={() => setModal2(false)} />
                                    <button type="button" style={{ background: '#3b3f5c', color: 'white', width: '9vh', height: '4.5vh' }} className="btn mb-4" onClick={onClose}>
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
