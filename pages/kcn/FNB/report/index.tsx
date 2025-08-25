import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ChangeEventArgs as ChangeEventArgsInput, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import {
    Grid,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    Inject,
    Page,
    Edit,
    Sort,
    Filter,
    Group,
    Resize,
    Reorder,
    Selection,
    Freeze,
    ExcelExport,
    PdfExport,
} from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './report.module.css';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import { useSession } from '@/pages/api/sessionContext';
import { categories } from './model/api';
import TabBukuBesar from './buku-besar/tabBukuBesar';
import { useRouter } from 'next/router';
import TabLaporanKeuangan from './laporan-keuangan/tabLaporanKeuangan';
import TabHutangUsahaDanSupplier from './hutang-usaha-dan-supplier/tabHutangUsahaDanSupplier';
enableRipple(true);

const ReportList = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const nip = sessionData?.nip ?? '';
    const kode_user = sessionData?.nip ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    const styleButton = { width: 69 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [stateDataHeader, setStateDataHeader] = useState({
        tipeParams: '',
    });
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [windowHeight, setWindowHeight] = useState(0);
    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';
    let sidebarObj: SidebarComponent;
    const host = window.location.host;
    const url = window.location.href;
    const params = new URLSearchParams(new URL(url).search);

    const handleClick = (id: any, index: any, tipe: any) => {
        const tabId = params.get('tabId');
        console.log('tabId', tabId);
        console.log('url: ', `${host}/kcn/ERP/report?tipe=${tipe}&tabId=${tabId}`);

        setActiveCategoryId(id);
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            tipeParams: tipe,
        }));
        router.push(`/kcn/ERP/report?tipe=${tipe}&tabId=${tabId}`);
    };

    useEffect(() => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            tipeParams: router.query.tipe,
        }));
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            if (window.innerWidth < 1000) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        if (typeof window !== 'undefined') {
            setWindowHeight(window.innerHeight);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    // const onCreate = () => {
    //     sidebarObj.element.style.visibility = '';
    // };
    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };

    return (
        <div className="Main" id="main-target">
            <div>
                <div style={{ minHeight: '40px', marginTop: '-3px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
                            <TooltipComponent content="Cetak" opensOn="Hover" openDelay={1000} target="#btnCetak">
                                <TooltipComponent content="Tampilkan " opensOn="Hover" openDelay={1000} target="#btnTampilkan">
                                    <ButtonComponent
                                        id="btnFilter"
                                        cssClass="e-primary e-small"
                                        style={sidebarVisible ? { width: '69px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' } : { ...styleButton, color: 'white' }}
                                        disabled={sidebarVisible}
                                        onClick={toggleClick}
                                        content="Kategori"
                                    ></ButtonComponent>

                                    <ButtonComponent
                                        style={{ width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' }}
                                        id="btnCetak"
                                        cssClass="e-primary e-small"
                                        disabled={true}
                                        content="Cetak"
                                    ></ButtonComponent>
                                    <ButtonComponent
                                        style={{ width: '75px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' }}
                                        id="btnTampilkan"
                                        cssClass="e-primary e-small"
                                        disabled={true}
                                        content="Tampilkan"
                                    ></ButtonComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </TooltipComponent>
                    </div>
                    <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            Indeks Laporan
                        </span>
                    </div>
                </div>

                <div className="flex">
                    <div style={{ width: '15%', height: '710px', background: '#b6beca', borderRadius: '10px', visibility: sidebarVisible ? 'visible' : 'hidden' }}>
                        {/* ===============  Filter Data ========================   */}
                        {/* {disabledFilter && ( */}

                        <div className="flex items-center text-center">
                            <div style={{ width: '89%' }}>
                                <h5 style={{ marginRight: '102px', marginTop: '22px' }} className="text-lg font-bold">
                                    Kategori :
                                </h5>
                            </div>
                            <div style={{ width: '11%' }}>
                                <div style={{ marginLeft: '-25px' }}>
                                    <button
                                        //onClick={toggleFilterData}
                                        onClick={closeClick}
                                    >
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex" style={{ position: 'relative' }}>
                            <div style={{ width: '10%', paddingLeft: '20px', position: 'relative' }}>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top:
                                            stateDataHeader.tipeParams !== null || stateDataHeader.tipeParams !== '' || stateDataHeader.tipeParams !== undefined
                                                ? `${categories.findIndex((category) => category.tipe === stateDataHeader.tipeParams) * 25 + 10}px`
                                                : '10px',
                                        transition: 'top 0.3s', // Animasi perpindahan
                                    }}
                                >
                                    <FontAwesomeIcon icon={faArrowAltCircleRight} width="18" height="18" style={{ color: '#7f1c1c', marginTop: '7px' }} />
                                </div>
                            </div>
                            <div style={{ width: '90%', marginTop: '25px' }}>
                                <div>
                                    {categories.map((category, index) => (
                                        <div
                                            key={category.id}
                                            className={`${styles['category-item']} ${stateDataHeader.tipeParams === category.tipe ? styles['active'] : ''}`}
                                            onClick={() => handleClick(category.id, index, category.tipe)}
                                            style={{ padding: '10px', cursor: 'pointer', marginTop: '-20px', marginLeft: '12px' }}
                                        >
                                            {category.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {stateDataHeader.tipeParams === '70200' ? <TabHutangUsahaDanSupplier userid={userid} kode_entitas={kode_entitas} sidebarVisible={sidebarVisible} token={token} /> : null}
                    {stateDataHeader.tipeParams === '70500' ? <TabBukuBesar userid={userid} kode_entitas={kode_entitas} sidebarVisible={sidebarVisible} /> : null}
                    {stateDataHeader.tipeParams === '70600' ? <TabLaporanKeuangan userid={userid} kode_entitas={kode_entitas} sidebarVisible={sidebarVisible} token={token} /> : null}
                </div>
            </div>
        </div>
    );
};

// export { getServerSideProps };

export default ReportList;
