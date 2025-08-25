import React, { useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Selection, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { fetchSubledgerData, FilterDef, postHapusSubledger, SubledgerType } from './support';
import { FillFromSQL, myAlertGlobal, swalDialog } from '@/utils/routines';
import FrmDialogSubledger from './support/FrmDialogSubledger';
import withReactContent from 'sweetalert2-react-content';

const Index = () => {
    const gridAkunSubledger = useRef<GridComponent | any>(null);
    const [gridAkunSubledgerOri, setGridAkunSubledgerOri] = useState<SubledgerType[]>([]);

    const { sessionData, isLoading } = useSession();
    const entitas_user = sessionData?.entitas ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const [panelVisible, setPanelVisible] = useState(true);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [typeForm, setTypeForm] = useState('');
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [filterData, setFilterData] = useState<FilterDef>({
        noSubledgerValue: '',
        keteranganValue: '',
        akunBukuBesarValue: '',
        nonAktifValue: 'Y',
        isNoSubledgerChecked: false,
        isKeteranganChecked: false,
        isAkunBukuBesarChecked: false,
    });
    const [dsMaster, setDsMaster] = useState<SubledgerType[]>([]);
    const [selectedAkun, setSelectedAkun] = useState<SubledgerType>({
        kode_subledger: '',
        kode_akun: '',
        no_subledger: '',
        nama_subledger: '',
        aktif: '',
        catatan: null,
        userid: '',
        tgl_update: '',
        kode_relasi: null,
        no_akun: '',
        nama_akun: '',
        normal: '',
        namaakun: '',
        balance: '',
    });

    const [searchValue, setSearchValue] = useState({ noAkun: '', keterangan: '' });

    const [dsAkunBukuBesar, setDsAkunBukuBesar] = useState<any[]>([]);
    const styleButton = { width: 77 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    // Function
    const openForm = (type: string) => {
        if (selectedAkun.kode_subledger === '' && type === 'edit') {
            myAlertGlobal('Pilih data yang akan diubah terlebih dahulu.', 'daftarAkunSubledger', 'warning');
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
    const deleteAkun = async (KodeAkun: string, KodeSubledger: string, Balance: number, NoSubledger: string, NamaAkun: string) => {
        // console.log('KodeAkun:', KodeAkun, 'KodeSubledger:', KodeSubledger);
        if (!KodeAkun || !KodeSubledger) {
            myAlertGlobal('Pilih data yang akan dihapus terlebih dahulu.', 'daftarAkunSubledger', 'warning');
            return;
        }
        if (Balance !== 0) {
            myAlertGlobal('No. Subledger ' + NoSubledger + ' saldo balance belum nol tidak bisa dihapus', 'daftarAkunSubledger', 'warning');
            return;
        }
        withReactContent(swalDialog)
            .fire({
                title: '<p style="font-size:13px; font-weight:bold; text-align:center;">Hapus Data Subledger </p>',
                html: `
                                <div class="custom-content" style="font-size:13px; text-align:left;">
                                    <p><strong>No. Subledger   :</strong> ${NoSubledger}</p>
                                    <p><strong>Keterangan   :</strong> ${NamaAkun}</p>
                                </div>
                            `,
                width: '21%',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                showCancelButton: true,
                target: '#FrmDialogDepartemen',
            })
            .then(async (result) => {
                if (result.isConfirmed) {
                    const newJSON = {
                        kode_entitas: kode_entitas,
                        kode_akun: KodeAkun,
                        kode_subledger: KodeSubledger,
                        no_subledger: NoSubledger,
                        userid: kode_user,
                    };
                    await postHapusSubledger(kode_entitas, token, newJSON).then(async () => {
                        await refreshData();
                        setSelectedAkun({
                            kode_subledger: '',
                            kode_akun: '',
                            no_subledger: '',
                            nama_subledger: '',
                            aktif: '',
                            catatan: null,
                            userid: '',
                            tgl_update: '',
                            kode_relasi: null,
                            no_akun: '',
                            nama_akun: '',
                            normal: '',
                            namaakun: '',
                            balance: '',
                        });
                        myAlertGlobal('Data Subledger berhasil dihapus', 'daftarAkunSubledger', 'success');
                    });
                }
            });
    };
    const refreshData = async () => {
        const newData = await fetchSubledgerData(kode_entitas, token, filterData);
        setDsMaster(newData);
        setGridAkunSubledgerOri(newData);

        ['seacrhNoSub', 'seacrhKeterangan'].forEach((id) => {
            const input = document.getElementById(id) as HTMLInputElement | null;
            if (input) input.value = '';
        });
    };
    // UseEffect
    useEffect(() => {
        const fetchAkunFilter = async () => {
            const newAkunFilter = await FillFromSQL(kode_entitas, 'akun', '', token);
            setDsAkunBukuBesar(newAkunFilter);
        };
        if (kode_entitas && token) {
            refreshData();
            fetchAkunFilter();
        }
    }, [kode_entitas]);

    const handleSearchChange = (key: 'noSub' | 'keterangan', value: string) => {
        const filtered = gridAkunSubledgerOri.filter((item) => {
            if (key === 'noSub') return item.no_subledger === value;
            if (key === 'keterangan') return item.nama_subledger?.toLowerCase().includes(value.toLowerCase());
            return false;
        });

        setDsMaster(filtered);

        const resetFieldId = key === 'noSub' ? 'seacrhKeterangan' : 'seacrhNoSub';
        const resetField = document.getElementById(resetFieldId) as HTMLInputElement | null;
        if (resetField) resetField.value = '';
    };
    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
        setIsShowTaskMenu(!panelVisible);
        //  setIsShowTaskMenu(!isShowTaskMenu);
    };

    useEffect(() => {
        const handleResize = () => {
            setPanelVisible(window.innerWidth >= 1280);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <>
            <div className={`Main`} id="daftarAkunSubledger">
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
                                    color: 'white',
                                    // width: 77 + 'px',
                                    // height: '28px',
                                    // marginBottom: '0.5em',
                                    // marginTop: 0.5 + 'em',
                                    // marginRight: 0.8 + 'em',
                                    // color: 'gray',
                                    // cursor: 'not-allowed',
                                }}
                                onClick={() => {
                                    // openForm('edit');
                                    const selectedRecord = gridAkunSubledger.current?.getSelectedRecords() as SubledgerType[];
                                    deleteAkun(
                                        selectedRecord[0]?.kode_akun,
                                        selectedRecord[0]?.kode_subledger,
                                        parseFloat(selectedRecord[0]?.balance),
                                        selectedRecord[0]?.no_subledger,
                                        selectedRecord[0]?.nama_akun
                                    );
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
                                onClick={handleTogglePanel} //{handleFilterClick}
                                disabled={panelVisible}
                                content="Filter"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <p>
                                <span className="underline">C</span>ari
                            </p>
                            {/* === Search Group === */}
                            <div className="rounded border border-gray-300 bg-white px-2">
                                <TextBoxComponent
                                    id="seacrhNoSub"
                                    name="seacrhNoSub"
                                    placeholder="<No. Subledger>"
                                    floatLabelType="Never"
                                    // value={searchValue.noAkunValue}
                                    // onChange={(e: any) => {
                                    //     // setSearchValue({ ...searchValue, noAkunValue: e.value });
                                    //     gridAkunSubledger.current?.search(e.value);
                                    // }}
                                    onChange={(e: any) => handleSearchChange('noSub', e.value)}
                                />
                            </div>
                            <div className="rounded border border-gray-300 bg-white px-2">
                                <TextBoxComponent
                                    id="seacrhKeterangan"
                                    name="seacrhKeterangan"
                                    placeholder="<Keterangan>"
                                    floatLabelType="Never"
                                    // value={searchValue.namaAkunValue}
                                    // onChange={(e: any) => {
                                    //     gridAkunSubledger.current?.search(e.value);
                                    // }}
                                    onChange={(e: any) => handleSearchChange('keterangan', e.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            Daftar Akun Pembantu (Subledger)
                        </span>
                    </div>
                </div>
                <div className="relative flex h-full gap-1 sm:h-[calc(100vh_-_150px)]">
                    {panelVisible && (
                        <div
                            className={`panel relative z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 p-4 xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                                isShowTaskMenu && '!block'
                            }`}
                            style={{ background: '#dedede' }}
                        >
                            <div className="flex h-full flex-col pb-3">
                                <div className="pb-5">
                                    <div className="flex items-center text-center">
                                        <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                        </button>
                                        <div className="shrink-0">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                                                <path
                                                    opacity="0.5"
                                                    d="M16 4.00195C18.175 4.01406 19.3529 4.11051 20.1213 4.87889C21 5.75757 21 7.17179 21 10.0002V16.0002C21 18.8286 21 20.2429 20.1213 21.1215C19.2426 22.0002 17.8284 22.0002 15 22.0002H9C6.17157 22.0002 4.75736 22.0002 3.87868 21.1215C3 20.2429 3 18.8286 3 16.0002V10.0002C3 7.17179 3 5.75757 3.87868 4.87889C4.64706 4.11051 5.82497 4.01406 8 4.00195"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                                <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M7 10.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M9 17.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path
                                                    d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                    </div>
                                </div>

                                <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                    <div className="flex h-full flex-col gap-6 overflow-auto">
                                        {/* Filter List */}
                                        <div>
                                            {/* No. Akun */}
                                            <div className="mt-2 flex">
                                                <CheckBoxComponent
                                                    label="No. Subledger"
                                                    checked={filterData.isNoSubledgerChecked}
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        updateStateFilter('isNoSubledgerChecked', value);
                                                    }}
                                                    style={{ borderRadius: 3, borderColor: 'gray' }}
                                                />
                                            </div>
                                            <div className="mt-1 flex justify-between">
                                                <div className="container form-input">
                                                    <TextBoxComponent
                                                        id="noAkun"
                                                        name="noAkun"
                                                        placeholder=""
                                                        value={filterData.noSubledgerValue}
                                                        input={(args: FocusInEventArgs) => {
                                                            const value: any = args.value;
                                                            updateStateFilter('noSubledgerValue', value);
                                                            if (value.length > 0) {
                                                                updateStateFilter('isNoSubledgerChecked', true);
                                                            } else {
                                                                updateStateFilter('isNoSubledgerChecked', false);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Keterangan */}
                                            <div className="mt-2 flex">
                                                <CheckBoxComponent
                                                    label="Keterangan"
                                                    checked={filterData.isKeteranganChecked}
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        updateStateFilter('isKeteranganChecked', value);
                                                    }}
                                                    style={{ borderRadius: 3, borderColor: 'gray' }}
                                                />
                                            </div>
                                            <div className="mt-1 flex justify-between">
                                                <div className="container form-input">
                                                    <TextBoxComponent
                                                        id="keterangan"
                                                        name="keterangan"
                                                        placeholder=""
                                                        value={filterData.keteranganValue}
                                                        input={(args: FocusInEventArgs) => {
                                                            const value: any = args.value;
                                                            updateStateFilter('keteranganValue', value);
                                                            if (value.length > 0) {
                                                                updateStateFilter('isKeteranganChecked', true);
                                                            } else {
                                                                updateStateFilter('isKeteranganChecked', false);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Tipe */}
                                            <div className="mt-2 flex">
                                                <CheckBoxComponent
                                                    label="Akun Buku Besar"
                                                    checked={filterData.isAkunBukuBesarChecked}
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        updateStateFilter('isAkunBukuBesarChecked', value);
                                                    }}
                                                    style={{ borderRadius: 3, borderColor: 'gray' }}
                                                />
                                            </div>
                                            <div className="mt-1 flex justify-between">
                                                <div className="container form-input">
                                                    <ComboBoxComponent
                                                        id="akunBukuBesarValue"
                                                        fields={{ text: 'nama_akun', value: 'kode_akun' }}
                                                        dataSource={dsAkunBukuBesar}
                                                        change={(args: ChangeEventArgsDropDown) => {
                                                            const value: any = args.value;
                                                            updateStateFilter('akunBukuBesarValue', value);

                                                            if (value) {
                                                                updateStateFilter('isAkunBukuBesarChecked', true);
                                                            } else {
                                                                updateStateFilter('isAkunBukuBesarChecked', false);
                                                            }
                                                        }}
                                                        showClearButton={false}
                                                        value={filterData.akunBukuBesarValue}
                                                    />
                                                </div>
                                            </div>
                                            {/* Non Aktif */}
                                            <div className="mt-1 ">
                                                <div className="e-checkbox-wrapper e-wrapper">
                                                    <label>
                                                        <span className="e-label">Non Aktif</span>
                                                    </label>
                                                </div>
                                                <div className="mt-1 flex items-center gap-4">
                                                    <div className="flex">
                                                        <input
                                                            type="radio"
                                                            name="nonAktif"
                                                            id="nonAkifY"
                                                            className="form-radio"
                                                            checked={filterData.nonAktifValue === 'N'}
                                                            onChange={(event) => updateStateFilter('nonAktifValue', 'N')}
                                                            value={'Y'}
                                                            style={{
                                                                borderColor: '#ffffff',
                                                            }}
                                                        />
                                                        <label className="ml-1" style={{ marginBottom: -2 }}>
                                                            YA
                                                        </label>
                                                    </div>
                                                    <div className="flex">
                                                        <input
                                                            type="radio"
                                                            name="nonAktif"
                                                            id="nonAktifN"
                                                            className="form-radio"
                                                            checked={filterData.nonAktifValue === 'Y'}
                                                            onChange={(event) => updateStateFilter('nonAktifValue', 'Y')}
                                                            value={'N'}
                                                            style={{
                                                                borderColor: '#ffffff',
                                                            }}
                                                        />
                                                        <label className="ml-1" style={{ marginBottom: -2 }}>
                                                            Tidak
                                                        </label>
                                                    </div>
                                                    <div className="flex">
                                                        <input
                                                            type="radio"
                                                            name="nonAktif"
                                                            id="nonAkifAll"
                                                            className="form-radio"
                                                            checked={filterData.nonAktifValue === 'all' || filterData.nonAktifValue === ''}
                                                            onChange={(event) => updateStateFilter('nonAktifValue', '')}
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
                                {/* <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                                </PerfectScrollbar> */}
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
                    <div
                        className="panel h-full flex-1 overflow-auto p-1"
                        // style={{ background: '#dedede' }}
                    >
                        <div className="flex items-center ltr:mr-3 rtl:ml-3">
                            <button
                                type="button"
                                className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3"
                                onClick={() => {
                                    handleTogglePanel();
                                    // setIsShowTaskMenu(!isShowTaskMenu);
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="h-full flex-1 overflow-auto">
                            <GridComponent
                                id="gridAkunSubledger"
                                ref={gridAkunSubledger}
                                pageSettings={{
                                    pageSize: 25,
                                    pageCount: 5,
                                    pageSizes: ['25', '50', '100', 'All'],
                                }}
                                name="gridAkunSubledger"
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
                                    setSelectedAkun(args.data);
                                }}
                                recordDoubleClick={(args: any) => {
                                    setSelectedAkun(args.rowData);
                                    openForm('edit');
                                }}
                                allowTextWrap={true}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="namaakun" headerText="Akun Buku Besar" headerTextAlign="Center" width={250} />
                                    <ColumnDirective field="no_subledger" headerText="No. Subledger" headerTextAlign="Center" width={80} />
                                    <ColumnDirective field="nama_subledger" headerText="Keterangan" headerTextAlign="Center" width={250} />
                                </ColumnsDirective>
                                <Inject services={[Page, Selection, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                            </GridComponent>
                        </div>
                    </div>
                </div>
            </div>
            {showModalCreate && (
                <FrmDialogSubledger
                    isOpen={showModalCreate}
                    onClose={async () => {
                        await refreshData();
                        setShowModalCreate(false);
                        setSelectedAkun({
                            kode_subledger: '',
                            kode_akun: '',
                            no_subledger: '',
                            nama_subledger: '',
                            aktif: '',
                            catatan: null,
                            userid: '',
                            tgl_update: '',
                            kode_relasi: null,
                            no_akun: '',
                            nama_akun: '',
                            normal: '',
                            namaakun: '',
                            balance: '',
                        });
                        setTypeForm('');
                    }}
                    entitas={kode_entitas}
                    token={token}
                    userid={userid}
                    AkunSelected={selectedAkun ?? ''}
                    state={typeForm}
                />
            )}
        </>
    );
};

export default Index;
