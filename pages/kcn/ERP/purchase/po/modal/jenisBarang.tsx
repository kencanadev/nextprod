import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import swal from 'sweetalert2';
import { showLoading } from '@/utils/routines';
import stylesIndex from '@styles/index.module.css';

interface JenisBarangProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    jenisTransaksi: string;
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
    tipeForm: string;
    tabIdx1: string;
    tabIdx2: string;
    tabIdx3: string;
}

const JenisBarang: React.FC<JenisBarangProps> = ({
    isOpen = false,
    onClose,
    onSelectData,
    jenisTransaksi,
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
    tipeForm,
    tabIdx1,
    tabIdx2,
    tabIdx3,
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

    console.log('jenisTransaksi = ', jenisTransaksi);

    const handleBuBarangProduksiClick = (id: any) => {
        const base64EncodedString = btoa(
            `tanggalChecked=${isTanggalChecked}&name=produksi&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${jenisTransaksi}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&kode_sp=BARU&tipe=Baru`
        );
        // router.push({ pathname: './po', query: { name: 'produksi', jenisTransaksi: jenisTransaksi, kode_sp: 'BARU' } });
        if (tipeForm === 'dashboard') {
            if (tabIdx1 === 'outstanding_pekerjaan') {
                router.push({ pathname: '/kcn/ERP/purchase/po/po', query: { str: base64EncodedString, tipe: 'dashboard', tabIdx1: tabIdx1, tabIdx2: tabIdx2, tabIdx3: tabIdx3 } });
            } else {
                router.push({ pathname: '/kcn/ERP/purchase/po/po', query: { str: base64EncodedString, tipe: 'dashboard', tabIdx1: tabIdx1 } });
            }
        } else {
            router.push({ pathname: '/kcn/ERP/purchase/po/po', query: { str: base64EncodedString } });
        }
    };

    const handleBuBarangJadiClick = (tipe: any) => {
        const base64EncodedString = btoa(
            `tanggalChecked=${isTanggalChecked}&name=${tipe}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${jenisTransaksi}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&kode_sp=BARU&tipe=Baru`
        );
        // router.push({ pathname: './po', query: { name: 'barangjadi', jenisTransaksi: jenisTransaksi, kode_sp: 'BARU' } });
        if (tipeForm === 'dashboard') {
            if (tabIdx1 === 'outstanding_pekerjaan') {
                router.push({ pathname: '/kcn/ERP/purchase/po/po', query: { str: base64EncodedString, tipe: 'dashboard', tabIdx1: tabIdx1, tabIdx2: tabIdx2, tabIdx3: tabIdx3 } });
            } else {
                router.push({ pathname: '/kcn/ERP/purchase/po/po', query: { str: base64EncodedString, tipe: 'dashboard', tabIdx1: tabIdx1 } });
            }
        } else {
            router.push({ pathname: '/kcn/ERP/purchase/po/po', query: { str: base64EncodedString } });
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
                                className={`panel my-8 w-[35vh] rounded-lg border-0 p-0 text-black dark:text-white-dark ${stylesIndex.scale75Monitor}`}
                                style={{ maxWidth: '40vh', maxHeight: '40vh' }}
                            >
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
                                                        <button
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            style={{ width: '210px', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                                            onClick={handleBuBarangProduksiClick}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            1. Barang Produksi
                                                        </button>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-secondary mr-1"
                                                            style={{ width: '210px', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                                            onClick={() => handleBuBarangJadiClick('barangjadi')}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                            2. Barang Jadi
                                                        </button>
                                                    </td>
                                                </tr>
                                                {jenisTransaksi === 'KONTRAK' ? null : (
                                                    <>
                                                        <br></br>
                                                        <tr>
                                                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-secondary mr-1"
                                                                    style={{ width: '210px', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                                                    onClick={() => handleBuBarangJadiClick('nonPersediaan')}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                    3. Barang Non Persediaan
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}
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

export default JenisBarang;
