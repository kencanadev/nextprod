import React, { useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Selection, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { fetchDataKaryawan, FilterDef, KaryawanType, OnClickDetailBeban, postDeleteKaryawan, styleButton, updateKaryawanHris } from './support';
import { TextBoxComponent, FocusInEventArgs, FocusOutEventArgs } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { ComboBoxComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import moment from 'moment';
import { myAlertGlobal } from '@/utils/routines';
import KaryawanDialog from './support/KaryawanDialog';
const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
const formatDateWaktu: Object = { type: 'date', format: 'dd-MM-yyyy HH:ss' };
const DaftarKaryawan = () => {
    // Definition
    // Sessions
    const gridKaryawan = useRef<GridComponent>(null);
    const { sessionData, isLoading } = useSession();
    const entitas_user = sessionData?.entitas ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const [listTahun, setListTahun] = useState<any[]>([]);
    const [panelVisible, setPanelVisible] = useState(true);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [typeForm, setTypeForm] = useState('');
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [dsMaster, setDsMaster] = useState<KaryawanType[]>([]);
    const [selectedkaryawan, setSelectedkaryawan] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Mohon Tunggu');

    const [filterData, setFilterData] = useState<FilterDef>({
        TahunBebanValue: moment().year(),
        NamaKaryawanValue: '',
        isNamaKaryawanChecked: false,
        StatusKaryawanValue: 'Y',
    });
    const [searchValue, setSearchValue] = useState({
        namaKryValue: '',
    });
    // Function
    const openForm = (type: string) => {
        if (type === 'edit' && !selectedkaryawan) {
            console.log('selectedkaryawan :', selectedkaryawan);
            myAlertGlobal('Silahkan pilih data terlebih dahulu', 'daftarKaryawan', 'warning');
            return;
        }
        setTypeForm(type);
        setShowModalCreate(true);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };
    const updateStateFilter = (field: any, value: any) => {
        setFilterData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const TextTemplate = (props: any, field: string) => {
        return <p>{props[field]}</p>;
    };
    const deleteAkun = async () => {
        console.log('gridKaryawan.current?.getSelectedRecords() : ', gridKaryawan.current?.getSelectedRecords());
        if (!(gridKaryawan.current?.getSelectedRecords() as KaryawanType[]).length) {
            myAlertGlobal('Silahkan pilih data terlebih dahulu', 'daftarKaryawan', 'warning');
            return;
        }
        setLoading(true);
        setLoadingText('Mohon Tunggu, Sedang Menghapus Data');
        await postDeleteKaryawan(kode_entitas, token, (gridKaryawan.current?.getSelectedRecords() as KaryawanType[] as KaryawanType[])[0].kode_kry, userid.toUpperCase()).then((res) => {
            console.log('res : ', res);
            if (res.status === 'success') {
                setLoading(false);
                setLoadingText('Mohon Tunggu');
                myAlertGlobal('Data berhasil dihapus', 'daftarKaryawan', 'success');
                // await refreshData();
            } else {
                setLoading(false);
                setLoadingText('Mohon Tunggu');
                myAlertGlobal('Data gagal dihapus', 'daftarKaryawan', 'error');
            }
        });
    };
    const refreshData = async () => {
        setLoading(true);
        const newData = await fetchDataKaryawan(kode_entitas, token, filterData);
        const mod = newData.map((item: any) => ({
            ...item,
            tgl_masuk: moment(item.tgl_masuk, 'YYYY-MM-DD').toDate(),
            tgl_keluar: moment(item.tgl_keluar, 'YYYY-MM-DD').toDate(),
            tgl_gabung: moment(item.tgl_gabung, 'YYYY-MM-DD').toDate(),
            tgl_update: moment(item.tgl_update).toDate(),
        }));
        console.log('mod', mod, newData);

        setTimeout(() => {
            setDsMaster(mod);
            setLoading(false);
        }, 500);
    };
    // useEffect
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const tahunList = [];

        for (let i = 4; i >= 0; i--) {
            const newObject = {
                text: (currentYear - i).toString(),
                value: (currentYear - i).toString(),
            };
            tahunList.push(newObject);
        }

        setListTahun(tahunList);
    }, []);
    useEffect(() => {
        if (kode_entitas && token) {
            refreshData();
        }
    }, [kode_entitas]);
    return (
        <>
            <div className={`Main`} id="daftarKaryawan">
                <div className="relative block ">
                    <div className={`${loading && 'opacity-20'}`}>
                        <div style={{ minHeight: '40px' }} className="mb-1 flex flex-col items-center justify-between md:flex-row">
                            <div className="gap-2 sm:flex">
                                {/* === Button Group === */}
                                <div className="flex pr-1 sm:border-r">
                                    <ButtonComponent
                                        id="btnDataBaru"
                                        cssClass="e-primary e-small"
                                        content="Baru"
                                        style={styleButton}
                                        disabled={false}
                                        onClick={() => {
                                            setSelectedkaryawan('');
                                            openForm('create');
                                        }}
                                    />
                                    <ButtonComponent
                                        id="btnDataUbah"
                                        cssClass="e-primary e-small"
                                        content="Ubah"
                                        disabled={false}
                                        style={styleButton}
                                        onClick={() => {
                                            openForm('edit');
                                        }}
                                    />

                                    {/* <ButtonComponent
                                        id="btnHapus"
                                        cssClass="e-primary e-small"
                                        content="Hapus"
                                        // disabled
                                        style={{
                                            ...styleButton,
                                            width: 77 + 'px',
                                            height: '28px',
                                            marginBottom: '0.5em',
                                            marginTop: 0.5 + 'em',
                                            marginRight: 0.8 + 'em',
                                            color: 'white',
                                            // cursor: 'not-allowed',
                                        }}
                                        onClick={() => {
                                            deleteAkun();
                                        }}
                                    /> */}
                                    <ButtonComponent
                                        id="btnFilter"
                                        cssClass="e-primary e-small"
                                        style={
                                            panelVisible
                                                ? {
                                                      //   ...styleButton,
                                                      width: 77 + 'px',
                                                      height: '28px',
                                                      marginBottom: '0.5em',
                                                      marginTop: 0.5 + 'em',
                                                      marginRight: 0.8 + 'em',
                                                      color: 'gray',
                                                  }
                                                : { ...styleButton, color: 'white' }
                                        }
                                        onClick={handleFilterClick}
                                        disabled={panelVisible}
                                        content="Filter"
                                    />
                                    <ButtonComponent
                                        id="btnDetailBeban"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-page-text-wrap"
                                        content="Detail Beban"
                                        disabled={false}
                                        style={{
                                            ...styleButton,
                                            width: 'auto',
                                        }}
                                        onClick={() => {
                                            if ((gridKaryawan.current?.getSelectedRecords() as KaryawanType[])[0]?.nilai > 0) {
                                                const param = {
                                                    entitas: kode_entitas,
                                                    kode_kry: selectedkaryawan,
                                                    tahun: filterData.TahunBebanValue,
                                                    token: token,
                                                };
                                                OnClickDetailBeban(param);
                                            }
                                        }}
                                    />
                                    <ButtonComponent
                                        id="btnUpdateKryHRIS"
                                        cssClass="e-primary e-small"
                                        content="Update Karyawan HRIS"
                                        iconCss="e-icons e-page-text-wrap"
                                        disabled={false}
                                        style={{
                                            ...styleButton,
                                            width: 'auto',
                                        }}
                                        onClick={async () => {
                                            setLoading(true);
                                            setLoadingText('Mohon Tunggu Sedang Mengupdate Karyawan HRIS');
                                            await updateKaryawanHris(token, { entitas: kode_entitas, userid: userid }).then(async (res) => {
                                                if (res.status === 200) {
                                                    setLoading(false);
                                                    setLoadingText('Mohon Tunggu');
                                                    myAlertGlobal('Berhasil Mengupdate Karyawan HRIS', 'daftarKaryawan', 'success');
                                                    await refreshData();
                                                } else {
                                                    setLoading(false);
                                                    setLoadingText('Mohon Tunggu');
                                                    myAlertGlobal('Gagal Mengupdate Karyawan HRIS', 'daftarKaryawan', 'error');
                                                }
                                            });
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <p>
                                        <span className="underline">C</span>ari
                                    </p>
                                    {/* === Search Group === */}
                                    <div className="w-[200px] rounded border border-gray-300 bg-white px-2">
                                        <TextBoxComponent
                                            id="searchNamaKry"
                                            name="searchNamaKry"
                                            placeholder="<Nama Karyawan>"
                                            floatLabelType="Never"
                                            // value={searchValue.namaKryValue}
                                            onChange={(e: any) => {
                                                gridKaryawan.current?.search(e.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                                <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                                    Daftar Karyawan
                                </span>
                            </div>
                        </div>
                        <div className="relative flex h-[calc(100vh-230px)] gap-3">
                            {panelVisible && (
                                <div
                                    className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                                        isShowTaskMenu && '!block'
                                    }`}
                                    style={{ background: '#dedede' }}
                                >
                                    <div className="flex h-full flex-col pb-3">
                                        <div className="pb-5">
                                            <div className="flex items-center text-center">
                                                <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={() => setPanelVisible(!panelVisible)}>
                                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                                </button>
                                                <div className="shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        {/* prettier-ignore */}
                                                        <path
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    d="M22 5.814v.69c0 1.038 0 1.557-.26 1.987-.26.43-.733.697-1.682 1.231l-2.913 1.64c-.636.358-.955.538-1.182.735a2.68 2.68 0 00-.9 1.49c-.063.285-.063.619-.063 1.286v2.67c0 1.909 0 2.863-.668 3.281-.668.418-1.607.05-3.486-.684-.895-.35-1.342-.524-1.594-.879C9 18.907 9 18.451 9 17.542v-2.67c0-.666 0-1-.064-1.285a2.68 2.68 0 00-.898-1.49c-.228-.197-.547-.377-1.183-.735l-2.913-1.64c-.949-.534-1.423-.8-1.682-1.23C2 8.06 2 7.541 2 6.503v-.69"
                                                />
                                                        <path
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            d="M22 5.815c0-1.327 0-1.99-.44-2.403C21.122 3 20.415 3 19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815"
                                                            opacity="0.5"
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                            </div>
                                        </div>
                                        <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                        <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                                            <div className="flex h-full flex-col gap-6 overflow-auto">
                                                <div>
                                                    {/* Filter List */}
                                                    {/* Tahun Beban */}
                                                    <div className="mb-2">
                                                        <div className="e-checkbox-wrapper e-wrapper">
                                                            <label>
                                                                <span className="e-label">Tahun Beban</span>
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-4">
                                                            <div className="container form-input">
                                                                <ComboBoxComponent
                                                                    id="TahunBebanValue"
                                                                    fields={{ text: 'text', value: 'value' }}
                                                                    dataSource={listTahun}
                                                                    change={(args: ChangeEventArgsDropDown) => {
                                                                        const value: any = args.value;
                                                                        updateStateFilter('TahunBebanValue', value);
                                                                    }}
                                                                    showClearButton={false}
                                                                    value={filterData.TahunBebanValue}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Nama Karyawan */}
                                                    <div className="mb-2">
                                                        <div className="fle">
                                                            <CheckBoxComponent
                                                                label="Nama Karyawan"
                                                                checked={filterData.isNamaKaryawanChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    updateStateFilter('isNamaKaryawanChecked', value);
                                                                }}
                                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-4">
                                                            <div className="container form-input">
                                                                <TextBoxComponent
                                                                    id="namaKaryawan"
                                                                    name="namaKaryawan"
                                                                    placeholder=""
                                                                    value={filterData.NamaKaryawanValue}
                                                                    change={(args: FocusInEventArgs) => {
                                                                        const value: any = args.value;
                                                                        updateStateFilter('NamaKaryawanValue', value);
                                                                    }}
                                                                    blur={(args: FocusOutEventArgs) => {
                                                                        const value: any = args.value;
                                                                        console.log(value);
                                                                        if (value.length > 0) {
                                                                            updateStateFilter('isNamaKaryawanChecked', true);
                                                                        } else {
                                                                            updateStateFilter('isNamaKaryawanChecked', false);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Status Aktif */}
                                                    <div className="mb-2">
                                                        <div className="e-checkbox-wrapper e-wrapper">
                                                            <label>
                                                                <span className="e-label">Status Karyawan</span>
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-4">
                                                            <div className="flex">
                                                                <input
                                                                    type="radio"
                                                                    name="statusKaryawan"
                                                                    id="aktifY"
                                                                    className="form-radio"
                                                                    checked={filterData.StatusKaryawanValue === 'Y'}
                                                                    onChange={(event) => updateStateFilter('StatusKaryawanValue', 'Y')}
                                                                    value={'Y'}
                                                                    style={{
                                                                        borderColor: '#ffffff',
                                                                    }}
                                                                />
                                                                <label className="ml-1" style={{ marginBottom: -2 }}>
                                                                    Aktif
                                                                </label>
                                                            </div>
                                                            <div className="flex">
                                                                <input
                                                                    type="radio"
                                                                    name="statusKaryawan"
                                                                    id="aktifN"
                                                                    className="form-radio"
                                                                    checked={filterData.StatusKaryawanValue === 'N'}
                                                                    onChange={(event) => updateStateFilter('StatusKaryawanValue', 'N')}
                                                                    value={'N'}
                                                                    style={{
                                                                        borderColor: '#ffffff',
                                                                    }}
                                                                />
                                                                <label className="ml-1" style={{ marginBottom: -2 }}>
                                                                    Non Aktif
                                                                </label>
                                                            </div>
                                                            <div className="flex">
                                                                <input
                                                                    type="radio"
                                                                    name="statusKaryawan"
                                                                    id="aktifAll"
                                                                    className="form-radio"
                                                                    checked={filterData.StatusKaryawanValue === '%'}
                                                                    onChange={(event) => updateStateFilter('StatusKaryawanValue', '%')}
                                                                    value={'all'}
                                                                    style={{
                                                                        borderColor: '#ffffff',
                                                                    }}
                                                                />
                                                                <label className="ml-1" style={{ marginBottom: -2 }}>
                                                                    Semua
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </PerfectScrollbar>
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    refreshData();
                                                }}
                                                className="btn btn-primary mt-2"
                                            >
                                                <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                Refresh Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>
                            <div className="h-full flex-1 overflow-auto">
                                <GridComponent
                                    id="gridKaryawan"
                                    ref={gridKaryawan}
                                    pageSettings={{
                                        pageSize: 25,
                                        pageCount: 5,
                                        pageSizes: ['25', '50', '100', 'All'],
                                    }}
                                    name="gridKaryawan"
                                    allowPaging={true}
                                    allowSorting={true}
                                    allowFiltering={false}
                                    allowResizing={true}
                                    dataSource={dsMaster}
                                    allowSelection={true}
                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                    gridLines={'Both'}
                                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                                    height={'100%'}
                                    autoFit={true}
                                    rowHeight={22}
                                    allowReordering={true}
                                    rowSelected={(args: any) => {
                                        setSelectedkaryawan(args.data.kode_kry);
                                    }}
                                    recordDoubleClick={(args: any) => {
                                        openForm('edit');
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="nama_kry" headerText="Nama Karyawan" headerTextAlign="Center" width={300} />
                                        <ColumnDirective field="kode_hrm" headerText="NIP" headerTextAlign="Center" width={100} textAlign="Center" />
                                        <ColumnDirective field="jabatan" headerText="Jabatan" headerTextAlign="Center" />
                                        <ColumnDirective field="salesman" headerText="Link Data Salesman" headerTextAlign="Center" width={300} />
                                        <ColumnDirective field="tgl_masuk" type="date" format={formatDate} headerText="Tgl. Masuk" headerTextAlign="Center" width={100} textAlign="Center" />
                                        <ColumnDirective field="tgl_gabung" type="date" format={formatDate} headerText="Tgl. Efektif" headerTextAlign="Center" width={100} textAlign="Center" />
                                        <ColumnDirective field="tgl_keluar" type="date" format={formatDate} headerText="Tgl. Keluar" headerTextAlign="Center" width={100} textAlign="Center" />
                                        <ColumnDirective
                                            // template={(props: any) => TextTemplate(props, 'nilai')}
                                            field="nilai"
                                            headerText="Jml. Beban"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            format={'N2'}
                                        />
                                        <ColumnDirective field="tgl_update" type="date" format={formatDateWaktu} headerText="Tgl. Update" headerTextAlign="Center" width={150} textAlign="Center" />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Selection, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                </GridComponent>
                            </div>
                        </div>
                    </div>
                    {loading && (
                        <div
                            role="status"
                            className="absolute left-1/2 top-2/4 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-lg border bg-white p-4 shadow-lg"
                        >
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
                            {loadingText && <span className="font-bold text-black">{loadingText}</span>}
                        </div>
                    )}
                </div>
            </div>
            {showModalCreate && (
                <KaryawanDialog
                    isOpen={showModalCreate}
                    onClose={async () => {
                        setShowModalCreate(false);
                        gridKaryawan.current?.clearSelection();
                        await refreshData();
                    }}
                    entitas={kode_entitas}
                    token={token}
                    userid={userid}
                    KaryawanSelected={selectedkaryawan}
                    state={typeForm}
                />
            )}
        </>
    );
};

export default DaftarKaryawan;
