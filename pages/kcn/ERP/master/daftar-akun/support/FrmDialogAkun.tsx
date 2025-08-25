import React, { Fragment, useEffect, useRef, useState } from 'react';
import { AkunType, fecthLookupAkun, fetchAkunData, fetchCheckSaldoAkun, postSimpanAkun, swalToast, tipeValue } from '.';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { Tab } from '@headlessui/react';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, ChangeEventArgs as ChangeEventArgsTextBox } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { FillFromSQL, frmNumber, GetInfo } from '@/utils/routines';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
    AkunSelected: string;
    state: string;
}
const FrmDialogAkun = ({ isOpen, onClose, entitas, token, userid, AkunSelected, state }: Props) => {
    // Definition
    const dataState = useRef(state);
    const dataAkunSelected = useRef(AkunSelected);
    console.log('state = ', state, AkunSelected);

    const [dsMaster, setDsMaster] = useState<AkunType>({
        kode_akun: '',
        no_akun: '',
        nama_akun: '',
        tipe: '',
        subtipe: '',
        aktif: 'Y',
        header: null,
        grp: 'N',
        kode_grp: null,
        tingkat: 1,
        normal: 'D',
        kode_mu: '',
        catatan: '',
        userid: '',
        tgl_update: '',
        kas: 'N',
        limit_bkk: '0',
        jenis: 'N',
        noakun: '',
        namaakun: '',
        balance: '',
    });
    const [loading, setLoading] = useState(false);
    const [dsKodeMu, setDsKodeMu] = useState<any[]>([]);
    const [dsLookupAkun, setDsLookupAkun] = useState<any[]>([]);
    const tabItems = [
        {
            Name: '1. Informasi',
            slug: 'informasi',
        },
    ];
    const closeForm = () => {
        setDsMaster({
            kode_akun: '',
            no_akun: '',
            nama_akun: '',
            tipe: '',
            subtipe: '',
            aktif: '',
            header: '',
            grp: '',
            kode_grp: null,
            tingkat: 1,
            normal: '',
            kode_mu: '',
            catatan: '',
            userid: '',
            tgl_update: '',
            kas: '',
            limit_bkk: '0',
            jenis: 'N',
            noakun: '',
            namaakun: '',
            balance: '',
        });
        onClose();
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
    const validationData = async () => {
        let isValid = true;
        if (dsMaster?.tipe === '') {
            isValid = false;

            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">Tipe Akun belum diisi.</p>`,
                width: '100%',
                target: '#FrmDialogAkun',
            });
            (document.querySelector('#tipe') as HTMLElement | null)?.focus();
            setLoading(false);
        } else if (dsMaster?.no_akun === '') {
            isValid = false;
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">No. Akun belum diisi.</p>`,
                width: '100%',
                target: '#FrmDialogAkun',
            });
            (document.querySelector('#no_akun') as HTMLElement | null)?.focus();
            setLoading(false);
        } else if (dsMaster?.nama_akun === '') {
            isValid = false;
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">Nama Akun belum diisi.</p>`,
                width: '100%',
                target: '#FrmDialogAkun',
            });
            (document.querySelector('#nama_akun') as HTMLElement | null)?.focus();
            setLoading(false);
        } else if (dsMaster?.aktif !== 'Y') {
            if (dataState.current === 'edit') {
                const checkSaldoAkun = await fetchCheckSaldoAkun(entitas, token, dsMaster?.kode_akun);
                if (checkSaldoAkun[0].balance <= 0) {
                    //
                } else {
                    isValid = false;
                    let message = `Saldo akun belum NOL = ${frmNumber(parseFloat(checkSaldoAkun[0].balance))}, Akun tidak bisa dinonaktifkan`;
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: `<p style="font-size:12px">${message}</p>`,
                        width: '100%',
                        target: '#FrmDialogAkun',
                    });
                }
            }
        }
        return isValid;
    };
    const saveDoc = async (buttonType: string) => {
        console.log(dsMaster);
        setLoading(true);
        try {
            const validation = await validationData();
            if (validation) {
                const newObject = {
                    entitas: entitas,
                    state: dataState.current === 'edit' ? 'update' : 'create',
                    ...dsMaster,
                    catatan: null,
                    header: 'N',
                    userid: userid.toUpperCase(),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                // setLoading(false);
                if (buttonType === 'save') {
                    await postSimpanAkun(entitas, token, newObject).then((response) => {
                        if (response?.status) {
                            withReactContent(swalToast).fire({
                                icon: 'success',
                                title: `<p style="font-size:12px">Data berhasil disimpan.</p>`,
                                width: '100%',
                                target: '#main-target',
                            });
                        } else {
                            setLoading(false);
                            withReactContent(swalToast).fire({
                                icon: 'error',
                                title: `<p style="font-size:12px">Data gagal disimpan.</p>`,
                                width: '100%',
                                target: '#FrmDialogAkun',
                            });
                        }
                    });
                    closeForm();
                } else {
                    dataState.current = 'create';
                    dataAkunSelected.current = '';
                    setDsMaster({
                        kode_akun: '',
                        no_akun: '',
                        nama_akun: '',
                        tipe: '',
                        subtipe: '',
                        aktif: 'Y',
                        header: null,
                        grp: 'N',
                        kode_grp: null,
                        tingkat: 1,
                        normal: 'D',
                        kode_mu: '',
                        catatan: '',
                        userid: '',
                        tgl_update: '',
                        kas: 'N',
                        limit_bkk: '0',
                        jenis: 'N',
                        noakun: '',
                        namaakun: '',
                        balance: '',
                    });
                    setLoading(false);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    const refreshData = async () => {
        setLoading(true);
        const newData = await fetchAkunData(entitas, token, {
            noAkunValue: dataAkunSelected.current,
            keteranganValue: 'all',
            tipeValue: 'all',
            nonAktifValue: 'all',
            levelAkunValue: 'all',
            isNoAkunChecked: true,
            isKeteranganChecked: false,
            isTipeChecked: false,
        });

        setDsMaster(newData[0]);
        if (
            newData[0].subtipe === 'Piutang Dagang' ||
            newData[0].subtipe === 'Hutang Dagang' ||
            newData[0].subtipe === 'Pendapatan Usaha' ||
            newData[0].subtipe === 'Pendapatan Usaha Lain' ||
            newData[0].subtipe === 'Beban Usaha' ||
            newData[0].subtipe === 'Beban Usaha Lain' ||
            newData[0].subtipe === 'Beban Adm dan Umum'
        ) {
            const lookupakun = await fecthLookupAkun(entitas, token, {
                param1: dataState.current === 'edit' ? `aktif="Y" and subtipe="${newData[0].subtipe}" and kode_akun <> "${newData[0].kode_akun}"` : `aktif="Y" and subtipe="${newData[0].subtipe}"`,
            });
            setDsLookupAkun(lookupakun);
        } else {
            const lookupakun = await fecthLookupAkun(entitas, token, {
                param1: dataState.current === 'edit' ? `aktif="Y" and tipe="${newData[0].subtipe}" and kode_akun <> "${newData[0].kode_akun}"` : `aktif="Y" and tipe="${newData[0].subtipe}"`,
            });
            setDsLookupAkun(lookupakun);
        }
    };
    const updateFieldMasterValue = (field: any, value: any) => {
        setDsMaster((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const buttonsInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'Berikut',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => saveDoc('next'),
        },
        {
            buttonModel: {
                content: 'Simpan',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => saveDoc('save'),
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
    // useEffect
    useEffect(() => {
        const refreshMU = async () => {
            const newData = await FillFromSQL(entitas, 'mu', '', token);
            setDsKodeMu(newData);

            const getInfo = await GetInfo(entitas);

            setDsMaster((prev) => ({
                ...prev,
                kode_mu: getInfo[0].kode_mu ?? '',
            }));
        };
        refreshMU();
    }, []);

    useEffect(() => {
        if (AkunSelected) {
            refreshData();

            setTimeout(() => {
                setLoading(false);
            }, 500);
        }
    }, [AkunSelected]);

    return (
        <DialogComponent
            id="FrmDialogAkun"
            name="FrmDialogAkun"
            target="#daftarAkun"
            header={dataState.current === 'edit' || dataAkunSelected.current !== '' ? 'Akun : ' + dsMaster?.no_akun + ' - ' + dsMaster?.nama_akun : 'Akun Baru'}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="40%"
            height="65%"
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
                <div className="relative block ">
                    <div className={`${loading && 'opacity-20'}`}>
                        <Tab.Group defaultIndex={0}>
                            <Tab.List className="flex max-h-20 w-full flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                {tabItems.map((item: { Name: string; slug: string }, index: number) => (
                                    <Tab key={index} as={Fragment}>
                                        {({ selected }) => (
                                            <button
                                                onClick={() => {}}
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
                                            <div>
                                                <div className="mb-2">
                                                    <label htmlFor="tipe" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                        Tipe
                                                    </label>
                                                    <div className="rounded border border-gray-300 px-2">
                                                        {dataState.current === 'edit' || dataAkunSelected.current !== '' ? (
                                                            <TextBoxComponent
                                                                name="tipe"
                                                                placeholder="Tipe"
                                                                floatLabelType="Never"
                                                                value={dsMaster?.tipe}
                                                                style={{
                                                                    cursor: 'not-allowed',
                                                                }}
                                                                readOnly
                                                                disabled
                                                            />
                                                        ) : (
                                                            <ComboBoxComponent
                                                                id="tipe"
                                                                dataSource={tipeValue}
                                                                change={async (args: ChangeEventArgsDropDown) => {
                                                                    const value: any = args.value;
                                                                    updateFieldMasterValue('tipe', value);
                                                                    updateFieldMasterValue('subtipe', value);
                                                                    if (
                                                                        value === 'Kas' ||
                                                                        value === 'Piutang' ||
                                                                        value === 'Persediaan' ||
                                                                        value === 'Aktiva Lancar Lainnya' ||
                                                                        value === 'Aktiva Tetap' ||
                                                                        value === 'Akumulasi Penyusutan'
                                                                    ) {
                                                                        updateFieldMasterValue('normal', 'D');
                                                                    } else if (
                                                                        value === 'Kas' ||
                                                                        value === 'Piutang' ||
                                                                        value === 'Persediaan' ||
                                                                        value === 'Aktiva Lancar Lainnya' ||
                                                                        value === 'Aktiva Tetap' ||
                                                                        value === 'Akumulasi Penyusutan'
                                                                    ) {
                                                                        updateFieldMasterValue('normal', 'K');
                                                                    } else if (value === 'Pendapatan' || value === 'Pendapatan Lain-Lain') {
                                                                        updateFieldMasterValue('normal', 'K');
                                                                    } else if (value === 'HPP' || value === 'Beban' || value === 'Beban Lain-Lain') {
                                                                        updateFieldMasterValue('normal', 'D');
                                                                    }
                                                                    if (
                                                                        value === 'Piutang Dagang' ||
                                                                        value === 'Hutang Dagang' ||
                                                                        value === 'Pendapatan Usaha' ||
                                                                        value === 'Pendapatan Usaha Lain' ||
                                                                        value === 'Beban Usaha' ||
                                                                        value === 'Beban Usaha Lain' ||
                                                                        value === 'Beban Adm dan Umum'
                                                                    ) {
                                                                        const lookupakun = await fecthLookupAkun(entitas, token, {
                                                                            param1:
                                                                                dataState.current === 'edit' ? `aktif="Y" and subtipe="${value}" and kode_akun <>` : `aktif="Y" and subtipe="${value}"`,
                                                                        });
                                                                        setDsLookupAkun(lookupakun);
                                                                    } else {
                                                                        const lookupakun = await fecthLookupAkun(entitas, token, {
                                                                            param1: dataState.current === 'edit' ? `aktif="Y" and tipe="${value}" and kode_akun <>` : `aktif="Y" and tipe="${value}"`,
                                                                        });
                                                                        setDsLookupAkun(lookupakun);
                                                                    }
                                                                }}
                                                                value={dsMaster?.tipe}
                                                                showClearButton={false}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <label htmlFor="no_akun" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                        No. Akun
                                                    </label>
                                                    <div className="rounded border border-gray-300 px-2">
                                                        <TextBoxComponent
                                                            id="no_akun"
                                                            name="no_akun"
                                                            placeholder="No. Akun"
                                                            floatLabelType="Never"
                                                            value={dsMaster?.no_akun}
                                                            change={(args: ChangeEventArgsTextBox) => {
                                                                const value: any = args.value;
                                                                updateFieldMasterValue('no_akun', value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2 flex">
                                                    <CheckBoxComponent
                                                        label="Akun Kas (Pendanaan)"
                                                        checked={dsMaster?.kas === 'Y'}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            updateFieldMasterValue('kas', value ? 'Y' : 'N');
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mb-2 flex">
                                                    <CheckBoxComponent
                                                        label="Non Aktif"
                                                        checked={dsMaster?.aktif === 'N'}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            updateFieldMasterValue('aktif', value ? 'N' : 'Y');
                                                        }}
                                                        disabled={dsMaster?.header === 'Y'}
                                                        readOnly={dsMaster?.header === 'Y'}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mb-2">
                                                    <label htmlFor="nama_akun" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                        Keterangan
                                                    </label>
                                                    <div className="rounded border border-gray-300 px-2">
                                                        <TextBoxComponent
                                                            id="nama_akun"
                                                            name="nama_akun"
                                                            floatLabelType="Never"
                                                            value={dsMaster?.nama_akun}
                                                            change={(args: ChangeEventArgsTextBox) => {
                                                                const value: any = args.value;
                                                                updateFieldMasterValue('nama_akun', value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {dsMaster?.tipe === 'Kas' || dsMaster?.tipe === 'Piutang Dagang' || dsMaster?.tipe === 'Hutang Dagang' ? (
                                                    <div className="mb-2">
                                                        <label htmlFor="kode_mu" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            Mata Uang
                                                        </label>
                                                        <div className="rounded border border-gray-300 px-2">
                                                            {dataState.current === 'edit' || dataAkunSelected.current !== '' ? (
                                                                <TextBoxComponent
                                                                    name="kode_mu"
                                                                    placeholder="Mata Uang"
                                                                    floatLabelType="Never"
                                                                    value={dsMaster?.kode_mu}
                                                                    style={{
                                                                        cursor: 'not-allowed',
                                                                    }}
                                                                    readOnly
                                                                    disabled
                                                                />
                                                            ) : (
                                                                <ComboBoxComponent
                                                                    id="kode_mu"
                                                                    dataSource={dsKodeMu}
                                                                    change={(args: ChangeEventArgsDropDown) => {
                                                                        const value: any = args.value;
                                                                        updateFieldMasterValue('kode_mu', value);
                                                                    }}
                                                                    fields={{ text: 'kode_mu', value: 'kode_mu' }}
                                                                    value={dsMaster?.kode_mu}
                                                                    showClearButton={false}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="mb-2 flex">
                                                    <CheckBoxComponent
                                                        label="Bagian dari Akun"
                                                        checked={dsMaster?.grp === 'Y'}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            if (!value) {
                                                                updateFieldMasterValue('kode_grp', null);
                                                                updateFieldMasterValue('tingkat', 1);
                                                            }
                                                            updateFieldMasterValue('grp', value ? 'Y' : 'N');
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                {dsMaster?.grp === 'Y' && (
                                                    <div className="mb-2">
                                                        <div className="rounded border border-gray-300 px-2">
                                                            <ComboBoxComponent
                                                                id="kodeGrup"
                                                                dataSource={dsLookupAkun}
                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                    const value: any = args.value;
                                                                    updateFieldMasterValue('kode_grp', value);
                                                                    const newTingkat = dsLookupAkun.find((item: any) => item.kode_akun === value);
                                                                    if (newTingkat) {
                                                                        updateFieldMasterValue('tingkat', newTingkat.tingkat + 1);
                                                                    }
                                                                }}
                                                                fields={{ text: 'nama_akun', value: 'kode_akun' }}
                                                                headerTemplate={headerTemplate}
                                                                itemTemplate={itemTemplate}
                                                                showClearButton={false}
                                                                value={dsMaster?.kode_grp}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mb-2">
                                                    <label htmlFor="limit_bkk" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                        Limit BKK
                                                    </label>
                                                    <div className="rounded border border-gray-300 px-2">
                                                        <TextBoxComponent
                                                            name="limit_bkk"
                                                            floatLabelType="Never"
                                                            value={dsMaster?.limit_bkk ? parseFloat(dsMaster?.limit_bkk).toLocaleString('en-US') : '0'}
                                                            onChange={(args: any) => {
                                                                const value: any = args.target.value;
                                                                updateFieldMasterValue('limit_bkk', value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <label htmlFor="jenis" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                        Jenis Akun
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        <RadioButtonComponent
                                                            id="jenis"
                                                            name="jenis"
                                                            value="F"
                                                            label="Fixed Cost"
                                                            checked={dsMaster?.jenis === 'F'}
                                                            change={(args: ChangeEventArgsButton) => {
                                                                updateFieldMasterValue('jenis', 'F');
                                                            }}
                                                        />
                                                        <RadioButtonComponent
                                                            id="jenis"
                                                            name="jenis"
                                                            value="V"
                                                            label="Variabel Cost"
                                                            checked={dsMaster?.jenis === 'V'}
                                                            change={(args: ChangeEventArgsButton) => {
                                                                updateFieldMasterValue('jenis', 'V');
                                                            }}
                                                        />
                                                        <RadioButtonComponent
                                                            id="jenis"
                                                            name="jenis"
                                                            value="N"
                                                            label="Netral Cost"
                                                            checked={dsMaster?.jenis === 'N'}
                                                            change={(args: ChangeEventArgsButton) => {
                                                                updateFieldMasterValue('jenis', 'N');
                                                            }}
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
    );
};

export default FrmDialogAkun;
