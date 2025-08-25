import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DataManager } from '@syncfusion/ej2-data';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import * as ReactDom from 'react-dom';
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// Pakai fungsi dari routines ============================
import { DiskonByCalc, FillFromSQL, fetchPreferensi, frmNumber, generateNU, generateNUDivisi } from '@/utils/routines';
//========================================================
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import { GetDlgDetailSjItem, GetListEditRpe, GetMasterAlasan, PatchUpdateTtb, PostSimpanAudit, PostSimpanTtb } from '../model/api';
import { GetListEkspedisi, GetListPph } from '../model/apiRpe';
import { HandleFakturEkspedisiInput, HandleNamaEkspedisiChange, HandleNominalInvoiceInput, HandlePph23Change } from '../functional/fungsiFormRpe';
enableRipple(true);

interface templateHeaderRpeProps {
    userid: any;
    kode_entitas: any;
    entitas: any;
    token: any;
    onRenderDayCell: any;
    stateDataHeader: any;
    setStateDataHeader: any;
    setStateDataFooter: any;
    setDataBarang: any;
    masterKodeDokumen: any;
    masterDataState: any;
    stateDataFooter: any;
    dataBarang: any;
    stateDataArray: any;
    onRefreshTipe: any;
    refreshKeyNamaEkspedisi: any;
}

