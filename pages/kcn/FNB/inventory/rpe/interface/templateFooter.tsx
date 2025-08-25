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
import { DiskonByCalc, FillFromSQL, fetchPreferensi, frmNumber, generateNU, generateNUDivisi, tanpaKoma } from '@/utils/routines';
//========================================================

import { useRouter } from 'next/router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import { GetDlgDetailSjItem, GetListEditRpe, GetMasterAlasan, PatchUpdateTtb, PostSimpanAudit, PostSimpanTtb } from '../model/api';
import { divNilaiStyle, lableStyle, nilaiStyles } from './template';
import { string } from 'yup';
enableRipple(true);

interface templateFooterRpeProps {
    userid: any;
    kode_entitas: any;
    entitas: any;
    token: any;
    stateDataHeader: any;
    setStateDataHeader: any;
    setStateDataFooter: any;
    stateDataFooter: any;
    dataBarang: any;
}

const TemplateFooterRpe: React.FC<templateFooterRpeProps> = ({
    userid,
    kode_entitas,
    entitas,
    token,
    stateDataHeader,
    setStateDataHeader,
    setStateDataFooter,
    stateDataFooter,
    dataBarang,
}: templateFooterRpeProps) => {
    const handleBiayaLainLain = async (event: any) => {
        await setStateDataFooter((prevState: any) => ({
            ...prevState,
            biayaLainLain: parseFloat(tanpaKoma(event)),
        }));

        // console.log('xxxxxxxxxxxxxxx = ', parseFloat(tanpaKoma(event)));

        const biayaLainLain = (await document.getElementById('biayaLainLain')) as HTMLInputElement;
        if (biayaLainLain) {
            biayaLainLain.value = frmNumber(tanpaKoma(event));
        }

        const newNodes = await dataBarang.nodes.map((node: any) => {
            return node;
        });

        let totalKlaimEkspedisi: any;

        totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_klaim_ekspedisi);
            }
            return acc;
        }, 0);

        const total_tagihan = parseFloat(stateDataFooter?.subTotal) + parseFloat(stateDataFooter?.tambahanJarak) + parseFloat(tanpaKoma(event));
        const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
        const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
        const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

        console.log('bbbbbbbb = ', stateDataFooter?.potonganEkspedisiLain);
        setStateDataFooter((prevState: any) => ({
            ...prevState,
            totalTagihan: total_tagihan,
            totalBayar: total_bayar,
            totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
            nilaiPph23: nilai_pph23,
            potonganEkspedisiLain: potongan_ekspedisi,
            totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
        }));
    };

    const handlePotonganEkspedisiLain = async (event: any) => {
        await setStateDataFooter((prevState: any) => ({
            ...prevState,
            potonganEkspedisiLain: parseFloat(tanpaKoma(event)),
        }));

        const potonganEkspedisi = document.getElementById('potonganEkspedisi') as HTMLInputElement;
        if (potonganEkspedisi) {
            potonganEkspedisi.value = frmNumber(tanpaKoma(event));
        }

        const newNodes = await dataBarang.nodes.map((node: any) => {
            return node;
        });

        let totalKlaimEkspedisi: any;

        totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_klaim_ekspedisi);
            }
            return acc;
        }, 0);

        const total_tagihan = parseFloat(stateDataFooter?.subTotal) + parseFloat(stateDataFooter?.tambahanJarak) + parseFloat(stateDataFooter?.biayaLainLain);
        const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
        const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
        const potongan_ekspedisi = total_bayar > 0 ? (event === '' ? 0 : parseFloat(tanpaKoma(event))) : 0;

        setStateDataFooter((prevState: any) => ({
            ...prevState,
            totalTagihan: total_tagihan,
            totalBayar: total_bayar,
            totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
            nilaiPph23: nilai_pph23,
            totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
        }));
    };

    const handleKeterangan = (event: any, tipe: any) => {
        if (tipe === 'keteranganBiayalainLain') {
            setStateDataFooter((prevState: any) => ({
                ...prevState,
                keteranganBiayaLainLain: event,
            }));
        } else {
            setStateDataFooter((prevState: any) => ({
                ...prevState,
                ketPotonganEkspedisiLain: event,
            }));
        }
    };

    return (
        <div className="flex" style={{ height: '160px' }}>
            <div style={{ width: '76%' }}>
                <div className="mt-1">
                    <p className="set-font-11">
                        <b>Keterangan Biaya Lain-lain :</b>
                    </p>

                    <input
                        id="keteranganBiayalainLain"
                        className={` container form-input`}
                        style={{
                            fontSize: 11,
                            marginTop: '2px',
                            marginLeft: 0,
                            borderColor: '#bfc9d4',
                            width: '100%',
                            borderRadius: 2,
                        }}
                        disabled={stateDataHeader?.disabledComponent}
                        // value={stateDataHeader?.noRpe}
                        onChange={(event: any) => handleKeterangan(event.target.value, 'keteranganBiayalainLain')}
                    ></input>
                </div>
                <div className="mt-1">
                    <p className="set-font-11">
                        <b>Keterangan Potongan Ekspedisi Lain :</b>
                    </p>

                    <textarea
                        id="ketPotonganEkspedisiLain"
                        onChange={(event: any) => handleKeterangan(event.target.value, 'ketPotonganEkspedisiLain')}
                        disabled={stateDataHeader?.disabledComponent}
                        style={{ marginTop: 2, width: '100%', height: '80px', border: '1px solid #bfc9d4', color: 'black' }}
                    ></textarea>
                </div>
            </div>
            <div style={{ width: '24%' }}>
                <div className="flex" style={{ marginTop: '10px' }}>
                    <div style={{ width: '50%' }}>
                        <label style={{ textAlign: 'right' }}>Sub Total</label>
                    </div>
                    <div style={divNilaiStyle}>
                        <span style={nilaiStyles}>{frmNumber(stateDataFooter?.subTotal)}</span>
                    </div>
                </div>
                <div className="flex" style={{ marginTop: '-5px' }}>
                    <div style={{ width: '50%' }}>
                        <label style={{ textAlign: 'right' }}>Tambahan Jarak</label>
                    </div>
                    <div style={divNilaiStyle}>
                        <span style={nilaiStyles}>{frmNumber(stateDataFooter?.tambahanJarak)}</span>
                    </div>
                </div>
                <div className="flex" style={{ marginTop: '-5px', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50%' }}>
                        <label style={{ textAlign: 'right' }}>Biaya Lain-lain</label>
                    </div>
                    <div style={{ width: '50%' }}>
                        <input
                            id="biayaLainLain"
                            className={` container form-input`}
                            style={{
                                fontSize: 11,
                                marginTop: '2px',
                                marginLeft: '10%',
                                borderColor: '#bfc9d4',
                                width: '90%',
                                borderRadius: 2,
                                textAlign: 'right',
                            }}
                            disabled={stateDataHeader?.disabledComponent}
                            // value={frmNumber(stateDataFooter?.biayaLainLain)}
                            onBlur={(evnet: any) => handleBiayaLainLain(evnet.target.value)}
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
                        ></input>
                    </div>
                </div>
                <hr style={{ width: '82%', marginTop: '5px', float: 'right', background: '#b1acac', height: '2px', border: 'none' }} />
                <div style={{ marginTop: '14px' }}>
                    <div className="flex">
                        <div style={{ width: '50%' }}>
                            <label style={{ ...lableStyle, color: 'red' }}>Total Tagihan</label>
                        </div>
                        <div style={{ ...divNilaiStyle, color: 'red' }}>
                            <span style={nilaiStyles}>{frmNumber(stateDataFooter?.totalTagihan)}</span>
                        </div>
                    </div>
                    <div className="flex" style={{ marginTop: '-5px' }}>
                        <div style={{ width: '50%' }}>
                            <label style={{ ...lableStyle, color: 'red' }}>Nominal Invoice</label>
                        </div>
                        <div style={{ ...divNilaiStyle, color: 'red' }}>
                            <span style={nilaiStyles}>{frmNumber(stateDataFooter?.nominalInvoice)}</span>
                        </div>
                    </div>
                    <div className="flex" style={{ marginTop: '-5px' }}>
                        <div style={{ width: '50%' }}>
                            <label style={{ ...lableStyle, color: 'black' }}>Total Bayar</label>
                        </div>
                        <div style={{ ...divNilaiStyle, color: 'black' }}>
                            <span style={nilaiStyles}>{frmNumber(stateDataFooter?.totalBayar)}</span>
                        </div>
                    </div>
                    <div className="flex" style={{ marginTop: '-5px' }}>
                        <div style={{ width: '50%' }}>
                            <label style={{ ...lableStyle, color: 'blue' }}>Total Klaim Ekspedisi FBM</label>
                        </div>
                        <div style={{ ...divNilaiStyle, color: 'blue' }}>
                            <span style={nilaiStyles}>{frmNumber(stateDataFooter?.totalKlaimEkspedisiFbm)}</span>
                        </div>
                    </div>
                    <div className="flex" style={{ marginTop: '-5px', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '50%' }}>
                            <label style={{ ...lableStyle, color: 'black' }}>Potongan Ekspedisi Lain</label>
                        </div>
                        <div style={{ width: '50%' }}>
                            <input
                                id="potonganEkspedisi"
                                className={` container form-input`}
                                style={{
                                    fontSize: 11,
                                    marginTop: '2px',
                                    marginLeft: '10%',
                                    borderColor: '#bfc9d4',
                                    width: '90%',
                                    borderRadius: 2,
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                }}
                                disabled={stateDataHeader?.disabledComponent}
                                // value={frmNumber(stateDataFooter?.potonganEkspedisiLain)}
                                onBlur={(event: any) => handlePotonganEkspedisiLain(event.target.value)}
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
                            ></input>
                        </div>
                    </div>
                    <div className="flex" style={{ marginTop: '2px' }}>
                        <div style={{ width: '50%' }}>
                            <label style={{ ...lableStyle, color: 'black' }}>PPH 23</label>
                        </div>
                        <div style={{ ...divNilaiStyle, color: 'black' }}>
                            <span style={nilaiStyles}>{frmNumber(stateDataFooter?.nilaiPph23)}</span>
                        </div>
                    </div>
                </div>
                <hr style={{ width: '82%', marginTop: '-3px', float: 'right', background: '#b1acac', height: '2px', border: 'none' }} />
                <div className="flex" style={{ marginTop: '5px' }}>
                    <div style={{ width: '50%' }}>
                        <label style={{ ...lableStyle, color: 'blue' }}>Total Pembayaran</label>
                    </div>
                    <div style={{ ...divNilaiStyle, color: 'blue' }}>
                        <span style={nilaiStyles}>{frmNumber(stateDataFooter?.totalPembayaran)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateFooterRpe;
