import React, { Fragment, useState, useEffect } from 'react';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { CheckControlEditor, fecthLookupAkun, fetchSetting, fetchSubledgerSingleData, postSimpanSubledger, SettingsType, SubledgerSingleType, SubledgerType, swalToast } from '.';
import { Tab } from '@headlessui/react';
import { TextBoxComponent, ChangeEventArgs as ChangeEventArgsTextBox } from '@syncfusion/ej2-react-inputs';
import { ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FrmKryDlg from './Dialog/FrmKryDlg';
import FrmCustomerDlg from './Dialog/FrmCustomerDlg';
import FrmSupplierDlg from './Dialog/FrmSupplierDlg';
import FrmSalesDlg from './Dialog/FrmSalesDlg';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
    AkunSelected: SubledgerType;
    state: string;
}
const FrmDialogSubledger = ({ isOpen, onClose, entitas, token, userid, AkunSelected, state }: Props) => {
    // Definition
    const [dsMaster, setDsMaster] = useState<SubledgerSingleType>({
        kode_subledger: '',
        kode_akun: '',
        no_subledger: '',
        nama_subledger: '',
        aktif: 'Y',
        catatan: null,
        userid: '',
        tgl_update: '',
        kode_relasi: null,
        Old_no_subledger: null,
    });
    const [OldNoSubledger, setOldNoSubledger] = useState<string>('');
    const tabItems = [
        {
            Name: '1. Informasi',
            slug: 'informasi',
        },
    ];
    const [loading, setLoading] = useState(false);
    const [dsLookupAkun, setDsLookupAkun] = useState<any[]>([]);
    const [dsSetting, setDsSetting] = useState<SettingsType[]>([]);
    const [visibleInput, setVisibleInput] = useState({
        edNoAkunReadOnly: false,
        edNamaAkunReadOnly: false,
        buCustVisible: false,
        FrmKryDlg: false,
        FrmCustomerDlg: false,
        FrmSupplierDlg: false,
        FrmSalesDlg: false,
    });
    const updateFieldMasterValue = (field: any, value: any) => {
        setDsMaster((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const headerTemplate = () => {
        return (
            <div className="flex items-center justify-between p-3">
                <span className="text-gray-400">Keterangan</span> <span className="text-gray-400">No. Akun</span>
            </div>
        );
    };
    const itemTemplate = (data: any) => {
        return (
            <div className="flex items-center justify-between">
                <div className="ename"> {data.nama_akun} </div>
                <div className="job"> {data.no_akun} </div>
            </div>
        );
    };
    // Function
    const saveDoc = async (type: string) => {
        const checked = CheckControlEditor(dsMaster);
        console.log('checked = ', checked);

        if (checked) {
            setLoading(true);
            if (state === 'edit') {
                const newJSON = {
                    ...dsMaster,
                    entitas: entitas,
                    type: 'update',
                    userid: userid.toUpperCase(),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                console.log('newJSON = ', newJSON);

                await postSimpanSubledger(entitas, token, newJSON).then((result) => {
                    if (result?.status) {
                        swalToast.fire({
                            icon: 'success',
                            title: `<p style="font-size:12px">Update Data Subledger</p>`,
                            width: '100%',
                            target: '#daftarAkunSubledger',
                        });
                        closeForm();
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                });
            } else {
                const newJSON = {
                    ...dsMaster,
                    entitas: entitas,
                    type: 'insert',
                    userid: userid.toUpperCase(),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                await postSimpanSubledger(entitas, token, newJSON).then((result) => {
                    if (result?.status) {
                        swalToast.fire({
                            icon: 'success',
                            title: `<p style="font-size:12px">Berhasil Menyimpan Akun Subledger</p>`,
                            width: '100%',
                            target: '#FrmDepartemenDlg',
                        });
                        closeForm();
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                });
            }
        }
    };
    const closeForm = () => {
        setDsMaster({
            kode_subledger: '',
            kode_akun: '',
            no_subledger: '',
            nama_subledger: '',
            aktif: '',
            catatan: null,
            userid: '',
            tgl_update: '',
            kode_relasi: null,
        });
        onClose();
    };
    const buttonsInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'Simpan',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => saveDoc('close'),
        },
        {
            buttonModel: {
                content: 'Tutup',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: closeForm,
        },
    ];
    const visibleHandle = (KodeAkun: string, settings: SettingsType[]) => {
        if (KodeAkun === settings[0]?.kode_akun_uangmukajual || KodeAkun === settings[0]?.kode_akun_piutangsales || KodeAkun === settings[0]?.kode_akun_pika) {
            console.log('MASUK TRUE');
            setVisibleInput((prev) => ({
                ...prev,
                edNoAkunReadOnly: true,
                edNamaAkunReadOnly: true,
                buCustVisible: true,
            }));
        } else {
            console.log('MASUK FALSE');
            setVisibleInput((prev) => ({
                ...prev,
                edNoAkunReadOnly: false,
                edNamaAkunReadOnly: false,
                buCustVisible: false,
            }));
        }
    };
    const refreshData = async () => {
        setLoading(true);
        const newData = await fetchSubledgerSingleData(entitas, token, AkunSelected?.kode_subledger);
        setDsMaster(newData[0]);
    };
    // UseEffect
    useEffect(() => {
        const refreshLookUPAkun = async () => {
            const lookupres = await fecthLookupAkun(entitas, token);
            const settingRes = await fetchSetting(entitas, token);
            setDsLookupAkun(lookupres);
            setDsSetting(settingRes);
            visibleHandle(AkunSelected?.kode_akun, settingRes);
        };
        refreshLookUPAkun();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            await refreshData();
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };
        if (AkunSelected?.kode_subledger) {
            fetchData();
        }
    }, [AkunSelected]);
    return (
        <>
            <DialogComponent
                id="FrmDialogSubledger"
                name="FrmDialogSubledger"
                target="#daftarAkunSubledger"
                header={
                    state === 'edit' || AkunSelected?.no_subledger !== ''
                        ? 'Subledger : ' + dsMaster?.no_subledger + ' - ' + dsMaster?.nama_subledger + ' [' + AkunSelected?.namaakun + ']'
                        : 'Subledger Baru'
                }
                visible={isOpen}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                width="40%"
                height="37%"
                position={{ X: 'center', Y: 'center' }}
                style={{ position: 'fixed' }}
                buttons={buttonsInputData}
                // footerTemplate={footerTemplate}
                close={() => {
                    closeForm();
                }}
                closeOnEscape={true}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
                showCloseIcon={true}
                allowDragging={true}
            >
                <div>
                    <div className="relative block">
                        <div className={`${loading && 'opacity-20'}`}>
                            <Tab.Group defaultIndex={0}>
                                <Tab.List className="flex max-h-20 w-full flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                    {tabItems.map((item: { Name: string; slug: string }, index: number) => (
                                        <Tab key={index} as={Fragment}>
                                            {({ selected }) => (
                                                <button
                                                    onClick={() => {
                                                        // setSelectedTab(item.title);
                                                    }}
                                                    className={`${
                                                        selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                    } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                >
                                                    {item.Name}
                                                </button>
                                            )}
                                        </Tab>
                                    ))}
                                </Tab.List>
                                <Tab.Panels className="w-full flex-1 border border-t-0 border-white-light p-2  text-sm dark:border-[#191e3a]">
                                    {tabItems.map(
                                        (item: { Name: string; slug: string }, index: number) =>
                                            item.slug === 'informasi' && (
                                                <div key={index}>
                                                    <div className="mb-2">
                                                        <label htmlFor="kode_akun" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            Akun Buku Besar
                                                        </label>
                                                        <div className={`rounded border border-gray-300 ${state === 'edit' && 'bg-[#f3f3f3]'} px-2`}>
                                                            {state === 'edit' || AkunSelected?.no_subledger !== '' ? (
                                                                <TextBoxComponent
                                                                    name="kode_akun"
                                                                    placeholder="kode_akun"
                                                                    floatLabelType="Never"
                                                                    value={dsLookupAkun.find((x) => x.kode_akun === dsMaster?.kode_akun)?.nama_akun}
                                                                    style={{
                                                                        cursor: 'not-allowed',
                                                                    }}
                                                                    readOnly
                                                                    disabled
                                                                />
                                                            ) : (
                                                                <ComboBoxComponent
                                                                    name="kode_akun"
                                                                    fields={{
                                                                        text: 'nama_akun',
                                                                        value: 'kode_akun',
                                                                    }}
                                                                    headerTemplate={headerTemplate}
                                                                    itemTemplate={itemTemplate}
                                                                    id="kode_akun"
                                                                    dataSource={dsLookupAkun}
                                                                    change={(args: ChangeEventArgsDropDown) => {
                                                                        const value: any = args.value;
                                                                        updateFieldMasterValue('kode_akun', value);
                                                                        visibleHandle(value, dsSetting);
                                                                    }}
                                                                    value={dsMaster?.kode_akun}
                                                                    showClearButton={false}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <label htmlFor="no_subledger" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            No. Subledger
                                                        </label>
                                                        <div className="grid grid-cols-12 items-center gap-2">
                                                            <div className="col-span-10">
                                                                <div className={`w-full rounded border border-gray-300 px-2 ${visibleInput.edNoAkunReadOnly && 'bg-[#f3f3f3]'}`}>
                                                                    <TextBoxComponent
                                                                        id="no_subledger"
                                                                        name="no_subledger"
                                                                        floatLabelType="Never"
                                                                        value={dsMaster?.no_subledger}
                                                                        change={(args: ChangeEventArgsTextBox) => {
                                                                            const value: any = args.value;

                                                                            updateFieldMasterValue('no_subledger', value);
                                                                        }}
                                                                        style={visibleInput.edNoAkunReadOnly ? { cursor: 'not-allowed' } : {}}
                                                                        disabled={visibleInput.edNoAkunReadOnly}
                                                                        readOnly={visibleInput.edNoAkunReadOnly}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="flex items-center gap-2">
                                                                    {visibleInput.buCustVisible && (
                                                                        <ButtonComponent
                                                                            type="button"
                                                                            cssClass="e-primary e-small e-round"
                                                                            iconCss="e-icons e-small e-search"
                                                                            onClick={() => {
                                                                                if (dsMaster?.kode_akun === dsSetting[0]?.kode_akun_uangmukajual) {
                                                                                    setOldNoSubledger(dsMaster?.no_subledger);
                                                                                    setVisibleInput((prev) => ({
                                                                                        ...prev,
                                                                                        FrmCustomerDlg: true,
                                                                                    }));
                                                                                } else if (dsMaster?.kode_akun === dsSetting[0]?.kode_akun_piutangsales) {
                                                                                    setOldNoSubledger(dsMaster?.no_subledger);
                                                                                    setVisibleInput((prev) => ({
                                                                                        ...prev,
                                                                                        FrmSalesDlg: true,
                                                                                    }));
                                                                                } else if (dsMaster?.kode_akun === dsSetting[0]?.kode_akun_pika) {
                                                                                    setOldNoSubledger(dsMaster?.no_subledger);
                                                                                    setVisibleInput((prev) => ({
                                                                                        ...prev,
                                                                                        FrmKryDlg: true,
                                                                                    }));
                                                                                } else if (dsMaster?.kode_akun === dsSetting[0]?.kode_akun_uangmukabeli) {
                                                                                    setOldNoSubledger(dsMaster?.no_subledger);
                                                                                    setVisibleInput((prev) => ({
                                                                                        ...prev,
                                                                                        FrmSupplierDlg: true,
                                                                                    }));
                                                                                }
                                                                            }}
                                                                            style={{ backgroundColor: '#3b3f5c' }}
                                                                        />
                                                                    )}
                                                                    <div className="flex">
                                                                        <CheckBoxComponent
                                                                            label="Non Aktif"
                                                                            checked={dsMaster?.aktif === 'N'}
                                                                            change={(args: ChangeEventArgsButton) => {
                                                                                const value: any = args.checked;
                                                                                updateFieldMasterValue('aktif', value ? 'N' : 'Y');
                                                                            }}
                                                                            style={{ borderRadius: 3, borderColor: 'gray' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <label htmlFor="nama_subledger" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            Keterangan
                                                        </label>
                                                        <div className={`rounded border border-gray-300 px-2 ${visibleInput.edNamaAkunReadOnly && 'bg-[#f3f3f3]'}`}>
                                                            <TextBoxComponent
                                                                name="nama_subledger"
                                                                floatLabelType="Never"
                                                                value={dsMaster?.nama_subledger}
                                                                onChange={(args: any) => {
                                                                    const value: any = args.target.value;
                                                                    updateFieldMasterValue('nama_subledger', value);
                                                                }}
                                                                style={visibleInput.edNamaAkunReadOnly ? { cursor: 'not-allowed' } : {}}
                                                                disabled={visibleInput.edNamaAkunReadOnly}
                                                                readOnly={visibleInput.edNamaAkunReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                        {loading && (
                            <div role="status" className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2">
                                <svg
                                    aria-hidden="true"
                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogComponent>
            {visibleInput.FrmKryDlg ? (
                <FrmKryDlg
                    isOpen={visibleInput.FrmKryDlg}
                    onClose={function (SelectedKry: any): void {
                        setVisibleInput((prev) => ({
                            ...prev,
                            FrmKryDlg: false,
                        }));
                        if (SelectedKry) {
                            updateFieldMasterValue('kode_relasi', SelectedKry.emp_id);
                            updateFieldMasterValue('no_subledger', SelectedKry.emp_no);
                            updateFieldMasterValue('nama_subledger', SelectedKry.Full_Name);
                            if (state === 'edit') {
                                setDsMaster((prev) => ({
                                    ...prev,
                                    Old_no_subledger: OldNoSubledger,
                                }));
                            }
                        }
                    }}
                    entitas={entitas}
                    token={token}
                />
            ) : visibleInput.FrmCustomerDlg ? (
                <FrmCustomerDlg
                    isOpen={visibleInput.FrmCustomerDlg}
                    onClose={function (selectedCustomer: any): void {
                        setVisibleInput((prev) => ({
                            ...prev,
                            FrmCustomerDlg: false,
                        }));
                        if (selectedCustomer) {
                            updateFieldMasterValue('kode_relasi', selectedCustomer.kode_cust);
                            updateFieldMasterValue('no_subledger', selectedCustomer.no_cust);
                            updateFieldMasterValue('nama_subledger', selectedCustomer.nama_relasi);
                            if (state === 'edit') {
                                setDsMaster((prev) => ({
                                    ...prev,
                                    Old_no_subledger: OldNoSubledger,
                                }));
                            }
                        }
                    }}
                    entitas={entitas}
                    token={token}
                />
            ) : visibleInput.FrmSupplierDlg ? (
                // <FrmSupplierDlg
                //     isOpen={visibleInput.FrmSupplierDlg}
                //     onClose={function (): void {
                //         setVisibleInput((prev) => ({
                //             ...prev,
                //             FrmSupplierDlg: false,
                //         }));
                //     }}
                //     entitas={entitas}
                //     token={token}
                // />
                <></>
            ) : visibleInput.FrmSalesDlg ? (
                <FrmSalesDlg
                    isOpen={visibleInput.FrmSalesDlg}
                    onClose={function (selectedSales: any): void {
                        setVisibleInput((prev) => ({
                            ...prev,
                            FrmSalesDlg: false,
                        }));
                        if (selectedSales) {
                            updateFieldMasterValue('kode_relasi', selectedSales.kode_sales);
                            updateFieldMasterValue('no_subledger', selectedSales.no_sales);
                            updateFieldMasterValue('nama_subledger', selectedSales.nama_sales);
                            if (state === 'edit') {
                                setDsMaster((prev) => ({
                                    ...prev,
                                    Old_no_subledger: OldNoSubledger,
                                }));
                            }
                        }
                    }}
                    entitas={entitas}
                    token={token}
                />
            ) : null}
        </>
    );
};

export default FrmDialogSubledger;