const TemplateHeaderRpe: React.FC<templateHeaderRpeProps> = ({
    userid,
    kode_entitas,
    entitas,
    token,
    onRenderDayCell,
    stateDataHeader,
    setStateDataHeader,
    setStateDataFooter,
    setDataBarang,
    masterKodeDokumen,
    masterDataState,
    stateDataFooter,
    dataBarang,
    stateDataArray,
    onRefreshTipe,
    refreshKeyNamaEkspedisi,
}: templateHeaderRpeProps) => {
    const paramObject = {
        kode_entitas: kode_entitas,
        vToken: token,
    };
    const [listEkspedisi, setListEkspedisi] = useState<[]>([]);
    const [listPph, setListPph] = useState<[]>([]);
    const dateGenerateNu = moment();
    const plagButtonJumlah = useRef('Bayar');

    useEffect(() => {
        const async = async () => {
            const responseListEkspedisi = await GetListEkspedisi(paramObject);
            const responseListPph = await GetListPph(paramObject);
            setListEkspedisi(responseListEkspedisi);
            setListPph(responseListPph);
            console.log('masuk baru 12= ', dataBarang?.nodes);
            if (masterDataState === 'BARU') {
                console.log('masuk baru = ');
                await generateNU(kode_entitas, '', '85', dateGenerateNu.format('YYYYMM'))
                    .then((result) => {
                        console.log('result = ', result);
                        setStateDataHeader((prevState: any) => ({
                            ...prevState,
                            noRpe: result,
                        }));
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });

                const totalData = dataBarang?.nodes.filter((item: any) => item.idChecked !== null).length; // abaikan yang null
                const totalChecked = dataBarang?.nodes.filter((item: any) => item.idChecked === 1).length;

                console.log('totalChecked === totalData = ', totalChecked, totalData);
                if (totalData === 0) {
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        disabledBatalInvoice: false,
                        disabledBayarAllInvoice: true,
                    }));
                    plagButtonJumlah.current = 'Bayar';
                } else if (totalChecked === totalData) {
                    // console.log('dataBarang = ', dataBarang);
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        disabledBatalInvoice: true,
                        disabledBayarAllInvoice: false,
                    }));
                    plagButtonJumlah.current = 'Batal';
                } else {
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        disabledBatalInvoice: false,
                        disabledBayarAllInvoice: false,
                    }));
                    plagButtonJumlah.current = 'Reset';
                }
            } else {
                console.log('dataBarang = ', dataBarang?.nodes, stateDataArray);
                // const hasPartialChecked = dataBarang?.nodes.some((item: any) => item.idChecked === 1);
                const totalData = dataBarang?.nodes.filter((item: any) => item.idChecked !== null).length; // abaikan yang null
                const totalChecked = dataBarang?.nodes.filter((item: any) => item.idChecked === 1).length;

                console.log('totalChecked === totalData = ', totalChecked, totalData);
                if (totalData === 0) {
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        disabledBatalInvoice: false,
                        disabledBayarAllInvoice: true,
                    }));
                    plagButtonJumlah.current = 'Bayar';
                } else if (totalChecked === totalData) {
                    // console.log('dataBarang = ', dataBarang);
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        disabledBatalInvoice: true,
                        disabledBayarAllInvoice: false,
                    }));
                    plagButtonJumlah.current = 'Batal';
                } else {
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        disabledBatalInvoice: false,
                        disabledBayarAllInvoice: false,
                    }));
                    plagButtonJumlah.current = 'Reset';
                }
            }
        };
        async();
    }, [onRefreshTipe, dataBarang?.nodes]);

    const handleParamsObject = {
        kode_entitas,
        setStateDataHeader,
        token,
        setDataBarang,
        masterKodeDokumen,
        setStateDataFooter,
        userid,
        entitas,
        onRenderDayCell,
        stateDataHeader,
        masterDataState,
        stateDataFooter,
        dataBarang,
    };

    const handleButtonContent = () => {
        let tipe: any;
        if (stateDataFooter?.totalTagihan === 0) {
            tipe = 'Bayar Semua Invoice';
        } else if (stateDataHeader?.disabledBayarAllInvoice === true) {
            tipe = 'Batal Semua Pembayaran';
        } else {
            tipe = 'Reset Pembayaran';
        }

        handleButtonBayarInvoice(tipe);
    };

    const handleButtonBayarInvoice = async (tipe: any) => {
        console.log('Data Tipe = ', tipe);
        if (tipe === 'Reset Pembayaran') {
            const newNodes = await dataBarang?.nodes.map((node: any) => {
                return {
                    ...node,
                    idChecked: 0,
                    waktuCeklis: 0,
                };
            });

            let totNettoRp: any;
            let beratTotal: any;
            let tambahanJarak: any;
            let totalKlaimEkspedisi: any;

            totNettoRp = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    // return acc + parseFloat(node.netto_rp);
                    return acc + parseFloat(node.total_rp);
                }
                return acc;
            }, 0);
            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);

            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
            const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

            await setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                totalTagihan: total_tagihan,
                nominalInvoice: stateDataHeader?.nominalInvoice,
                totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
                tambahanJarak: tambahanJarak,
            }));
            await setDataBarang({ nodes: newNodes });
        } else if (tipe === 'Bayar Semua Invoice') {
            const newNodes = await dataBarang?.nodes.map((node: any) => {
                return {
                    ...node,
                    idChecked: node.netto_rp,
                    waktuCeklis: 0,
                };
            });

            let totNettoRp: any;
            let beratTotal: any;
            let tambahanJarak: any;
            let totalKlaimEkspedisi: any;

            totNettoRp = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    // return acc + parseFloat(node.netto_rp);
                    return acc + parseFloat(node.total_rp);
                }
                return acc;
            }, 0);
            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);

            console.log('totNettoRp = ', totNettoRp, dataBarang?.nodes);

            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
            const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

            await setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                totalTagihan: total_tagihan,
                nominalInvoice: stateDataHeader?.nominalInvoice,
                totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
                tambahanJarak: tambahanJarak,
            }));
            await setStateDataHeader((prevState: any) => ({
                ...prevState,
                disabledBatalInvoice: true,
            }));

            await setDataBarang({ nodes: newNodes });
        } else if (tipe === 'Batal Semua Pembayaran') {
            const newNodes = await dataBarang?.nodes.map((node: any) => {
                return {
                    ...node,
                    idChecked: 0,
                    waktuCeklis: 0,
                };
            });

            let totNettoRp: any;
            let beratTotal: any;
            let tambahanJarak: any;
            let totalKlaimEkspedisi: any;

            totNettoRp = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    // return acc + parseFloat(node.netto_rp);
                    return acc + parseFloat(node.total_rp);
                }
                return acc;
            }, 0);
            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);

            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
            const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

            await setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                totalTagihan: total_tagihan,
                nominalInvoice: stateDataHeader?.nominalInvoice,
                totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
                tambahanJarak: tambahanJarak,
            }));
            await setDataBarang({ nodes: newNodes });
        }
    };

    const handleTglRpe = async (event: any) => {
        await setStateDataHeader((prevState: any) => ({
            ...prevState,
            tanggal: event,
        }));
    };

    return (
        <div className="mb-1">
            <div className="panel-tabel" style={{ width: '100%' }}>
                <div className="flex" style={{ marginBottom: '1px' }}>
                    <div style={{ width: '40%' }}>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', textAlign: 'right', marginRight: 6 }}>Tanggal </label>
                            <div className="form-input mt-1 flex justify-between" style={{ width: '20%', borderRadius: 2 }}>
                                <DatePickerComponent
                                    locale="id"
                                    cssClass="e-custom-style"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy "
                                    value={stateDataHeader?.tanggal.toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        handleTglRpe(moment(args.value));
                                    }}
                                    style={{ margin: '-5px' }}
                                    disabled={stateDataHeader?.disabledComponent}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '25%',
                                    marginTop: '14px',
                                }}
                            >
                                <div style={{ width: '100%', marginLeft: '74px' }}>
                                    <label
                                        style={{
                                            width: '65.5%',
                                            textAlign: 'center',
                                            marginTop: '-7px',
                                            background: 'green',
                                            marginLeft: '-11px',
                                            color: 'yellow',
                                        }}
                                    >
                                        Tgl. EFEKTIF
                                    </label>
                                </div>
                                <input
                                    className="container form-input"
                                    style={{
                                        background: '#eeeeee',
                                        fontSize: 11,
                                        borderColor: '#bfc9d4',
                                        width: '65%',
                                        borderRadius: 2,
                                        marginLeft: '27px',
                                        marginTop: '-5px',
                                    }}
                                    disabled={true}
                                    value={stateDataHeader?.tglEfektif.format('DD-MM-YYYY')}
                                    readOnly
                                ></input>
                            </div>
                        </div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', textAlign: 'right', marginRight: 6 }}>No. RPE</label>
                            <input
                                id="noRpe"
                                className={` container form-input`}
                                style={{
                                    background: '#eeeeee',
                                    fontSize: 11,
                                    marginTop: '-1px',
                                    marginLeft: 0,
                                    borderColor: '#bfc9d4',
                                    width: '20%',
                                    borderRadius: 2,
                                }}
                                disabled={true}
                                value={stateDataHeader?.noRpe}
                                readOnly
                            ></input>
                        </div>
                    </div>
                    <div style={{ width: '30%' }}>
                        {' '}
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', textAlign: 'right', marginRight: 6, marginTop: '5px' }}>Faktur Ekspedisi</label>
                            <input
                                id="fakturEkspedisi"
                                className={` container form-input`}
                                style={{
                                    fontSize: 11,
                                    marginTop: '2px',
                                    marginLeft: 0,
                                    borderColor: '#bfc9d4',
                                    width: '40%',
                                    borderRadius: 2,
                                }}
                                disabled={stateDataHeader?.disabledComponent}
                                onChange={(event: any) => {
                                    const valueObject = event.target.value;
                                    const mergerObject = {
                                        valueObject,
                                        ...handleParamsObject,
                                    };
                                    HandleFakturEkspedisiInput(mergerObject);
                                }}
                                // value={stateDataHeader?.noRpe}
                            ></input>
                        </div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', textAlign: 'right', marginRight: 6, marginTop: '17px' }}>Nama Ekspedisi</label>
                            <div
                                style={{
                                    fontSize: 11,
                                    marginTop: '8px',
                                    marginLeft: 0,
                                    width: '40%',
                                }}
                            >
                                <select
                                    className="form-select"
                                    style={{
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: '#bfc9d4',
                                        borderRadius: '4px',
                                        padding: '6px 8px',
                                        height: '32px',
                                        fontSize: 11,
                                    }}
                                    value={stateDataHeader?.namaEkspedisi || ''}
                                    onChange={(e) => {
                                        const valueObject = e.target.value;
                                        const mergerObject = {
                                            valueObject,
                                            ...handleParamsObject,
                                        };
                                        HandleNamaEkspedisiChange(mergerObject);
                                    }}
                                >
                                    <option value="">-- Silahkan Pilih Nama Ekspedisi --</option>
                                    {(listEkspedisi as { ekspedisi: string }[]).map((item, index) => (
                                        <option key={index} value={item.ekspedisi}>
                                            {item.ekspedisi}
                                        </option>
                                    ))}
                                </select>
                                {/* <DropDownListComponent
                                    // key={`dropdown-${refreshKeyNamaEkspedisi}`}
                                    // id="namaEkspedisi"
                                    className="form-select"
                                    dataSource={listEkspedisi}
                                    fields={{ text: 'ekspedisi', value: 'ekspedisi' }} // tampil & value pakai 'ekspedisi'
                                    placeholder="-- Silahkan Pilih Nama Ekspedisi --"
                                    value={stateDataHeader?.namaEkspedisi} // ini menampilkan ekspedisi dari state
                                    change={(args: ChangeEventArgsDropDown) => {
                                        const valueObject: any = args.value;
                                        const mergerObject = {
                                            valueObject,
                                            ...handleParamsObject,
                                        };
                                        HandleNamaEkspedisiChange(mergerObject);
                                    }}
                                    // value={selectedOptionAlasan}
                                /> */}
                                {/* <DropDownListComponent
                                    key={`dropdown-${refreshKeyNamaEkspedisi}`}
                                    id="namaEkspedisi"
                                    className="form-select"
                                    dataSource={listEkspedisi.map((data: any) => data.ekspedisi)}
                                    placeholder="-- Silahkan Pilih Nama Ekspedisi --"
                                    change={(args: ChangeEventArgsDropDown) => {
                                        const valueObject: any = args.value;
                                        const mergerObject = {
                                            valueObject,
                                            ...handleParamsObject,
                                        };
                                        HandleNamaEkspedisiChange(mergerObject);
                                    }}
                                    // value={selectedOptionAlasan}
                                /> */}
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '30%' }}>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', textAlign: 'right', marginTop: '17px', marginLeft: '20%' }}>PPH 23</label>
                            <div
                                className="container form-input"
                                style={{
                                    fontSize: 11,
                                    marginTop: '13px',
                                    marginLeft: '1%',
                                    borderColor: '#bfc9d4',
                                    width: '42%',
                                    borderRadius: 2,
                                }}
                            >
                                <DropDownListComponent
                                    // key={`dropdown-${refreshKeyAlasan1}`}
                                    id="catatanPph23"
                                    className="form-select"
                                    dataSource={listPph}
                                    placeholder="-- Silahkan Pilih PPH --"
                                    fields={{ text: 'catatan', value: 'kode_pajak' }}
                                    change={(args: ChangeEventArgsDropDown) => {
                                        const selectedCodes = args.value; // Mendapatkan kode yang dipilih sebagai array
                                        const selectedItems = listPph.filter((item: any) => item.kode_pajak === selectedCodes);
                                        const valueObject = selectedItems; // Mendapatkan objek lengkap berdasarkan kode
                                        const mergerObject = {
                                            valueObject,
                                            ...handleParamsObject,
                                        };
                                        HandlePph23Change(mergerObject);
                                    }}
                                    // value={selectedOptionAlasan}
                                />
                            </div>
                        </div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', textAlign: 'right', marginTop: '5px', marginLeft: '20%' }}>Nominal Invoice</label>
                            <input
                                id="nominalInvoice"
                                className={` container form-input`}
                                style={{
                                    fontSize: 11,
                                    marginTop: '2px',
                                    marginLeft: '1%',
                                    borderColor: '#bfc9d4',
                                    width: '42%',
                                    borderRadius: 2,
                                    textAlign: 'right',
                                }}
                                disabled={stateDataHeader?.disabledComponent}
                                onFocus={(event) => event.target.select()}
                                onBlur={(event: any) => {
                                    const valueObject = event.target.value;
                                    const mergerObject = {
                                        valueObject,
                                        ...handleParamsObject,
                                    };
                                    console.log('sadsafsdssafsfsaf');

                                    HandleNominalInvoiceInput(mergerObject);
                                }}
                                onKeyDown={(event) => {
                                    const char = event.key;
                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                    if (!isValidChar) {
                                        event.preventDefault();
                                    }
                                    const inputValue = (event.target as HTMLInputElement).value;
                                    if (char === '.' && inputValue.includes('.')) {
                                        event.preventDefault();
                                    }
                                }}
                                // value={stateDataHeader?.noRpe}
                            ></input>
                        </div>

                        <div className="mb-1 flex" style={{ alignItems: 'center' }}>
                            <label style={{ width: '21%', marginLeft: '20%' }}></label>
                            <ButtonComponent
                                id="buBayarAllFaktur"
                                content={stateDataFooter?.totalTagihan === 0 ? 'Bayar Semua Invoice' : stateDataHeader?.disabledBatalInvoice === true ? 'Batal Semua Pembayaran' : 'Reset Pembayaran'}
                                disabled={stateDataHeader?.disabledBayarAllInvoice === true ? true : false}
                                // disabled={(masterDataState === 'BARU') === true ? true : false}
                                cssClass="e-primary e-small"
                                // iconCss="e-icons e-small e-search"
                                style={
                                    plagButtonJumlah.current === 'Bayar'
                                        ? { width: '42%', backgroundColor: '#3b3f5c', marginTop: 2, color: '#c3c7cb', background: '#f1f2f3', marginLeft: '1%' }
                                        : { width: '42%', backgroundColor: '#3b3f5c', marginTop: 2, color: '#605a5a', background: '#eeeeee', marginLeft: '1%' }
                                }
                                // onClick={() => {
                                //     stateDataHeader?.disabledResetPembayaran === true
                                //         ? BayarSemuaFaktur(setDataBarang, setStateDataFooter, setStateDataHeader)
                                //         : ResetPembayaran(setDataBarang, setStateDataFooter, setStateDataHeader);
                                // }}
                                onClick={() => {
                                    handleButtonContent();
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex" style={{ alignItems: 'center', marginTop: -21, textAlign: 'left' }}>
                    <div style={{ width: '100%', color: 'green', marginLeft: '20px', marginBottom: '10px' }}>
                        <b>{stateDataHeader?.nominalInvoice !== '' ? '** ' + stateDataHeader?.terbilangJumlah + ' **' : ''}</b>
                    </div>
                    <div style={{ width: '75%' }}></div>
                </div>
            </div>
        </div>
    );
};

export default TemplateHeaderRpe;
