import { useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import { useRouter } from 'next/router';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './fblist.module.css';
import { faArrowsRotate, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import Flatpickr from 'react-flatpickr';
import Dropdown from '../../../../../components/Dropdown';
import { Dialog, Transition } from '@headlessui/react';
import Draggable from 'react-draggable';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { ContextMenuComponent, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ChangeEventArgs as ChangeEventArgsInput, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
import * as React from 'react';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

enableRipple(true);

import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';

import { useSession } from '@/pages/api/sessionContext';
import HistBayar from './HistBayar';

const fbList = () => {
    //////////// respon data user dari login ////////////

    const { sessionData, isLoading } = useSession();
    const token = sessionData?.token ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';

    if (isLoading) {
        return;
    }

    /////////////////////////////////////////////////////

    let gridListData: Grid | any;
    let tooltipListData: Tooltip | any;

    const ExportComplete = (): void => {
        gridListData.hideSpinner();
    };

    function menuHeaderSelect(args: MenuEventArgs) {
        if (args.item.text === 'Cetak ke printer') {
            gridListData.print();
        } else if (args.item.text === 'PDF') {
            gridListData.showSpinner();
            gridListData.pdfExport();
        } else if (args.item.text === 'XLSX') {
            gridListData.showSpinner();
            gridListData.excelExport();
        } else if (args.item.text === 'CSV') {
            gridListData.showSpinner();
            gridListData.csvExport();
        }
    }

    const router = useRouter();

    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [recordsData, setRecordsData] = useState<any[]>([]);

    // Visible panel sidebar
    const [panelVisible, setPanelVisible] = useState(true);

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    const handleRowClickBaru = (id: any) => {
        router.push(`./fb?tabId=${tabId}`);
    };

    const [selectedRow, setSelectedRow] = useState('');

    //checkbox no_pengajuan, nama_karyawan dan jenis_klaim
    const [noFBValue, setNoFBValue] = useState<string>('');
    const [isNoFBChecked, setIsNoFBChecked] = useState<boolean>(false);

    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));
    const [isDateRangeChecked, setIsDateRangeChecked] = useState<boolean>(true);

    const [namaSupplierValue, setNamaSupplierValue] = useState<string>('');
    const [isNamaSupplierChecked, setIsNamaSupplierChecked] = useState<boolean>(false);

    const [noVoucherValue, setNoVoucherValue] = useState<string>('');
    const [isNoVoucherChecked, setIsNoVoucherChecked] = useState<boolean>(false);

    const [noInvoiceValue, setNoInvoiceValue] = useState<string>('');
    const [isNoInvoiceChecked, setIsNoInvoiceChecked] = useState<boolean>(false);

    const [selectedOptionValue, setSelectedOptionValue] = useState('');
    const [isSelectedOptionChecked, setIsSelectedOptionChecked] = useState<boolean>(false);
    const [modalHist, setModalHist] = useState(false);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setIsSelectedOptionChecked(!!selectedValue);
        setSelectedOptionValue(selectedValue);
    };

    const [selectedRadioValue, setSelectedRadioValue] = useState<string | null>(null);

    const handleRadioChange = (value: string) => {
        setSelectedRadioValue(value);
    };

    const handleNoFBInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoFBValue(newValue);
        setIsNoFBChecked(newValue.length > 0);
    };

    const handleNamaSupplierInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNamaSupplierValue(newValue);
        setIsNamaSupplierChecked(newValue.length > 0);
    };

    const handleNoVoucherInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoVoucherValue(newValue);
        setIsNoVoucherChecked(newValue.length > 0);
    };

    const handleNoInvoiceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoInvoiceValue(newValue);
        setIsNoInvoiceChecked(newValue.length > 0);
    };

    const refreshData = async () => {
        await setSearchNoFB('');
        await setSearchKeterangan('');

        try {
            const params = {
                entitas: kode_entitas,
                param1: isNoFBChecked ? noFBValue : 'all',
                param2: isDateRangeChecked ? date1.format('YYYY-MM-DD') : 'all',
                param3: isDateRangeChecked ? date2.format('YYYY-MM-DD') : 'all',
                param4: isNamaSupplierChecked ? namaSupplierValue : 'all',
                param5: isSelectedOptionChecked ? selectedOptionValue : 'all',
                param6: isNoVoucherChecked ? noVoucherValue : 'all',
                param7: isNoInvoiceChecked ? noInvoiceValue : 'all',
                param8: selectedRadioValue ? selectedRadioValue : 'all',
                param9: '200',
            };

            const response = await axios.get(`${apiUrl}/erp/list_fb`, {
                params: params,
            });

            const responseData = response.data.data;

            const transformedData: any[] = responseData.map((item: any) => ({
                id: item.kode_fb,
                no_fb: item.no_fb,
                tgl_fb: moment(item.tgl_fb),
                no_lpb: item.no_lpb,
                no_sj: item.no_sj,
                nama_relasi: item.nama_relasi,
                netto_mu: item.netto_mu ? parseFloat(item.netto_mu) : null,
                nama_termin: item.nama_termin,
                st_lunas: item.st_lunas,
                status: item.status,
                no_vch: item.no_vch,
                no_inv: item.no_inv,
            }));
            setRecordsData(transformedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/list_fb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: 'all',
                        param2: date1.format('YYYY-MM-DD'),
                        param3: date2.format('YYYY-MM-DD'),
                        param4: 'all',
                        param5: 'all',
                        param6: 'all',
                        param7: 'all',
                        param8: 'all',
                        param9: '200',
                    },
                });
                const responseData = response.data.data;

                const transformedData: any[] = responseData.map((item: any) => ({
                    id: item.kode_fb,
                    no_fb: item.no_fb,
                    tgl_fb: moment(item.tgl_fb).format('DD-MM-YYYY'),
                    no_lpb: item.no_lpb,
                    no_sj: item.no_sj,
                    nama_relasi: item.nama_relasi,
                    netto_mu: item.netto_mu ? parseFloat(item.netto_mu) : null,
                    nama_termin: item.nama_termin,
                    st_lunas: item.st_lunas,
                    status: item.status,
                    no_vch: item.no_vch,
                    no_inv: item.no_inv,
                }));

                setRecordsData(transformedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataUseEffect();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseHeader = await axios.get(`${apiUrl}/erp/header_fb?entitas=${kode_entitas}&param1=${selectedRow}`);
                const responseDetail = await axios.get(`${apiUrl}/erp/detail_fb?entitas=${kode_entitas}&param1=${selectedRow}`);
                setHeaderFetch(responseHeader.data.data);
                setDetailFetch(responseDetail.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [kode_entitas, selectedRow]);

    // **Print Preview** //
    const OnClick_CetakFormFB = () => {
        if (selectedRow === '') {
            alert('Silahkan pilih data terlebih dahulu');
        } else {
            const param = {
                entitas: kode_entitas,
                where: `d.kode_fb="${selectedRow}"`,
            };
            // Encode Base64
            const strCommand = btoa(JSON.stringify(param));

            let height = window.screen.availHeight - 150;
            let width = window.screen.availWidth - 200;
            let leftPosition = window.screen.width / 2 - (width / 2 + 10);
            let topPosition = window.screen.height / 2 - (height / 2 + 50);

            let iframe = `
                <html><head>
                <title>Form Faktur Pembelian | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/form_fb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

            let win = window.open(
                '',
                '_blank',
                `status=no,width=${width},height=${height},resizable=yes
              ,left=${leftPosition},top=${topPosition}
              ,screenX=${leftPosition},screenY=${topPosition}
              ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
            );

            if (win) {
                let link = win.document.createElement('link');
                link.type = 'image/png';
                link.rel = 'shortcut icon';
                link.href = '/favicon.png';
                win.document.getElementsByTagName('head')[0].appendChild(link);
                win.document.write(iframe);
            } else {
                console.error('Window failed to open.');
            }
        }
    };

    //modal
    const [modalTanggal, setModalTanggal] = useState(false);

    const [dateStart, setDateStart] = useState<any>(moment());
    const [dateEnd, setDateEnd] = useState<any>(moment());

    const [flatpickrClicked, setFlatpickrClicked] = useState(false);

    const handleCloseModals = () => {
        setModalTanggal(false);
        setFlatpickrClicked(false);
    };

    const OnClick_CetakDaftarFB = () => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>Form Daftar Pembelian | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/daftar_fb?entitas=${kode_entitas}&param2=${dateStart?.format('YYYY-MM-DD')}&param3=${dateEnd?.format(
            'YYYY-MM-DD'
        )}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

        let win = window.open(
            '',
            '_blank',
            `status=no,width=${width},height=${height},resizable=yes
              ,left=${leftPosition},top=${topPosition}
              ,screenX=${leftPosition},screenY=${topPosition}
              ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
        );

        if (win) {
            let link = win.document.createElement('link');
            link.type = 'image/png';
            link.rel = 'shortcut icon';
            link.href = '/favicon.png';
            win.document.getElementsByTagName('head')[0].appendChild(link);
            win.document.write(iframe);
        } else {
            console.error('Window failed to open.');
        }
    };

    // #detail dokumen#

    // modal
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [dataTerpilih, setDataTerpilih] = useState({});
    const [modalPosition, setModalPosition] = useState({ top: '15%', left: '10%' });

    const openModal = (item: any) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    // fetchdetail
    const [headerFetch, setHeaderFetch] = useState<any>([]);
    const [detailFetch, setDetailFetch] = useState<any>([]);

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);

    const handleRowSelected = (args: any) => {
        setSelectedRow(args.data.id);
        setDataTerpilih(args.data);
    };

    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    let menuHeaderItems: MenuItemModel[] = [
        {
            iconCss: 'e-icons e-print',
            text: 'Cetak ke printer',
        },
        {
            iconCss: 'e-icons',
            text: 'Export ke file',
            items: [
                { iconCss: 'e-icons e-export-pdf', text: 'PDF' },
                { iconCss: 'e-icons e-export-excel', text: 'XLSX' },
                { iconCss: 'e-icons e-export-csv', text: 'CSV' },
            ],
        },
    ];

    /////////////////////////
    // ** FILTER HEADER ** //
    /////////////////////////

    const [filteredData, setFilteredData] = useState<any[]>([]);

    const [searchNoFB, setSearchNoFB] = useState('');
    const [searchKeterangan, setSearchKeterangan] = useState('');

    const PencarianNoKeterangan = async (event: string, setSearchNoReff: Function, setFilteredData: Function, recordsData: any[]) => {
        const searchValue = event;
        setSearchNoReff(searchValue);
        const filteredData = SearchDataKeterangan(searchValue, recordsData);
        setFilteredData(filteredData);

        const cariNoPS = document.getElementById('cariNoPS') as HTMLInputElement;
        if (cariNoPS) {
            cariNoPS.value = '';
        }
    };

    const SearchDataKeterangan = (keyword: any, recordsData: any[]) => {
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return recordsData;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = recordsData.filter((item) => item.nama_relasi.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const PencarianNoFB = async (event: string, setSearchNoFB: Function, setFilteredData: Function, recordsData: any[]) => {
        const searchValue = event;
        setSearchNoFB(searchValue);
        const filteredData = SearchDataNoFB(searchValue, recordsData);
        setFilteredData(filteredData);

        const keterangan = document.getElementById('keterangan') as HTMLInputElement;
        if (keterangan) {
            keterangan.value = '';
        }
    };

    const SearchDataNoFB = (keyword: any, recordsData: any[]) => {
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return recordsData;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = recordsData.filter((item) => item.no_fb.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    /////////////////////////////
    // ** END FILTER HEADER ** //
    /////////////////////////////

    return (
        <div>
            <div className=" mb-5 flex justify-between">
                <div className="flex">
                    <button
                        type="submit"
                        onClick={handleRowClickBaru}
                        style={{
                            height: '35px',
                            backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                            color: 'white',
                            borderColor: '#e6e6e6',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                        }}
                        className="btn btn-secondary mb-2 md:mb-0 md:mr-2"
                    >
                        Baru
                    </button>
                    <button
                        type="submit"
                        className="btn btn-warning mb-2 md:mb-0 md:mr-2"
                        style={{
                            height: '35px',
                            backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                            color: 'white',
                            borderColor: '#e6e6e6',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                        }}
                        onClick={() => {
                            if (selectedRow) {
                                router.push({ pathname: './fb', query: { id: `${selectedRow}`, tabId: `${tabId}` } });
                            } else {
                                alert('Pilih data terlebih dahulu');
                            }
                        }}
                    >
                        Ubah
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-success mb-2 md:mb-0 md:mr-2 ${panelVisible ? 'pointer-events-none opacity-50' : ''}`}
                        style={{
                            height: '35px',
                            backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                            color: 'white',
                            borderColor: '#e6e6e6',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                        }}
                        onClick={handleFilterClick}
                    >
                        Filter
                    </button>

                    <button
                        className="btn btn-secondary mb-2 md:mb-0 md:mr-2"
                        style={{
                            height: '35px',
                            backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                            color: 'white',
                            borderColor: '#e6e6e6',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                        }}
                        onClick={() => openModal(selectedRow)}
                    >
                        Detail Dok
                    </button>

                    <div className="dropdown">
                        <Dropdown
                            offset={[0, 5]}
                            placement={`bottom-start`}
                            btnClassName="btn btn-dark md:mr-1"
                            button={
                                <>
                                    Cetak
                                    <FontAwesomeIcon icon={faSquareCaretDown} className="ml-2" width="18" height="18" />
                                </>
                            }
                        >
                            <ul style={{ width: '200px' }}>
                                <li>
                                    <button type="button" onClick={OnClick_CetakFormFB}>
                                        Form Faktur Pembelian
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalTanggal(true);
                                        }}
                                    >
                                        Daftar Faktur Pembelian
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>

                    <div className="form-input ml-3 mr-1" style={{ height: '35px', width: '180px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="cariNoPS"
                            className="searchtext"
                            placeholder="Cari Nomor FB"
                            showClearButton={true}
                            input={(args: ChangeEventArgsInput) => {
                                const value: any = args.value;
                                PencarianNoFB(value, setSearchNoFB, setFilteredData, recordsData);
                            }}
                            floatLabelType="Never"
                        />
                    </div>

                    <div className="form-input ml-3 mr-1" style={{ height: '35px', width: '180px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="keterangan"
                            className="searchtext"
                            placeholder="Cari Customer"
                            showClearButton={true}
                            input={(args: ChangeEventArgsInput) => {
                                const value: any = args.value;
                                PencarianNoKeterangan(value, setSearchKeterangan, setFilteredData, recordsData);
                            }}
                            floatLabelType="Never"
                        />
                    </div>

                    <button
                        className="btn btn-secondary mb-2 md:mb-0 md:mr-2"
                        style={{
                            height: '35px',
                            backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))',
                            color: 'white',
                            borderColor: '#e6e6e6',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                        }}
                        onClick={() => setModalHist(true)}
                    >
                        Hist. Bayar
                    </button>

                    <div className="relative">
                        <Transition appear show={modalTanggal}>
                            <Dialog as="div" open={modalTanggal} onClose={handleCloseModals}>
                                <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <div className="fixed inset-0" />
                                </Transition.Child>
                                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                                    <div className="flex min-h-screen items-center justify-center px-4">
                                        <Transition.Child
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel as="div" className={`panel max-w-$4xl my-8 w-full overflow-hidden  rounded-lg border-0 bg-[#dedede] p-0 text-black dark:text-white-dark`}>
                                                <div className="p-5">
                                                    Periode Tanggal :
                                                    <Flatpickr
                                                        value={dateStart.format('DD-MM-YYYY HH:mm:ss')}
                                                        options={{
                                                            dateFormat: 'd-m-Y',
                                                            clickOpens: flatpickrClicked,
                                                        }}
                                                        style={{
                                                            width: '110px',
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            padding: '8px',
                                                            outline: '1px solid black',
                                                        }}
                                                        onChange={(date) => {
                                                            const selectedDate = moment(date[0]);
                                                            selectedDate.set({
                                                                hour: moment().hour(),
                                                                minute: moment().minute(),
                                                                second: moment().second(),
                                                            });
                                                            setDateStart(selectedDate);
                                                        }}
                                                        onFocus={() => setFlatpickrClicked(true)}
                                                    />
                                                    S/D
                                                    <Flatpickr
                                                        value={dateEnd.format('DD-MM-YYYY HH:mm:ss')}
                                                        options={{
                                                            dateFormat: 'd-m-Y',
                                                        }}
                                                        style={{
                                                            width: '110px',
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            padding: '8px',
                                                            outline: '1px solid black',
                                                        }}
                                                        onChange={(date) => {
                                                            const selectedDate = moment(date[0]);
                                                            selectedDate.set({
                                                                hour: moment().hour(),
                                                                minute: moment().minute(),
                                                                second: moment().second(),
                                                            });
                                                            setDateEnd(selectedDate);
                                                        }}
                                                    />
                                                </div>
                                                <div className="mr-3 flex items-center justify-between">
                                                    <div className="flex items-center space-x-4"></div>

                                                    <div className="mb-3 flex space-x-4">
                                                        <button type="button" className="btn btn-primary" onClick={OnClick_CetakDaftarFB} style={{ width: '8vh', height: '4vh' }}>
                                                            OK
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => {
                                                                handleCloseModals();
                                                            }}
                                                            style={{ width: '8vh', height: '4vh' }}
                                                        >
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
                    </div>
                </div>

                <div className="flex">
                    <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                        Faktur Pembelian (FB)
                    </span>
                </div>
            </div>

            <div className={styles['flex-container']}>
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden w-[300px] max-w-full flex-none space-y-4 border border-2 border-black-light p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#dedede', height: '600px', overflowY: 'auto' }}
                    >
                        <div className="flex flex-col">
                            <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                            <form>
                                <div>
                                    <label className=" flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox" checked={isNoFBChecked} onChange={() => setIsNoFBChecked(!isNoFBChecked)} />
                                        <span>No. Faktur</span>
                                    </label>
                                    <input type="text" placeholder="" className="form-input" value={noFBValue} onChange={handleNoFBInputChange} />
                                </div>

                                <label className="mt-3 flex cursor-pointer items-center">
                                    <input type="checkbox" className="form-checkbox" checked={isDateRangeChecked} onChange={() => setIsDateRangeChecked(!isDateRangeChecked)} />
                                    <span>Tanggal Approved</span>
                                </label>
                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex ${isDateRangeChecked ? '' : 'hidden'}`}>
                                    <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            // renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date1.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setDate1(moment(args.value));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>{' '}
                                    <p className="mt-1" style={{ marginTop: '11px' }}>
                                        S/D
                                    </p>
                                    <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            // renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date2.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setDate2(moment(args.value));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox" checked={isNamaSupplierChecked} onChange={() => setIsNamaSupplierChecked(!isNamaSupplierChecked)} />
                                        <span>Nama Supplier</span>
                                    </label>
                                    <input type="text" placeholder="" className="form-input" value={namaSupplierValue} onChange={handleNamaSupplierInputChange} />
                                </div>

                                <div className="mt-3">
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox" checked={isSelectedOptionChecked} onChange={() => setIsSelectedOptionChecked(!isSelectedOptionChecked)} />
                                        <span>Status Dokumen</span>
                                    </label>
                                    <select id="Pajak" className="form-input" onChange={(e) => handleSelectChange(e)} value={selectedOptionValue}>
                                        <option value="" disabled hidden>
                                            {'-- Silahkan Pilih Data--'}
                                        </option>
                                        <option value="Terbuka">Terbuka</option>
                                        <option value="Proses">Proses</option>
                                        <option value="Tertutup">Tertutup</option>
                                    </select>
                                </div>

                                <div className="mt-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox" checked={isNoVoucherChecked} onChange={() => setIsNoVoucherChecked(!isNoVoucherChecked)} />
                                        <span>No. Voucher</span>
                                    </label>
                                    <input type="text" placeholder="" className="form-input" value={noVoucherValue} onChange={handleNoVoucherInputChange} />
                                </div>

                                <div className="mt-3">
                                    <label className=" flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox" checked={isNoInvoiceChecked} onChange={() => setIsNoInvoiceChecked(!isNoInvoiceChecked)} />
                                        <span>No. Invoice</span>
                                    </label>
                                    <input type="text" placeholder="" className="form-input" value={noInvoiceValue} onChange={handleNoInvoiceInputChange} />
                                </div>

                                <div className="mt-2 space-y-1">
                                    <div className="font-bold">Transaksi PPN</div>
                                    <div>
                                        <label className="mt-1 inline-flex">
                                            <input type="radio" name="default_text_color" className="peer form-radio" onChange={() => handleRadioChange('Y')} />
                                            <span className="peer-checked:text-primary">Ya</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="inline-flex">
                                            <input type="radio" name="default_text_color" className="peer form-radio text-success" onChange={() => handleRadioChange('N')} />
                                            <span className="peer-checked:text-success">Tidak</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="inline-flex">
                                            <input type="radio" name="default_text_color" className="peer form-radio text-secondary" onChange={() => handleRadioChange('all')} />
                                            <span className="peer-checked:text-secondary">Semua</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        style={{ backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', color: 'white', borderColor: '#e6e6e6', fontWeight: 'bold', boxShadow: 'none' }}
                                        type="button"
                                        onClick={() => refreshData()}
                                        className="btn btn-primary mt-4"
                                    >
                                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Refresh Data
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <div
                    className={`overlay absolute z-[5] hidden h-[600px] w-full rounded-md bg-black/60 ${isShowTaskMenu && '!block xl:!hidden'}`}
                    onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}
                ></div>

                {/* Form Grid Layouts */}

                <div
                    className="panel"
                    style={{
                        background: '#dedede',
                        width: '100%',
                        overflow: 'auto',
                    }}
                >
                    <div className="panel-data" style={{ width: '100%' }}>
                        <TooltipComponent ref={(t) => (tooltipListData = t)} opensOn="Hover" target=".e-headertext">
                            <TabComponent id="defaultTab">
                                <div className="e-tab-header" style={{ marginBottom: 10 }}>
                                    <div> Data List </div>
                                </div>
                                <div className="e-content">
                                    <GridComponent
                                        ref={(g) => (gridListData = g)}
                                        dataSource={searchNoFB !== '' || searchKeterangan !== '' ? filteredData : recordsData}
                                        allowExcelExport={true}
                                        excelExportComplete={ExportComplete}
                                        allowPdfExport={true}
                                        pdfExportComplete={ExportComplete}
                                        allowPaging={true}
                                        allowSorting={true}
                                        allowFiltering={false}
                                        allowResizing={true}
                                        autoFit={true}
                                        allowReordering={true}
                                        pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                        rowHeight={22}
                                        width={'100%'}
                                        height={450}
                                        gridLines={'Both'}
                                        loadingIndicator={{ indicatorType: 'Shimmer' }}
                                        rowSelected={handleRowSelected}
                                        recordDoubleClick={(args: any) => {
                                            router.push({ pathname: './fb', query: { id: `${selectedRow}`, tabId: `${tabId}` } });
                                        }}
                                        sortSettings={{ columns: [{ field: 'no_fb', direction: 'Descending' }] }}
                                    >
                                        <ColumnsDirective>
                                            <ColumnDirective field="no_fb" headerText="No. Faktur" headerTextAlign="Center" textAlign="Center" width="110" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective
                                                field="tgl_fb"
                                                headerText="Tanggal"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                width="100"
                                                clipMode="EllipsisWithTooltip"
                                                type="date"
                                                format={formatDate}
                                            />
                                            <ColumnDirective field="no_lpb" headerText="NO. PB" headerTextAlign="Center" textAlign="Center" width="150" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective
                                                field="netto_mu"
                                                headerText="Nilai Faktur"
                                                headerTextAlign="Center"
                                                textAlign="Right"
                                                format="N2"
                                                width="110"
                                                clipMode="EllipsisWithTooltip"
                                            />
                                            <ColumnDirective field="nama_termin" headerText="Termin" headerTextAlign="Center" textAlign="Center" width="100" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective field="st_lunas" headerText="Lunas" headerTextAlign="Center" textAlign="Center" width="150" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective field="status" headerText="Status" headerTextAlign="Center" textAlign="Center" width="70" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective field="no_vch" headerText="No Voucher" headerTextAlign="Center" textAlign="Left" width="120" clipMode="EllipsisWithTooltip" />
                                            <ColumnDirective field="no_inv" headerText="No Invoices" headerTextAlign="Center" textAlign="Center" width="100" clipMode="EllipsisWithTooltip" />
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                    </GridComponent>
                                </div>
                            </TabComponent>
                        </TooltipComponent>
                        {/*============ Tampilkan popup menu untuk print dan simpan ke file ================*/}
                        <ContextMenuComponent id="contextmenu" target=".e-gridheader" items={menuHeaderItems} select={menuHeaderSelect} animationSettings={{ duration: 800, effect: 'FadeIn' }} />
                    </div>
                </div>

                {selectedItem && (
                    <Draggable>
                        <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                            <div className="overflow-auto">
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>No FB</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>No SJ Supplier</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Nama Barang</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Satuan</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Kuantitas</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>MU</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Harga</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Diskon</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Potongan</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Pajak</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailFetch?.map((item: any) => (
                                            <tr key={item.id_fb}>
                                                <td>{headerFetch[0]?.no_lpb}</td>
                                                <td>{headerFetch[0]?.no_sj}</td>
                                                <td>{item.diskripsi}</td>
                                                <td>{item.satuan}</td>
                                                <td>{item.qty}</td>
                                                <td>{item.kode_mu}</td>
                                                <td>
                                                    {parseFloat(item.harga_mu).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td>{item.diskon}</td>
                                                <td>
                                                    {item.potongan_mu === '0.0000'
                                                        ? null
                                                        : parseFloat(item.potongan_mu).toLocaleString('en-US', {
                                                              minimumFractionDigits: 2,
                                                          })}
                                                </td>
                                                <td>
                                                    {item.pajak_mu === '0.0000'
                                                        ? null
                                                        : parseFloat(item.pajak_mu).toLocaleString('en-US', {
                                                              minimumFractionDigits: 2,
                                                          })}
                                                </td>
                                                <td>
                                                    {item.jumlah_mu === '0.0000'
                                                        ? null
                                                        : parseFloat(item.jumlah_mu).toLocaleString('en-US', {
                                                              minimumFractionDigits: 2,
                                                          })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                className={`${styles.closeButtonDetailDragable}`}
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                )}
                {modalHist && <HistBayar kode_entitas={kode_entitas} apiUrl={apiUrl} token={token} selectedRow={dataTerpilih} closeModal={() => setModalHist(false)} />}
            </div>
        </div>
    );
};

export default fbList;
