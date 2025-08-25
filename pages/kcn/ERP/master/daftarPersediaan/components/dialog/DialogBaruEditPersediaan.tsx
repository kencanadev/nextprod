import { Fragment, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { Tab } from '@headlessui/react';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faSearch } from '@fortawesome/free-solid-svg-icons';

import { AlternatifSelectedItem, IDialogProps, SelectedItem } from '../types';
import { ACTIVATION_STATUS, INVENTORY_TYPES, ITEM_STATUS, TAB_LIST } from '../../constants';

import stylesIndex from '@styles/index.module.css';
// Tabs Component Import
import InformasiPersediaan from '../tabs/InformasiPersediaan';
import DataTambahanPersediaan from '../tabs/DataTambahanPersediaan';
import DataAkunPersediaan from '../tabs/DataAkunPersediaan';
import PerhitunganRumusPersediaan from '../tabs/PerhitunganRumusPersediaan';
import CatatanPersediaan from '../tabs/CatatanPersediaan';
import PaketProdukPersediaan from '../tabs/PaketProdukPersediaan';
import AlternatifProdukPersediaan from '../tabs/AlternatifProdukPersediaan';
import HistoriPersediaan from '../tabs/HistoriPersediaan';
import GambarProdukPersediaan from '../tabs/GambarProdukPersediaan';
import { usePersediaanForm } from '../../../../../../../utils/master/daftarPersediaan/hooks/usePersediaanForm';
import { handleGenerateNoItem } from '../../utils/generateNoItem';
import DialogListSupplier from './DialogListSupplier';
import DialogBonusPOS from './DialogBonusPOS';

