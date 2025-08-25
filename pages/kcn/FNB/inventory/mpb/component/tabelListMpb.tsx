/* eslint-disable react-hooks/rules-of-hooks */
import { useTheme } from '@table-library/react-table-library/theme';
import { getServerSideProps } from '@/pages/api/getServerSide';
import 'react-tabs/style/react-tabs.css';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import React from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IRootState } from '@/store';
import Dropdown from '@/components/Dropdown';
import router from 'next/router';
import { FirstDayInPeriod } from '@/utils/routines';
import SweetAlerts from './SweetAlertsNotif';
import moment from 'moment';

interface TabelListProps {
    userid: any;
    kode_entitas: any;
    propsMpbListApi: any;
    propsUserid: any;
    propsKode_entitas: any;
    propsKirimDataListKodeMpb: any;
    propsKirimDataListNoMpb: any;
    propsKirimDataListTglMpb: any;
    propsKirimDataListStatus: any;
}

export default function TabelListMpb({
    userid,
    kode_entitas,
    propsMpbListApi,
    propsUserid,
    propsKode_entitas,
    propsKirimDataListKodeMpb,
    propsKirimDataListNoMpb,
    propsKirimDataListTglMpb,
    propsKirimDataListStatus,
}: TabelListProps) {
    // console.log(propsKode_entitas);
    const theme = useTheme({
        Header: `
            .th {
                border-bottom: 1px solid #a0a8ae;
                text-align: center; /* Center align header text */
            }
        `,
        Row: `
            &:nth-of-type(odd) {
                background-color: #f9fafb;
            }
            &:nth-of-type(even) {
                background-color: white;
            }
            &:not(:last-of-type) .td {
                border-bottom: 1px solid #a0a8ae;
            }
        `,
        BaseCell: `
            &:not(:last-of-type) {
                border-right: 1px solid #a0a8ae;
            }
            text-align: center; /* Center align cell content */
        `,
        Table: `
        --data-table-library_grid-template-columns: repeat(9, 1fr); /* Default layout */
        /* Media query for smaller screens */
        @media screen and (max-width: 768px) {
        }
    `,
    });

    const [mKodeMpb, setmKodeMpb] = useState('');
    const rowData = propsMpbListApi;
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('MPB LIST'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'no_mpb'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['age', 'dob', 'isActive']);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'no_mpb', title: 'No. MPB' },
        { accessor: 'tgl_mpb', title: 'Tgl. MPB' },
        { accessor: 'nama_gudang', title: 'Gudang' },
        { accessor: 'nama_supp', title: 'Supplier' },
        { accessor: 'netto_rp', title: 'Netto (Rp.)' },
        { accessor: 'pengemudi', title: 'Pengemudi' },
        { accessor: 'nopol', title: 'Nopol' },
    ];

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    const mounted = useRef(false);
    useEffect(() => {
        // console.log(rowData);
        // console.log(rowData);
        setInitialRecords(() => {
            return rowData.filter((item: any) => {
                return (
                    item.no_mpb.toLowerCase().includes(search.toLowerCase()) ||
                    item.tgl_mpb.toLowerCase().includes(search.toLowerCase()) ||
                    item.nama_gudang.toLowerCase().includes(search.toLowerCase()) ||
                    item.nama_supp.toLowerCase().includes(search.toLowerCase()) ||
                    item.netto_rp.toLowerCase().includes(search.toLowerCase()) ||
                    item.pengemudi.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.nopol.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [rowData, search]);

    // console.log(initialRecords);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const tabChanged = () => {
        setIsShowTaskMenu(false);
    };

    const [periode, setPeriode] = useState('');
    const fromFirstDayInPeriod = async () => {
        try {
            const periode = await FirstDayInPeriod(kode_entitas);
            setPeriode(periode);
            // console.log(periode);
        } catch (error) {}
    };

    fromFirstDayInPeriod();

    const [selectedRow, setSelectedRow] = useState('');
    const handleRowClick = (kode_mpb: any, no_mpb: any, tglDokumen: any, status: any) => {
        // console.log('periode');
        // console.log(kode_mpb);
        setSelectedRow(kode_mpb);
        propsKirimDataListKodeMpb(kode_mpb);
        propsKirimDataListNoMpb(no_mpb);
        propsKirimDataListTglMpb(tglDokumen);
        propsKirimDataListStatus(status);

        // if (!selectedRow) {
        //     // alert('Pilih List MPB yang akan diedit');
        // } else {
        //     if (moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss') < periode) {
        //         // SweetAlerts.showAlertBlockingPeriodeAkuntansi(13);
        //     } else if (status != 'Terbuka') {
        //         // SweetAlerts.showAlertStatusDokumen(2, status);
        //     } else {
        //         // const EncoDeStr = btoa(`entitas=${kode_entitas}&kode_mpb=${selectedRow},jenis=edit`);
        //         // router.push({ pathname: './mpb', query: { pKodeMpb: `${selectedRow}`, jenis: 'edit' } });
        //         // const x = Buffer.from(`entitas=${kode_entitas}&kode_mpb=${selectedRow}&jenis=edit`).toString('base64');
        //         // router.push({ pathname: './mpb', query: { x_: x } });
        //     }
        //     // const x = Buffer.from(`entitas=${kode_entitas}&kode_mpb=${selectedRow}&jenis=edit`).toString('base64');
        //     // router.push({ pathname: './mpb', query: { x_: x } });
        // }
    };

    const handleDoubleClick = (kode_mpb: any, no_mpb: any, tglDokumen: any, status: any) => {
        // console.log('periode');
        // console.log(kode_mpb);
        setSelectedRow(kode_mpb);
        propsKirimDataListKodeMpb(kode_mpb);
        propsKirimDataListNoMpb(no_mpb);
        propsKirimDataListTglMpb(tglDokumen);
        propsKirimDataListStatus(status);

        if (!selectedRow) {
            alert('Pilih List MPB yang akan diedit');
        } else {
            if (moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss') < periode) {
                SweetAlerts.showAlertBlockingPeriodeAkuntansi(13);
            } else if (status != 'Terbuka') {
                SweetAlerts.showAlertStatusDokumen(2, status);
            } else {
                // const EncoDeStr = btoa(`entitas=${kode_entitas}&kode_mpb=${selectedRow},jenis=edit`);
                // router.push({ pathname: './mpb', query: { pKodeMpb: `${selectedRow}`, jenis: 'edit' } });
                const x = Buffer.from(`entitas=${kode_entitas}&kode_mpb=${selectedRow}&jenis=edit`).toString('base64');
                router.push({ pathname: './mpb', query: { x_: x } });
            }
            // const x = Buffer.from(`entitas=${kode_entitas}&kode_mpb=${selectedRow}&jenis=edit`).toString('base64');
            // router.push({ pathname: './mpb', query: { x_: x } });
        }
    };

    return (
        <div>
            {/* <div className="panel mt-6"> */}
            <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center ">
                {/* <h5 className="text-lg font-semibold dark:text-white-light">Show/Hide Columns</h5> */}
                <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="dropdown ">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                btnClassName="!flex items-center border font-semibold border-black dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                button={
                                    <>
                                        <span className="font-bold ltr:mr-1 rtl:ml-1 ">Filter Kolom</span>
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </>
                                }
                            >
                                <ul className="!min-w-[140px]">
                                    {cols.map((col, i) => {
                                        return (
                                            <li
                                                key={i}
                                                className="flex flex-col"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <div className="flex items-center px-4 py-1">
                                                    <label className="mb-0 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={!hideCols.includes(col.accessor)}
                                                            className="form-checkbox"
                                                            defaultValue={col.accessor}
                                                            onChange={(event: any) => {
                                                                setHideCols(event.target.value);
                                                                showHideColumns(col.accessor, event.target.checked);
                                                            }}
                                                        />
                                                        <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                    </label>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                    <div className="text-right">
                        <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
            <div className="datatables">
                <DataTable
                    className="table-hover whitespace-nowrap border-b border-black dark:border-[#1b2e4b]"
                    records={recordsData}
                    columns={[
                        {
                            accessor: 'no_mpb',
                            title: 'No. MPB',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('no_mpb'),
                            render: ({ no_mpb, kode_mpb, tgl_mpb, status }) => (
                                <div
                                    style={{ textAlign: 'left', cursor: 'pointer' }}
                                    onClick={() => {
                                        handleRowClick(kode_mpb, no_mpb, tgl_mpb, status);
                                        // alert('kode_mpb dari komponen ' + kode_mpb);
                                        // alert('selectedRow ' + selectedRow);
                                    }}
                                    onDoubleClick={() => {
                                        handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status);
                                    }}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {no_mpb}</div> : <div> {no_mpb}</div>}
                                </div>
                            ),
                        },
                        {
                            accessor: 'tgl_mpb',
                            title: 'Tanggal',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('tgl_mpb'),
                            render: ({ tgl_mpb, kode_mpb, no_mpb, status }) => (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onDoubleClick={() => {
                                        handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status);
                                    }}
                                    onClick={() => handleRowClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {tgl_mpb}</div> : <div> {tgl_mpb}</div>}
                                </div>
                            ),
                            // render: ({ no_mpb, kode_mpb }) => (
                            //     <div
                            //         style={{ textAlign: 'right', cursor: 'pointer' }}
                            //         onClick={() => {
                            //             handleRowClick(kode_mpb);
                            //             // alert('kode_mpb dari komponen ' + kode_mpb);
                            //             // alert('selectedRow ' + selectedRow);
                            //         }}
                            //         onDoubleClick={() => {
                            //             handleRowClick(kode_mpb);
                            //             //  alert('kode_mpb ' + kode_mpb);
                            //         }}
                            //     >
                            //         {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {no_mpb}</div> : <div> {no_mpb}</div>}
                            //     </div>
                            // ),
                        },
                        {
                            accessor: 'nama_gudang',
                            title: 'Gudang',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('nama_gudang'),
                            render: ({ nama_gudang, kode_mpb, no_mpb, tgl_mpb, status }) => (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onDoubleClick={() => {
                                        handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status);
                                    }}
                                    onClick={() => handleRowClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {nama_gudang}</div> : <div> {nama_gudang}</div>}
                                </div>
                            ),
                            // render: ({ no_mpb, kode_mpb }) => (
                            //     <div
                            //         style={{ textAlign: 'right', cursor: 'pointer' }}
                            //         onClick={() => {
                            //             handleRowClick(kode_mpb);
                            //             // alert('kode_mpb dari komponen ' + kode_mpb);
                            //             // alert('selectedRow ' + selectedRow);
                            //         }}
                            //         onDoubleClick={() => {
                            //             handleRowClick(kode_mpb);
                            //             //  alert('kode_mpb ' + kode_mpb);
                            //         }}
                            //     >
                            //         {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {no_mpb}</div> : <div> {no_mpb}</div>}
                            //     </div>
                            // ),
                        },
                        {
                            accessor: 'nama_supp',
                            title: 'Supplier',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('nama_supp'),
                            render: ({ nama_supp, kode_mpb, no_mpb, tgl_mpb, status }) => (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onDoubleClick={() => handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                    onClick={() => handleRowClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {nama_supp}</div> : <div> {nama_supp}</div>}
                                </div>
                            ),
                            // render: ({ no_mpb, kode_mpb }) => (
                            //     <div
                            //         style={{ textAlign: 'right', cursor: 'pointer' }}
                            //         onClick={() => {
                            //             handleRowClick(kode_mpb);
                            //             // alert('kode_mpb dari komponen ' + kode_mpb);
                            //             // alert('selectedRow ' + selectedRow);
                            //         }}
                            //         onDoubleClick={() => {
                            //             handleRowClick(kode_mpb);
                            //             //  alert('kode_mpb ' + kode_mpb);
                            //         }}
                            //     >
                            //         {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {no_mpb}</div> : <div> {no_mpb}</div>}
                            //     </div>
                            // ),
                        },
                        {
                            accessor: 'netto_rp',
                            title: 'Netto (Rp.)',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('netto_rp'),
                            render: ({ netto_rp, kode_mpb, no_mpb, tgl_mpb, status }) => (
                                <div
                                    style={{ textAlign: 'right', cursor: 'pointer' }}
                                    onDoubleClick={() => handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                    onClick={() => handleRowClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {netto_rp}</div> : <div> {netto_rp}</div>}
                                </div>
                            ),
                        },
                        {
                            accessor: 'pengemudi',
                            title: 'Pengemudi',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('pengemudi'),
                            render: ({ pengemudi, kode_mpb, no_mpb, tgl_mpb, status }) => (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onDoubleClick={() => handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                    onClick={() => handleRowClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {pengemudi}</div> : <div> {pengemudi}</div>}
                                </div>
                            ),
                        },
                        {
                            accessor: 'nopol',
                            title: 'No. Kendaraan',
                            titleStyle: { textAlign: 'center' },
                            sortable: true,
                            hidden: hideCols.includes('nopol'),
                            render: ({ nopol, kode_mpb, no_mpb, tgl_mpb, status }) => (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onDoubleClick={() => handleDoubleClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                    onClick={() => handleRowClick(kode_mpb, no_mpb, tgl_mpb, status)}
                                >
                                    {selectedRow === kode_mpb ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {nopol}</div> : <div> {nopol}</div>}
                                </div>
                            ),
                        },
                    ]}
                    highlightOnHover
                    totalRecords={initialRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
            {/* </div> */}
        </div>
    );
}

export { getServerSideProps };
