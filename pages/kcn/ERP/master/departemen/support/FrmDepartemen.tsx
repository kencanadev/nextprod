import React, { Fragment, useEffect, useRef, useState } from 'react';
import { CheckControlEditor, DepartementType, fetchSingleDepartemenData, postSimpanDepartemen, postUpdateDepartemen, swalToast } from '.';
import { Tab } from '@headlessui/react';
import { TextBoxComponent, ChangeEventArgs as ChangeEventArgsTextBox } from '@syncfusion/ej2-react-inputs';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
    departemenSelected: DepartementType;
    state: string;
    refresh: (refresh: string) => void;
}
const FrmDepartemenDlg = ({ isOpen = false, onClose, entitas, token, userid, state, departemenSelected, refresh }: Props) => {
    // Definition
    const stateData = useRef('');
    const [dsDepartemen, setDsDepartemen] = useState<DepartementType>({
        kode_dept: '',
        no_dept: '',
        nama_dept: '',
        aktif: 'Y',
        personal: null,
        catatan: null,
        userid: '',
        tgl_update: '',
    });
    const [loading, setLoading] = useState(false);
    const tabItems = [
        {
            Name: '1. Informasi',
            slug: 'informasi',
        },
    ];
    // Function
    //      {
    //     status: true,
    //     message: 'Create Departement Berhasil',
    //     data: { kode_dept: 'DP0000000012' }
    //   }
    const saveDoc = async (type: string) => {
        // try {
        const checked = CheckControlEditor(dsDepartemen);
        console.log('type = ', type);

        if (checked) {
            setLoading(true);
            if (state === 'edit') {
                const newJSON = {
                    ...dsDepartemen,
                    userid: userid.toUpperCase(),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                if (type === 'close' && stateData.current === '') {
                    await postUpdateDepartemen(entitas, token, newJSON).then((result) => {
                        if (result?.status) {
                            swalToast.fire({
                                icon: 'success',
                                title: `<p style="font-size:12px">Berhasil Menyimpan Departemen</p>`,
                                width: '100%',
                                target: '#FrmDepartemenDlg',
                            });
                        } else {
                            setLoading(false);
                        }
                    });
                    closeForm();
                    setLoading(false);
                } else if (type === 'next') {
                    stateData.current = 'next';
                    setDsDepartemen({
                        kode_dept: '',
                        no_dept: '',
                        nama_dept: '',
                        aktif: 'Y',
                        personal: null,
                        catatan: null,
                        userid: '',
                        tgl_update: '',
                    });
                    setLoading(false);
                    refresh('next');
                } else if (type === 'close' && stateData.current === 'next') {
                    await postSimpanDepartemen(entitas, token, newJSON).then((result) => {
                        if (result?.status) {
                            swalToast.fire({
                                icon: 'success',
                                title: `<p style="font-size:12px">Berhasil Menyimpan Departemen</p>`,
                                width: '100%',
                                target: '#FrmDepartemenDlg',
                            });
                        } else {
                            setLoading(false);
                        }
                    });
                    closeForm();
                    setLoading(false);
                }
            } else {
                const newJSON = {
                    ...dsDepartemen,
                    userid: userid.toUpperCase(),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                if (type === 'close' && stateData.current === '') {
                    await postSimpanDepartemen(entitas, token, newJSON).then((result) => {
                        if (result?.status) {
                            swalToast.fire({
                                icon: 'success',
                                title: `<p style="font-size:12px">Berhasil Menyimpan Departemen</p>`,
                                width: '100%',
                                target: '#FrmDepartemenDlg',
                            });
                        } else {
                            setLoading(false);
                        }
                    });
                    closeForm();
                    setLoading(false);
                } else if (type === 'next') {
                    stateData.current = 'next';
                    setDsDepartemen({
                        kode_dept: '',
                        no_dept: '',
                        nama_dept: '',
                        aktif: 'Y',
                        personal: null,
                        catatan: null,
                        userid: '',
                        tgl_update: '',
                    });
                    setLoading(false);
                    refresh('next');
                } else if (type === 'close' && stateData.current === 'next') {
                    await postSimpanDepartemen(entitas, token, newJSON).then((result) => {
                        if (result?.status) {
                            swalToast.fire({
                                icon: 'success',
                                title: `<p style="font-size:12px">Berhasil Menyimpan Departemen</p>`,
                                width: '100%',
                                target: '#FrmDepartemenDlg',
                            });
                        } else {
                            setLoading(false);
                        }
                    });
                    closeForm();
                    setLoading(false);
                }
            }
        }
    };
    const updateFieldMasterValue = (field: any, value: any) => {
        setDsDepartemen((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const closeForm = () => {
        setDsDepartemen({
            kode_dept: '',
            no_dept: '',
            nama_dept: '',
            aktif: 'Y',
            personal: null,
            catatan: null,
            userid: '',
            tgl_update: '',
        });
        onClose();
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

    const fetchDept = async () => {
        setLoading(true);
        const result = await fetchSingleDepartemenData(entitas, token, departemenSelected?.kode_dept);
        setTimeout(() => {
            setDsDepartemen(result);
            setLoading(false);
        }, 500);
    };
    // useEffect
    useEffect(() => {
        if (state === 'edit' && departemenSelected?.kode_dept !== '') {
            setLoading(true);
            fetchDept();
        }
    }, []);

    return (
        <DialogComponent
            id="FrmDepartemenDlg"
            name="FrmDepartemenDlg"
            target="#FrmDialogDepartemen"
            header={state === 'edit' || departemenSelected?.kode_dept !== '' ? 'Dept : ' + dsDepartemen.no_dept + ' - ' + dsDepartemen.nama_dept : 'Departemen Baru'}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="40%"
            height="55%"
            position={{ X: 'center', Y: 'center' }}
            style={{ position: 'fixed' }}
            buttons={buttonsInputData}
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
                                                <label htmlFor="no_dept" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                    No. Departemen
                                                </label>
                                                <div className="grid grid-cols-12 items-center justify-center gap-3">
                                                    <div className="col-span-9">
                                                        <div className="rounded border border-gray-300 px-2">
                                                            <TextBoxComponent
                                                                id="no_dept"
                                                                name="no_dept"
                                                                floatLabelType="Never"
                                                                value={dsDepartemen.no_dept}
                                                                change={(args: ChangeEventArgsTextBox) => {
                                                                    const value: any = args.value;
                                                                    updateFieldMasterValue('no_dept', value);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 flex">
                                                        <CheckBoxComponent
                                                            label="Non Aktif"
                                                            checked={dsDepartemen.aktif === 'N'}
                                                            change={(args: ChangeEventArgsButton) => {
                                                                const value: any = args.checked;
                                                                updateFieldMasterValue('aktif', value ? 'N' : 'Y');
                                                            }}
                                                            style={{ borderRadius: 3, borderColor: 'gray' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label htmlFor="nama_dept" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                    Nama Departemen
                                                </label>
                                                <div className="rounded border border-gray-300 px-2">
                                                    <TextBoxComponent
                                                        id="nama_dept"
                                                        name="nama_dept"
                                                        floatLabelType="Never"
                                                        value={dsDepartemen.nama_dept}
                                                        change={(args: ChangeEventArgsTextBox) => {
                                                            const value: any = args.value;
                                                            updateFieldMasterValue('nama_dept', value);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label htmlFor="personal" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                    Penanggung Jawab
                                                </label>
                                                <div className="rounded border border-gray-300 px-2">
                                                    <TextBoxComponent
                                                        id="personal"
                                                        name="personal"
                                                        floatLabelType="Never"
                                                        value={dsDepartemen.personal}
                                                        change={(args: ChangeEventArgsTextBox) => {
                                                            const value: any = args.value;
                                                            updateFieldMasterValue('personal', value);
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
                        <svg aria-hidden="true" className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </DialogComponent>
    );
};

export default FrmDepartemenDlg;
