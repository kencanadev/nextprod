import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
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
import styles from '../phulist.module.css';

// Pakai fungsi dari routines ============================
import { DiskonByCalc, FillFromSQL, GetInfo, frmNumber, generateNU, generateNUDivisi, tanpaKoma } from '@/utils/routines';
//========================================================

import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes, faBookBookmark, faBook } from '@fortawesome/free-solid-svg-icons';
import { categoriesBukuBesar } from '../model/api';
import DialogRingkasanDaftarAkun from './modal/DialogRingkasanDaftarAkun';
import DialogLaporanDetailBukuBesar from './modal/DialogLaporanDetailBukuBesar';

interface tabBukuBesarProps {
    userid: any;
    kode_entitas: any;
    sidebarVisible: any;
}

const TabBukuBesar: React.FC<tabBukuBesarProps> = ({ userid, kode_entitas, sidebarVisible }: tabBukuBesarProps) => {
    const [stateDataHeader, setStateDataHeader] = useState({
        disableWarna: false,
        categoriId: '',
        dialogFilterRingkasanDaftarAkun: false,
        dialogFilterLaporanDetailBukuBesar: false,
        date1: moment(), // tanggal awal
        date2: moment().endOf('month'), // tanggal akhir
        isCheckedSaldoNol: false,
        isCheckedAkun: false,
    });
    const handleClick = (id: any) => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            disableWarna: true,
            categoriId: id,
        }));
    };

    const handleDoubleClick = (id: any) => {
        let filterRingkasanDaftarAkun: any;
        let filterLaporanDetailBukuBesar: any;
        if (id === 1) {
            filterRingkasanDaftarAkun = true;
            filterLaporanDetailBukuBesar = false;
        } else if (id === 2) {
            filterRingkasanDaftarAkun = false;
            filterLaporanDetailBukuBesar = true;
        }

        setStateDataHeader((prevState: any) => ({
            ...prevState,
            dialogFilterRingkasanDaftarAkun: filterRingkasanDaftarAkun,
            dialogFilterLaporanDetailBukuBesar: filterLaporanDetailBukuBesar,
        }));
    };

    return (
        <div style={{ width: sidebarVisible ? '85%' : '100%', height: '710px', background: 'white', borderRadius: '10px', margin: sidebarVisible ? '' : 'auto auto auto -15%', overflowY: 'auto' }}>
            <div style={{ flexDirection: 'column' }}>
                <div style={{ height: '39px' }}>
                    <div className="flex">
                        <div style={{ width: '10%' }}>
                            <div>
                                <FontAwesomeIcon icon={faBookBookmark} width="18" height="18" style={{ color: '#a93815', marginTop: '13px', fontSize: '22px', marginLeft: '10px' }} />
                            </div>
                        </div>
                        <div style={{ width: '90%', textAlign: 'right', marginTop: '13px', marginRight: '12px' }}>
                            <span style={{ fontWeight: 'bold' }}>Daftar Laporan Buku Besar</span>
                        </div>
                    </div>
                </div>
                <div style={{ height: '25px' }}>
                    <div style={{ borderColor: '#b3bbc9', marginLeft: '10px', width: '98%', marginTop: '2px' }} className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                </div>
                <div style={{ height: '560px' }}>
                    <div>
                        {categoriesBukuBesar.map((category, index) => (
                            <div
                                key={category.id}
                                // onClick={() => handleClick(category.id, index, category.tipe)}
                                style={{ fontWeight: 'bold', padding: '10px', cursor: 'pointer', marginTop: '-20px' }}
                                onClick={() => handleClick(category.id)}
                                onDoubleClick={() => handleDoubleClick(category.id)}
                            >
                                <div className="flex">
                                    <div style={{ width: '1.5%' }}>
                                        <FontAwesomeIcon icon={faBook} width="18" height="18" style={{ marginRight: '5px' }} />
                                    </div>
                                    <div style={{ width: '98.5%' }}>
                                        <h5 style={stateDataHeader.disableWarna === true && Number(stateDataHeader.categoriId) === category.id ? { background: '#d2eee7' } : {}}>{category.value}</h5>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ height: '10px' }}>
                    <div style={{ textAlign: 'right', marginTop: '13px', marginRight: '12px' }}>
                        <span style={{ fontWeight: 'bold' }}>Keterangan</span>
                    </div>
                    <div style={{ borderColor: '#b3bbc9', marginLeft: '10px', width: '98%', marginTop: '2px' }} className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                    <div style={{ marginTop: '-12px', marginLeft: '21px', color: '#9f9a9a' }}>
                        <span style={{ fontWeight: 'bold' }}>Menampilkan laporan buku besar dan transaksi jurnal</span>
                    </div>
                </div>
            </div>
            {/*============================================================================*/}
            {/*========================= Modal dialog Show (Filter) =======================*/}
            {/*============================================================================*/}
            {stateDataHeader.dialogFilterRingkasanDaftarAkun === true ? (
                <DialogRingkasanDaftarAkun visible={stateDataHeader.dialogFilterRingkasanDaftarAkun} stateDataHeader={stateDataHeader} setStateDataHeader={setStateDataHeader} />
            ) : null}
            {stateDataHeader.dialogFilterLaporanDetailBukuBesar === true ? (
                <DialogLaporanDetailBukuBesar visible={stateDataHeader.dialogFilterLaporanDetailBukuBesar} stateDataHeader={stateDataHeader} setStateDataHeader={setStateDataHeader} />
            ) : null}
        </div>
    );
};

export default TabBukuBesar;
