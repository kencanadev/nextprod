import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import swal from 'sweetalert2';
import { showLoading } from '@/utils/routines';
import JenisBarang from './jenisBarang';
import stylesIndex from '@styles/index.module.css';

interface JenisTransaksiProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    date1: any;
    date2: any;
    dateberlaku1: any;
    dateberlaku2: any;
    datekirim1: any;
    datekirim2: any;
    tipeDokumen: any;
    noPOValue: any;
    namaSuppValue: any;
    namaBarangValue: any;

    isPoKontrakChecked: any;
    isPoNonKontrakChecked: any;
    isPoBarangProduksiChecked: any;
    isPoDenganPajakChecked: any;
    isKirimanLangsungChecked: any;
    isPembatalanOrderChecked: any;
    isBelumAccDireksiChecked: any;
    isSudahAccDireksiChecked: any;

    isNoPOChecked: any;
    isNamaSuppChecked: any;
    isNamaBarangChecked: any;
    statusDokValue: any;
    statusAppValue: any;
    isTanggalChecked: any;
    tipeForm?: string;
    tabIdx1?: string;
    tabIdx2?: string;
    tabIdx3?: string;
}

const JenisTransaksi: React.FC<JenisTransaksiProps> = ({
    isOpen = false,
    onClose,
    onSelectData,
    date1,
    date2,
    dateberlaku1,
    dateberlaku2,
    datekirim1,
    datekirim2,
    tipeDokumen,
    noPOValue,
    namaSuppValue,
    namaBarangValue,

    isPoKontrakChecked,
    isBelumAccDireksiChecked,
    isKirimanLangsungChecked,
    isPembatalanOrderChecked,
    isPoBarangProduksiChecked,
    isPoDenganPajakChecked,
    isPoNonKontrakChecked,
    isSudahAccDireksiChecked,

    isNoPOChecked,
    isNamaSuppChecked,
    isNamaBarangChecked,
    statusDokValue,
    statusAppValue,
    isTanggalChecked,
    tipeForm = '',
    tabIdx1 = '',
    tabIdx2 = '',
    tabIdx3 = '',
}) => {
    const router = useRouter();

    // const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    // const [selectedData, setSelectedData] = useState<string>('');
    // const [searchTerm, setSearchTerm] = useState<string>('');

    // const handleSelectData = (data: string, index: number) => {
    //     setSelectedData(data);
    //     setSelectedRowIndex(index);
    // };

    // const handleOKClick = () => {
    //     onSelectData(selectedData);
    //     onClose();
    // };

    //handle button click
    const [plagModalJenisBarang, setPlagModalJenisBarang] = useState(false);
    const [jTransaksi, setJTransaksi] = useState<string>('');

    const handleKontrakClick = (id: any) => {
        setPlagModalJenisBarang(true);
        onClose();
        setJTransaksi('KONTRAK');
    };

    const handleNonKontrakClick = (id: any) => {
        setPlagModalJenisBarang(true);
        onClose();
        setJTransaksi('NON KONTRAK');
    };

    const [baruSelected, setbaruSelected] = useState();

    const handleSelectedData = (selectedData: any) => {
        setbaruSelected(selectedData);
    };

    return (
        <>
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
                                    className={`panel my-8 w-[35vh] rounded-lg border-0 p-0 text-black dark:text-white-dark ${stylesIndex.scale75Monitor}`}
                                    style={{ maxWidth: '40vh', maxHeight: '34vh' }}
                                >
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
                                                                type="submit"
                                                                className="btn btn-secondary mr-1"
                                                                style={{ width: '210px', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                                                onClick={handleKontrakClick}
                                                            >
                                                                <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                1. Kontrak
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button
                                                                type="submit"
                                                                className="btn btn-secondary mr-1"
                                                                style={{ width: '210px', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                                                onClick={handleNonKontrakClick}
                                                            >
                                                                <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                2. Non Kontrak
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
            <JenisBarang
                isOpen={plagModalJenisBarang}
                onClose={() => setPlagModalJenisBarang(false)}
                onSelectData={(selectedData: any) => handleSelectedData(selectedData)}
                jenisTransaksi={jTransaksi}
                date1={date1}
                date2={date2}
                dateberlaku1={dateberlaku1}
                dateberlaku2={dateberlaku2}
                datekirim1={datekirim1}
                datekirim2={datekirim2}
                tipeDokumen={tipeDokumen}
                noPOValue={noPOValue}
                namaSuppValue={namaSuppValue}
                namaBarangValue={namaBarangValue}
                isPoKontrakChecked={isPoKontrakChecked}
                isPoNonKontrakChecked={isPoNonKontrakChecked}
                isPoBarangProduksiChecked={isPoBarangProduksiChecked}
                isPoDenganPajakChecked={isPoDenganPajakChecked}
                isKirimanLangsungChecked={isKirimanLangsungChecked}
                isPembatalanOrderChecked={isPembatalanOrderChecked}
                isBelumAccDireksiChecked={isBelumAccDireksiChecked}
                isSudahAccDireksiChecked={isSudahAccDireksiChecked}
                isNoPOChecked={isNoPOChecked}
                isNamaSuppChecked={isNamaSuppChecked}
                isNamaBarangChecked={isNamaBarangChecked}
                statusDokValue={statusDokValue}
                statusAppValue={statusAppValue}
                isTanggalChecked={isTanggalChecked}
                tipeForm={tipeForm}
                tabIdx1={tabIdx1}
                tabIdx2={tabIdx2}
                tabIdx3={tabIdx3}
            />
        </>
    );
};

export default JenisTransaksi;
