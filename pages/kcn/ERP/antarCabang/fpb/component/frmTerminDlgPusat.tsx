import * as React from 'react';
import { useRouter } from 'next/router';
import styles from './mk.module.css';
import stylesTtb from '../mklist.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';

import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DataManager } from '@syncfusion/ej2-data';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { table } from '@syncfusion/ej2/grids';

import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';

import { myAlertGlobal } from '@/utils/routines';
import { Console } from 'console';
L10n.load(idIDLocalization);

interface FrmTerminDlgPusatProps {
    isOpen: boolean;
    onClose: any;
    onBatal: any;
    selectedData: any;
    target: any;
    stateDokumen: any;
    // listAkunJurnalObjek: any;
}

let dgDlgBarang: Grid | any;

const FrmTerminDlgPusat = ({ isOpen, onClose, onBatal, selectedData, target, stateDokumen }: FrmTerminDlgPusatProps) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [searchNo, setSearchNo] = useState('');
    const [searchNama, setSearchNama] = useState('');
    const [filteredData, setFilteredData] = useState('');
    const [listItem, setListItem] = useState([]);
    const [selectedItem, setSelectedItem] = useState<any>('');

    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3500,
        showClass: {
            popup: `
              animate__animated
              animate__zoomIn
              animate__faster
            `,
        },
        hideClass: {
            popup: `
              animate__animated
              animate__zoomOut
              animate__faster
            `,
        },
    });

    const myAlert = (text: any) => {
        return withReactContent(swalToast).fire({
            icon: 'warning',
            title: `<p style="font-size:12px">${text}</p>`,
            width: '100%',
            target: '#FrmPraBkk',
        });
    };

    const onPilih = () => {
        if (selectedItem) {
            selectedData(selectedItem);
            onClose();
        } else {
            myAlertGlobal('Silahkan pilih data terlebih dulu.', 'frmItemDlg');
        }
    };

    const PencarianNo = async (event: string, setSearchNo: Function, setFilteredData: Function, listItemBarang: any[]) => {
        const searchValue = event;
        setSearchNo(searchValue);
        const filteredData = SearchDataNo(searchValue, listItemBarang);
        setFilteredData(filteredData);

        const cariNama = document.getElementById('searchNama') as HTMLInputElement;
        if (cariNama) {
            cariNama.value = '';
        }
    };

    const SearchDataNo = (keyword: any, listItemBarang: any[]) => {
        if (keyword === '') {
            return listItemBarang;
        } else {
            const filteredData = listItemBarang.filter((item) => item.no_item.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const PencarianNama = async (event: string, setSearchNama: Function, setFilteredData: Function, listItemBarang: any[]) => {
        const searchValue = event;
        setSearchNama(searchValue);
        const filteredData = SearchDataNama(searchValue, listItemBarang);
        setFilteredData(filteredData);

        const cariNo = document.getElementById('searchNo') as HTMLInputElement;
        if (cariNo) {
            cariNo.value = '';
        }
    };

    const SearchDataNama = (keyword: any, listItemBarang: any[]) => {
        if (keyword === '') {
            return listItemBarang;
        } else {
            const filteredData = listItemBarang.filter((item) => item.nama_item.toLowerCase().includes(keyword.toLowerCase()));
            // console.log('filteredData ', filteredData);
            return filteredData;
        }
    };

    const doubleClickGrid = async (args: any) => {
        if (dgDlgBarang) {
            const rowIndex: number = args.row.rowIndex;
            const selectedItems = args.rowData;
            dgDlgBarang.selectRow(rowIndex);
            setSelectedItem(selectedItems);
            selectedData(selectedItems);
            onClose();
        }
    };

    const gridIndukHeader = (props: any) => {
        return <div style={{ fontWeight: props.header === 'Y' ? 'bold' : 'normal', marginLeft: props.header === 'N' ? '0.5rem' : '0' }}>{props[props.column.field]}</div>;
    };

    let resultFetchDataBarang: any;
    const fetchDataBarang = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/termin_by_where`, {
                params: {
                    entitas: stateDokumen.kode_entitas,
                    param1: `WHERE cod <> "Y"`,
                },
                headers: {
                    Authorization: `Bearer ${stateDokumen.token}`,
                },
            });

            resultFetchDataBarang = response.data.data;
            dgDlgBarang.dataSource = resultFetchDataBarang;
            setListItem(resultFetchDataBarang);
        } catch (error: any) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchDataBarang();
    }, [isOpen]);

    return (
        <DialogComponent
            // ref={(g: any) => (dgDlgBarang = g)}
            id="frmItemDlg"
            name="frmItemDlg"
            className="frmItemDlg"
            target={`#${target}`}
            style={{ position: 'fixed' }}
            header={'Daftar Termin Pusat'}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            allowDragging={true}
            showCloseIcon={true}
            width="225"
            height="500"
            // buttons={buttonDlgTtbMk}
            position={{ X: 'center', Y: 'center' }}
            closeOnEscape={true}
            close={() => {
                setSearchNo('');
                setSearchNama('');
                const cariNoAkun = document.getElementById('searchNo') as HTMLInputElement;
                if (cariNoAkun) {
                    cariNoAkun.value = '';
                }

                const cariNamaAkun = document.getElementById('searchNama') as HTMLInputElement;
                if (cariNamaAkun) {
                    cariNamaAkun.value = '';
                }

                onClose();
                // onBatal();
            }}
        >
            {/* <div className="form-input mb-1" style={{ width: '100%', display: 'inline-block' }}>
                <TextBoxComponent
                    id="searchNama"
                    // name="searchNamaAkun"
                    className="searchtext"
                    placeholder="<Nama Termin>"
                    showClearButton={true}
                    value={searchNama}
                    input={(args: ChangeEventArgsInput) => {
                        const value: any = args.value;
                        PencarianNama(value, setSearchNama, setFilteredData, listItem);
                    }}
                    floatLabelType="Never"
                />
            </div> */}
            <div className="mb-2 w-full rounded border border-gray-400 px-1">
                <TextBoxComponent
                    id="search"
                    name="search"
                    className="searchtext"
                    placeholder="Pencarian Data..."
                    showClearButton={true}
                    input={(args: any) => {
                        if (dgDlgBarang) {
                            dgDlgBarang.search(args.value);
                        }
                    }}
                    floatLabelType="Never"
                />
            </div>
            <GridComponent
                id="dgItemDlg"
                locale="id"
                ref={(g: any) => (dgDlgBarang = g)}
                dataSource={searchNo !== '' || searchNama !== '' ? filteredData : listItem}
                selectionSettings={{ mode: 'Row', type: 'Single' }}
                rowHeight={22}
                width={'100%'}
                height={'275'}
                gridLines={'Both'}
                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                rowSelecting={(args: any) => {
                    setSelectedItem(args.data);
                    // selectedData(args.data);
                }}
                // rowSelecting={rowSelectingDialogAkun}
                recordDoubleClick={(args: any) => doubleClickGrid(args)}
                allowPaging={true}
                allowSorting={true}
                pageSettings={{
                    pageSize: 25,
                    // pageCount: 10,
                    //  pageSizes: ['10', '50', '100', 'All']
                }}
                searchSettings={{
                    fields: ['nama_termin'],
                    operator: 'contains',
                    // key: '',
                    ignoreCase: true,
                    // immediate: true,
                }}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        // template={(args: any) => TemplateNamaAkun(args)}
                        field="nama_termin"
                        headerText="Termin"
                        headerTextAlign="Center"
                        textAlign="Left"
                        width="60"
                        clipMode="EllipsisWithTooltip"
                        template={gridIndukHeader}
                    />
                </ColumnsDirective>

                <Inject services={[Selection]} />
            </GridComponent>
            <ButtonComponent
                id="buBatalDokumen1"
                content="Batal"
                cssClass="e-primary e-small"
                // iconCss="e-icons e-small e-close"
                style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                onClick={() => {
                    onBatal();
                }}
            />
            <ButtonComponent
                id="buSimpanDokumen1"
                content="Pilih"
                cssClass="e-primary e-small"
                // iconCss="e-icons e-small e-save"
                style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                onClick={onPilih}
                // onClick={refreshDaftarAkun}
            />
        </DialogComponent>
    );
};

export default FrmTerminDlgPusat;
