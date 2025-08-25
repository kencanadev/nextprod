import React, { useEffect, useRef, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Filter, Resize, Selection, CommandColumn } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, Inject } from '@syncfusion/ej2-react-calendars';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { ButtonProps, ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import moment from 'moment';
import { cekGenBesi, getListGenerateData, simpanGenerateData } from '../api';
import { TemplateCheckboxGenerate, TemplateCheckboxSimpan } from '../template';

type DialogGenerateJadwalProps = {
    isOpen: boolean;
    onClose: () => void;
    token: string;
    kode_entitas: string;
    activeTab: string;
    userid: string;
    onRefresh: any;
};

const DialogGenerateJadwal: React.FC<DialogGenerateJadwalProps> = ({ isOpen, onClose, kode_entitas, token, activeTab, userid, onRefresh }) => {
    const [tglGenerate, setTglGenerate] = useState(moment());
    const [tglBatasWaktu, setTglBatasWaktu] = useState(moment().startOf('years').add(7, 'days'));
    const [checkboxMingguan, setCheckboxMingguan] = useState(true);
    const [dummyFucntion, setdummyFucntion] = useState([]);
    const [checkboxKeseluruhan, setCheckboxKeseluruhan] = useState(true);

    const [data, setData] = useState<any[]>([]);

    const generateListRef = useRef<GridComponent | any>(null);

    const rowRice = (args: any) => {
        const rowData = args.data as any;
        if (rowData.simpan === 'Y') {
            args.row.style.backgroundColor = '#b0ffe9'; //
        }
    };

    const generateDataAwal = async () => {
        const arr = [];
        if (checkboxMingguan) {
            arr.push('M');
        }
        if (checkboxKeseluruhan) {
            arr.push('A');
        }

        const params = {
            entitas: kode_entitas,
            param1: activeTab === 'besi' ? 'Besi' : 'NonBesi',
            param2: tglGenerate.format('YYYY-MM-DD'),
            param3: tglBatasWaktu.format('YYYY-MM-DD'),
            param4: arr.join(';'),
        };

        try {
            const response = await getListGenerateData({ params, token, setTglBatasWaktu });
            let modifiedData: any[] = [];
            if (activeTab === 'besi') {
                const validationResults = response.map(async (item: any) => {
                    const params2 = {
                        entitas: kode_entitas,
                        param1: item.kode_item,
                    };
                    const validasiGenBesi = await cekGenBesi({ params: params2, token });
                    // console.log({ validasiGenBesi, item });

                    return {
                        ...item,
                        generate: validasiGenBesi.length > 0 ? 'Y' : 'N',
                        tanda: validasiGenBesi.length > 0 ? 'Y' : 'N',
                        stok_utama: item.stok_utama === null ? null : parseFloat(item.stok_utama),
                        stok_transit: item.stok_transit === null ? null : parseFloat(item.stok_transit),
                        stok_ttb: item.stok_ttb === null ? null : parseFloat(item.stok_ttb),
                    };
                });

                modifiedData = await Promise.all(validationResults);

                modifiedData = modifiedData.sort((a, b) => {
                    const getNumber = (str: string) => parseInt(str.replace(/[^\d]/g, ''), 10);

                    return getNumber(b.kelompok) - getNumber(a.kelompok); // Descending
                });

                // console.log(modifiedData);

                let n = 0;
                let s = 'N';

                // Pastikan tidak melebihi panjang array
                const subset = modifiedData.slice(0, 8);

                // Hitung total stok_utama dengan validasi nilai null/undefined
                for (const item of subset) {
                    n += item.stok_utama ? parseFloat(item.stok_utama) : 0;
                }

                if (n <= 800) {
                    // Ubah 7 data awal dengan properti `simpan: 'Y'`
                    modifiedData = modifiedData.map((item, index) => (index < 8 ? { ...item, simpan: 'Y' } : item));
                    s = 'Y';
                }

                if (s === 'N' && modifiedData.length > 0) {
                    // Ubah data pertama jika masih 'N' dan array tidak kosong
                    modifiedData[0] = { ...modifiedData[0], simpan: 'Y' };
                }
            } else {
                if (response.length > 0) {
                    let s = response[0].kategori;
                    let n = response.filter((item: any) => item.kategori === s).length;
                    let count = 0;

                    modifiedData = response.map((item: any, index: number) => {
                        let simpan = 'N';

                        console.log({ n, s });

                        if (n <= 5) {
                            s = response[0].kategori;
                            if (item.kategori === s) {
                                simpan = 'Y';
                            }
                        } else {
                            s = response[0].kelompok;
                            if (item.kelompok === s && count < 5) {
                                simpan = 'Y';
                                count++;
                            }
                        }

                        return {
                            ...item,
                            simpan,
                            stok_utama: item.stok_utama === null ? null : parseFloat(item.stok_utama),
                            stok_transit: item.stok_transit === null ? null : parseFloat(item.stok_transit),
                            stok_ttb: item.stok_ttb === null ? null : parseFloat(item.stok_ttb),
                        };
                    });
                }
            }

            // console.log('modifiedData', modifiedData);
            modifiedData = modifiedData.map((item) => (item.tanda === 'Y' ? { ...item, simpan: 'N' } : item));

            setData(modifiedData);
            generateListRef.current.setProperties({ dataSource: modifiedData });
            generateListRef.current.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const generateData = async () => {
        const arr = [];
        if (checkboxMingguan) {
            arr.push('M');
        }
        if (checkboxKeseluruhan) {
            arr.push('A');
        }

        const params = {
            entitas: kode_entitas,
            param1: activeTab === 'besi' ? 'Besi' : 'NonBesi',
            param2: tglGenerate.format('YYYY-MM-DD'),
            param3: tglBatasWaktu.format('YYYY-MM-DD'),
            param4: arr.join(';'),
        };

        try {
            const response = await getListGenerateData({ params, token, setdummyFucntion });
            let modifiedData: any[] = [];
            if (activeTab === 'besi') {
                const validationResults = response.map(async (item: any) => {
                    const params2 = {
                        entitas: kode_entitas,
                        param1: item.kode_item,
                    };
                    const validasiGenBesi = await cekGenBesi({ params: params2, token });
                    // console.log({ validasiGenBesi, item });

                    return {
                        ...item,
                        generate: validasiGenBesi.length > 0 ? 'Y' : 'N',
                        tanda: validasiGenBesi.length > 0 ? 'Y' : 'N',
                        stok_utama: item.stok_utama === null ? null : parseFloat(item.stok_utama),
                        stok_transit: item.stok_transit === null ? null : parseFloat(item.stok_transit),
                        stok_ttb: item.stok_ttb === null ? null : parseFloat(item.stok_ttb),
                    };
                });

                modifiedData = await Promise.all(validationResults);

                modifiedData = modifiedData.sort((a, b) => {
                    const getNumber = (str: string) => parseInt(str.replace(/[^\d]/g, ''), 10);

                    return getNumber(b.kelompok) - getNumber(a.kelompok); // Descending
                });

                // console.log(modifiedData);

                let n = 0;
                let s = 'N';

                // Pastikan tidak melebihi panjang array
                const subset = modifiedData.slice(0, 8);

                // Hitung total stok_utama dengan validasi nilai null/undefined
                for (const item of subset) {
                    n += item.stok_utama ? parseFloat(item.stok_utama) : 0;
                }

                if (n <= 800) {
                    // Ubah 7 data awal dengan properti `simpan: 'Y'`
                    modifiedData = modifiedData.map((item, index) => (index < 8 ? { ...item, simpan: 'Y' } : item));
                    s = 'Y';
                }

                if (s === 'N' && modifiedData.length > 0) {
                    // Ubah data pertama jika masih 'N' dan array tidak kosong
                    modifiedData[0] = { ...modifiedData[0], simpan: 'Y' };
                }
            } else {
                if (response.length > 0) {
                    let s = response[0].kategori;
                    let n = response.filter((item: any) => item.kategori === s).length;
                    let count = 0;

                    modifiedData = response.map((item: any, index: number) => {
                        let simpan = 'N';

                        console.log({ n, s });

                        if (n <= 5) {
                            s = response[0].kategori;
                            if (item.kategori === s) {
                                simpan = 'Y';
                            }
                        } else {
                            s = response[0].kelompok;
                            if (item.kelompok === s && count < 5) {
                                simpan = 'Y';
                                count++;
                            }
                        }

                        return {
                            ...item,
                            simpan,
                            stok_utama: item.stok_utama === null ? null : parseFloat(item.stok_utama),
                            stok_transit: item.stok_transit === null ? null : parseFloat(item.stok_transit),
                            stok_ttb: item.stok_ttb === null ? null : parseFloat(item.stok_ttb),
                        };
                    });
                }
            }

            // console.log('modifiedData', modifiedData);
            modifiedData = modifiedData.map((item) => (item.tanda === 'Y' ? { ...item, simpan: 'N' } : item));

            setData(modifiedData);
            generateListRef.current.setProperties({ dataSource: modifiedData });
            generateListRef.current.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSimpanJadwal = async () => {
        const dataLength = generateListRef.current.dataSource.filter((item: any) => item.simpan === 'Y');
        //   const [checkboxMingguan, setCheckboxMingguan] = useState(true);
        //   const [checkboxKeseluruhan, setCheckboxKeseluruhan] = useState(true);
        let jenis;
        console.log({ dataLength });
        // if (checkboxMingguan && checkboxKeseluruhan) {
        //   if ()
        // }

        for (const item of dataLength) {
            const hari = tglBatasWaktu.format('dddd').toLowerCase();

            // Jika Jumat
            if (hari === 'jumat') {
                if (checkboxMingguan && checkboxKeseluruhan) {
                    if (item.stok_utama <= 100 && item.stok_ttb === 0) {
                        jenis = 'MPA';
                    } else if (item.stok_utama >= 100 && item.stok_ttb > 0) {
                        jenis = 'MTA';
                    } else if (item.stok_utama <= 100 && item.stok_ttb > 0) {
                        jenis = 'MPTA';
                    } else {
                        jenis = 'MA';
                    }
                } else if (checkboxMingguan && !checkboxKeseluruhan) {
                    if (item.stok_utama <= 100 && item.stok_ttb === 0) {
                        jenis = 'MP';
                    } else if (item.stok_utama >= 100 && item.stok_ttb > 0) {
                        jenis = 'MT';
                    } else if (item.stok_utama <= 100 && item.stok_ttb > 0) {
                        jenis = 'MPT';
                    } else {
                        jenis = 'M';
                    }
                } else if (!checkboxMingguan && checkboxKeseluruhan) {
                    if (item.stok_utama <= 100 && item.stok_ttb === 0) {
                        jenis = 'PA';
                    } else if (item.stok_utama >= 100 && item.stok_ttb > 0) {
                        jenis = 'TA';
                    } else if (item.stok_utama <= 100 && item.stok_ttb > 0) {
                        jenis = 'PTA';
                    } else {
                        jenis = 'A';
                    }
                } else {
                    if (item.stok_utama <= 100 && item.stok_ttb === 0) {
                        jenis = 'P';
                    } else if (item.stok_utama >= 100 && item.stok_ttb > 0) {
                        jenis = 'T';
                    } else if (item.stok_utama <= 100 && item.stok_ttb > 0) {
                        jenis = 'PT';
                    }
                }
            } else {
                if (!checkboxMingguan && checkboxKeseluruhan) {
                    if (item.stok_utama <= 100 && item.stok_ttb === 0) {
                        jenis = 'PA';
                    } else if (item.stok_utama >= 100 && item.stok_ttb > 0) {
                        jenis = 'TA';
                    } else if (item.stok_utama <= 100 && item.stok_ttb > 0) {
                        jenis = 'PTA';
                    } else {
                        jenis = 'A';
                    }
                } else if (!checkboxMingguan && !checkboxKeseluruhan) {
                    if (item.stok_utama <= 100 && item.stok_ttb === 0) {
                        jenis = 'P';
                    } else if (item.stok_utama >= 100 && item.stok_ttb > 0) {
                        jenis = 'T';
                    } else if (item.stok_utama <= 100 && item.stok_ttb > 0) {
                        jenis = 'PT';
                    }
                }
            }

            const body = {
                entitas: kode_entitas,
                dok_opname: activeTab === 'besi' ? 'OB' : 'ON',
                tgl_generate: tglGenerate.format('YYYY-MM-DD HH:mm:ss'),
                tgl_opname: tglBatasWaktu.format('YYYY-MM-DD HH:mm:ss'),
                kode_item: item.kode_item,
                jenis: jenis,
                hasil: 'N',
                jml_berat: 0,
                jml_qty: 0,
                jml_utuh: 0,
                jml_patah: 0,
                jml_rusak: 0,
                jml_panjang: 0,
                tgl_sistem: null,
                jml_sistem: 0,
                ket_sistem: null,
                jml_ttb: 0,
                ket_ttb: null,
                user_app1: null,
                tgl_app1: null,
                user_app2: null,
                tgl_app2: null,
                user_app3: null,
                tgl_app3: null,
                user_app4: null,
                tgl_app4: null,
                applevel: '0',
                komplit: 'N',
                team: null,
                catatan: null,
                nota: null,
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                jam_mulai: null,
                jam_selesai: null,
                jenis_mb: 'N',
                jenis_ps: 'N',
                jenis_sesuai: null,
            };

            // console.log(body);
            const res = await simpanGenerateData({ body, token });
            if (res.status) {
                onClose();
                onRefresh();
            }
        }
    };

    useEffect(() => {
        generateDataAwal();
    }, []);

    const buttonsSimpanJadwal: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'Simpan',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: handleSimpanJadwal,
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: onClose,
        },
    ];

    return (
        <DialogComponent
            id="dialogGenerateJadwal"
            target="#main-target"
            header="Generate Jadwal Stok Opname"
            isModal
            allowDragging
            showCloseIcon
            width={'80%'}
            height={'85%'}
            close={onClose}
            visible={isOpen}
            enableResize
            buttons={buttonsSimpanJadwal}
        >
            <div className="p-2 text-black">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {/* Tanggal Generate Data */}
                        <div className="flex items-center gap-1">
                            <span className="w-fit text-xs font-bold">Tgl. Generate Data :</span>
                            <div className="form-input mt-1 flex w-32 justify-between">
                                <DatePickerComponent
                                    locale="id"
                                    style={{ fontSize: '12px' }}
                                    cssClass="e-custom-style"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={tglGenerate.toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        // updateStateFilter('tglAwal', moment(args.value));
                                        setTglGenerate(moment(args.value));
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        </div>
                        {/* Tanggal Batas Waktu */}
                        <div className="flex items-center gap-1">
                            <span className="w-fit bg-yellow-200 p-1 text-xs font-bold">Tgl. Batas Waktu :</span>
                            <div className="form-input mt-1 flex w-32 justify-between">
                                <DatePickerComponent
                                    locale="id"
                                    style={{ fontSize: '12px' }}
                                    cssClass="e-custom-style"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={tglBatasWaktu.toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        // updateStateFilter('tglAwal', moment(args.value));
                                        setTglBatasWaktu(moment(args.value));
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        </div>
                        {/* Button Generate */}
                        <button className="btn mt-1 bg-black text-white" onClick={generateData}>
                            Generate Data
                        </button>
                        {/* Checkbox Mingguan */}
                        <div className="ml-5 mt-2 flex justify-between">
                            <CheckBoxComponent
                                label="(M) Mingguan"
                                checked={checkboxMingguan}
                                change={(args: ChangeEventArgsButton) => {
                                    const value: any = args.checked;
                                    // updateStateFilter('isTglChecked', value);
                                    setCheckboxMingguan(value);
                                }}
                            />
                        </div>
                        {/* Checkbox Keselurhan */}
                        <div className="ml-5 mt-2 flex justify-between">
                            <CheckBoxComponent
                                label="(A) Keseluruhan"
                                checked={checkboxKeseluruhan}
                                change={(args: ChangeEventArgsButton) => {
                                    const value: any = args.checked;
                                    // updateStateFilter('isTglChecked', value);
                                    setCheckboxKeseluruhan(value);
                                }}
                            />
                        </div>
                    </div>
                    <span className="pr-5 text-2xl font-bold text-red-700">{activeTab === 'besi' ? 'BESI' : 'NON BESI'}</span>
                </div>
                {/* Grid */}
                <GridComponent ref={generateListRef} rowDataBound={rowRice} autoFit locale="id" gridLines="Both" height={300} dataSource={data} allowResizing className="mt-3">
                    <ColumnsDirective>
                        <ColumnDirective field="id" headerText="No" width={30} headerTextAlign="Center" textAlign="Right" />
                        <ColumnDirective field="no_item" headerText="No. Barang" width={70} headerTextAlign="Center" />
                        <ColumnDirective field="nama_item" headerText="Nama Barang" width={120} headerTextAlign="Center" />
                        <ColumnDirective field="kategori" headerText="Kategori" width={100} headerTextAlign="Center" />
                        <ColumnDirective field="kelompok" headerText="Kelompok" width={100} headerTextAlign="Center" />
                        <ColumnDirective field="simpan" headerText="Pilih" width={50} headerTextAlign="Center" template={(args: any) => TemplateCheckboxSimpan(args, generateListRef)} />
                        <ColumnDirective
                            field="generate"
                            headerTemplate={() => {
                                return (
                                    <div className="flex flex-col">
                                        <span>Pernah</span>
                                        <span>di Generate</span>
                                    </div>
                                );
                            }}
                            width={70}
                            headerTextAlign="Center"
                            template={TemplateCheckboxGenerate}
                        />
                        <ColumnDirective field="stok_utama" headerText="Stok GU" width={80} headerTextAlign="Center" textAlign="Right" />
                        <ColumnDirective field="stok_ttb" headerText="Stok TTB" width={80} headerTextAlign="Center" textAlign="Right" />
                        <ColumnDirective field="stok_transit" headerText="Stok TRANSIT" width={80} headerTextAlign="Center" textAlign="Right" />
                    </ColumnsDirective>
                    <Inject services={[Page, Selection, Filter, Resize, CommandColumn]} />
                </GridComponent>
            </div>
        </DialogComponent>
    );
};

export default DialogGenerateJadwal;