const DialogBaruEditPersediaan = ({ isOpen, onClose, masterState, token, entitas, itemId, userid }: IDialogProps) => {
    const [selectedTab, setSelectedTab] = useState<string>('Informasi');
    const [showSupplier, setShowSupplier] = useState(false);
    const [selectedTabAktif, setSelectedTabAktif] = useState(0);
    const [showBonus, setShowBonus] = useState(false);
    const gridCatatan = useRef<any>(null);

    const { formState, selectedItems, selectedAlternatifItem, setSelectedItems, setSelectedAlternatifItem, updateFormState, handleSave, setCatatanList, catatanList } = usePersediaanForm({
        entitas,
        token,
        itemId,
        masterState,
        userid,
        onClose,
    });

    const handleSelectedItemsChange = (newSelectedItems: SelectedItem[]) => {
        setSelectedItems(newSelectedItems);
    };

    const handleSelectedAlternatifItemChange = (newSelectedItems: AlternatifSelectedItem[]) => {
        setSelectedAlternatifItem(newSelectedItems);
    };

    useEffect(() => {
        const dialogElement = document.getElementById('DialogBaruEditPersediaan');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);

    const buttonsInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'Bonus Diskon',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => setShowBonus(true),
        },
        {
            buttonModel: {
                content: 'Simpan',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: handleSave,
        },
        {
            buttonModel: {
                content: 'Tutup',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: onClose,
        },
        
    ];

    // useEffect(() => {
    //       if(selectedTabAktif == 4) {
    //         console.log('catatanlist', catatanList);

    //         gridCatatan.current.setProperties({dataSource : catatanList});
    //         gridCatatan.current.refresh();
    //       } else {
    //         setCatatanList(gridCatatan.current?.dataSource ?? []);
    //       }
    //     },[selectedTabAktif])

    return (
        <DialogComponent
            id="DialogBaruEditPersediaan"
            name="DialogBaruEdit"
            className="DialogBaruEdit"
            target="#main-target"
            header={() => {
                const header = masterState === 'EDIT' ? '< EDIT ITEM >' : '< ITEM BARU >';
                return header;
            }}
            visible={isOpen}
            isModal
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="95%"
            height="90%"
            position={{ X: 40, Y: 14 }}
            style={{ position: 'fixed' }}
            close={() => {
                onClose();
            }}
            buttons={buttonsInputData}
            allowDragging
            showCloseIcon
            closeOnEscape
            open={(args: any) => {
                args.preventFocus = true;
            }}
            zIndex={999}
        >
            <div className={`h-full  ${stylesIndex.scale85MonitorDialog}`}>
                {/* Upper Form */}
                <div className="box-border h-[255px] w-full rounded border bg-[#dedede] p-1">
                    <div className="flex w-full flex-col items-start gap-1">
                        <div className="ml-5 flex gap-5">
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-x-2">
                                    <label htmlFor="persediaan" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                        Tipe
                                    </label>
                                    <div className="w-full rounded border border-gray-300 bg-white px-2 ">
                                        <ComboBoxComponent
                                            cssClass="e-custom-style"
                                            name="persediaan"
                                            dataSource={INVENTORY_TYPES}
                                            fields={{ text: 'text', value: 'text' }}
                                            placeholder="Pilih Tipe"
                                            value={formState.tipe}
                                            onChange={(e: any) => updateFormState('tipe', e.target.value)}
                                            enabled={masterState !== 'EDIT'}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <label htmlFor="no-barang" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                        No. Barang
                                    </label>
                                    <div className="flex w-full rounded border border-gray-300 bg-white px-2">
                                        <TextBoxComponent
                                            name="no-barang"
                                            placeholder="No. Barang"
                                            floatLabelType="Never"
                                            value={formState.no_item}
                                            onChange={(e: any) => updateFormState('no_item', e.target.value)}
                                        />
                                        <div>
                                            <TooltipComponent
                                                position="BottomCenter"
                                                content="Generate No. Barang"
                                                target="#generateNoCust"
                                                onClick={() => {
                                                    handleGenerateNoItem(masterState, formState, updateFormState, token, entitas);
                                                }}
                                            >
                                                <button
                                                    id="generateNoCust"
                                                    className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                    style={{
                                                        height: 28,
                                                        background: 'white',
                                                        borderColor: 'white',
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faBarcode} className="ml-2" width="15" height="15" style={{ margin: '7px 2px 0px 6px' }} />
                                                </button>
                                            </TooltipComponent>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-x-2">
                                    <label htmlFor="aktivasi" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                        Aktivasi
                                    </label>
                                    <div className="w-full rounded border border-gray-300 bg-white px-2">
                                        <ComboBoxComponent
                                            cssClass="e-custom-style"
                                            name="aktivasi"
                                            dataSource={ACTIVATION_STATUS}
                                            fields={{ text: 'text', value: 'text' }}
                                            placeholder="Pilih Aktivasi"
                                            value={formState.status}
                                            onChange={(e: any) => updateFormState('status', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <label htmlFor="status" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                        Status
                                    </label>
                                    <div className="w-full rounded border border-gray-300 bg-white px-2">
                                        <ComboBoxComponent
                                            cssClass="e-custom-style"
                                            name="status"
                                            dataSource={ITEM_STATUS}
                                            fields={{ text: 'text', value: 'text' }}
                                            placeholder="Pilih Status"
                                            value={formState.status_item}
                                            onChange={(e: any) => updateFormState('status_item', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-[50%] items-center gap-x-2">
                            <label htmlFor="nama-barang" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                Nama Barang
                            </label>
                            <div className="w-full rounded border border-gray-300 bg-white px-2">
                                <TextBoxComponent
                                    name="nama-barang"
                                    placeholder="Nama Barang"
                                    floatLabelType="Never"
                                    value={formState.nama_item}
                                    onChange={(e: any) => updateFormState('nama_item', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Separator */}
                    {formState.tipe === 'Persediaan' && (
                        <div className="mb-3 mt-1 flex items-center gap-1">
                            <span className="min-w-32">Info Produk Supplier</span>
                            <hr className="h-[1.5px] w-full border-t-0 bg-neutral-400" />
                        </div>
                    )}
                    {/* Bottom Form */}
                    {formState.tipe === 'Persediaan' && (
                        // <div className="mb-4 grid w-full grid-cols-3 gap-x-5 gap-y-3">
                        <div className="flex w-[50%] flex-col gap-0.5">
                            <div className="ml-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-x-2">
                                    <label htmlFor="no-barang-barcode" className="block w-[130px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                        No. Barang (Barcode)
                                    </label>
                                    <div className="w-full rounded border border-gray-300 bg-white px-2">
                                        <TextBoxComponent
                                            name="no-barang-barcode"
                                            placeholder="No. Barang (Barcode)"
                                            floatLabelType="Never"
                                            value={formState.kustom2}
                                            onChange={(e: any) => updateFormState('kustom2', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <input
                                        type="checkbox"
                                        name="barang-kontrak-ppn"
                                        checked={formState.konsinyasi === 'Y'}
                                        onChange={(e) => {
                                            const newValue = e.target.checked ? 'Y' : 'N';
                                            updateFormState('konsinyasi', newValue);
                                        }}
                                    />
                                    <span>Barang Konsinyasi</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <label htmlFor="grup-barang" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                    Nama Supplier
                                </label>
                                <div className="flex w-full items-center rounded border border-gray-300 bg-white px-2" onClick={() => setShowSupplier(true)}>
                                    <TextBoxComponent
                                        name="grup-barang"
                                        placeholder={formState.nama_supplier ? formState.nama_supplier : 'Nama Supplier'}
                                        floatLabelType="Never"
                                        value={formState.nama_supplier}
                                        onChange={(e: any) => updateFormState('nama_supplier', e.target.value)}
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                        readOnly
                                    />
                                    <button id="grupBarang" className="flex items-center justify-center font-semibold" onClick={() => setShowSupplier(true)}>
                                        <FontAwesomeIcon icon={faSearch} width="18" height="18" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <label htmlFor="nama-barang-2" className="block w-[100px] text-right text-xs font-medium text-gray-900 dark:text-white">
                                    Nama Barang
                                </label>
                                <div className="w-full rounded border border-gray-300 bg-white px-2">
                                    <TextBoxComponent
                                        name="nama-barang-2"
                                        placeholder="Nama Barang"
                                        floatLabelType="Never"
                                        value={formState.kustom3}
                                        onChange={(e: any) => updateFormState('kustom3', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Tabs */}
                <Tab.Group
                    defaultIndex={0}
                    onChange={(e) => {
                        setSelectedTabAktif(e);
                    }}
                >
                    <Tab.List className="mt-3 flex h-[30px] max-h-20 w-full  flex-wrap border-b border-white-light dark:border-[#191e3a]">
                        {TAB_LIST(formState.tipe).map((item: any) => (
                            <Tab key={item.id} as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => {
                                            setSelectedTab(item.title);
                                        }}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                    >
                                        {item.title}
                                    </button>
                                )}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="w-full flex-1 overflow-y-auto border border-t-0 border-white-light p-2  text-sm dark:border-[#191e3a]">
                        {selectedTab === 'Informasi' && <InformasiPersediaan formState={formState} updateState={updateFormState} entitas={entitas} />}
                        {selectedTab === 'Data Tambahan' && <DataTambahanPersediaan formState={formState} updateState={updateFormState} entitas={entitas} token={token} />}
                        {selectedTab === 'Data Akun' && <DataAkunPersediaan formState={formState} updateState={updateFormState} />}
                        {selectedTab === 'Perhitungan Rumus' && <PerhitunganRumusPersediaan formState={formState} updateState={updateFormState} />}
                        {/* {selectedTab === 'Catatan' && } */}
                        {selectedTab === 'Catatan' && (
                            <CatatanPersediaan
                                formState={formState}
                                gridCatatan={gridCatatan}
                                updateState={updateFormState}
                                selectedTabAktif={selectedTabAktif}
                                catatanList={catatanList}
                                setCatatanList={setCatatanList}
                            />
                        )}
                        {selectedTab === 'Paket Produk' && <PaketProdukPersediaan entitas={entitas} token={token} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />}
                        {selectedTab === 'Alternatif Produk' && (
                            <AlternatifProdukPersediaan selectedItems={selectedAlternatifItem} setSelectedItems={setSelectedAlternatifItem} entitas={entitas} token={token} />
                        )}
                        {selectedTab === 'Histori' && <HistoriPersediaan entitas={entitas} formState={formState} token={token} />}
                        {selectedTab === 'Gambar Produk' && <GambarProdukPersediaan formState={formState} updateState={updateFormState} />}
                    </Tab.Panels>
                </Tab.Group>
            </div>
            {showBonus && <DialogBonusPOS isOpen={showBonus} onClose={() => setShowBonus(false)} formState={formState} setFormState={updateFormState} />}
            {showSupplier && <DialogListSupplier isOpen={showSupplier} onClose={() => setShowSupplier(false)} updateState={updateFormState} entitas={entitas} token={token} /> }
        </DialogComponent>
    );
};

export default DialogBaruEditPersediaan;
