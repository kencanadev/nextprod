interface TabelDetailDokListProps {
    isOpen: boolean;
    onClose: () => void;
    userid: any;
    kode_entitas: any;
    kode_mpb: any;
    dataApi: any;
}

const initialSortState = {
    field: '',
    order: 'asc',
};

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getServerSideProps } from '@/pages/api/getServerSide';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import React from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IRootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from '@/components/Dropdown';
import Draggable from 'react-draggable';

// export default function TabelDetailDokList({ userid, kode_entitas, kode_user, kodeSupp, kodeGudang, dataApi, kode_mpb, detailBaru }: TabelDetailDokList) {
// const TabelDetailDokList: React.FC<TabelDetailDokListProps> = ({ isOpen, onClose, userid, kode_entitas, kode_mpb, dataApi }: TabelDetailDokListProps) => {
export default function TabelDetailDokList({ isOpen, onClose, userid, kode_entitas, kode_mpb, dataApi }: TabelDetailDokListProps) {
    // const theme = useTheme({
    //     Header: `
    //         .th {
    //             border-bottom: 1px solid #a0a8ae;
    //             text-align: center; /* Center align header text */
    //         }
    //     `,
    //     Row: `
    //         &:nth-of-type(odd) {
    //             background-color: #f9fafb;
    //         }
    //         &:nth-of-type(even) {
    //             background-color: white;
    //         }
    //         &:not(:last-of-type) .td {
    //             border-bottom: 1px solid #a0a8ae;
    //         }
    //     `,
    //     BaseCell: `
    //         &:not(:last-of-type) {
    //             border-right: 1px solid #a0a8ae;
    //         }
    //         text-align: center; /* Center align cell content */
    //     `,
    //     Table: `
    //     --data-table-library_grid-template-columns: repeat(9, 1fr); /* Default layout */
    //     /* Media query for smaller screens */
    //     @media screen and (max-width: 768px) {
    //     }
    // `,
    // });

    // const tableStyle: React.CSSProperties = {
    //     border: '1px solid #dddddd',
    //     padding: '8px',
    //     textAlign: 'left',
    //     cursor: 'pointer',
    //     userSelect: 'none',
    // };

    // const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    // const [detailDok, setDetailDok] = useState<any[]>([]);
    const rowData = dataApi;
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Detail Dokumen MPB'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'no_dok'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [hideCols, setHideCols] = useState<any>(['age', 'dob', 'isActive']);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'no_dok', title: 'No. LPB' },
        { accessor: 'no_item', title: 'No. Barang' },
        { accessor: 'diskripsi', title: 'Nama Barang' },
        { accessor: 'satuan', title: 'Satuan' },
        { accessor: 'qty', title: 'Kuantitas' },
        { accessor: 'ket', title: 'Keterangan' },
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
        setInitialRecords(() => {
            return rowData.filter((item: any) => {
                return (
                    item.no_dok.toLowerCase().includes(search.toLowerCase()) ||
                    item.no_item.toLowerCase().includes(search.toLowerCase()) ||
                    item.diskripsi.toLowerCase().includes(search.toLowerCase()) ||
                    item.satuan.toLowerCase().includes(search.toLowerCase()) ||
                    item.qty.toLowerCase().includes(search.toLowerCase()) ||
                    item.ket.toString().toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [rowData, search, isOpen]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    // console.log('rowData');
    // console.log(rowData);
    return (
        // <Draggable>
            <Transition appear show={isOpen} as={React.Fragment}>
                <Dialog as="div" open={isOpen} onClose={onClose}>
                    {/* ... Modal Overlay ... */}
                    <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] bg-[black]/60">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <Transition.Child
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                {/* ... Modal Content ... */}
                                <Dialog.Panel className="panel my-8 h-[80vh] w-[80vh] rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#dedede] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Detail Memo Pengembalian Barang</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                            {/* <FontAwesomeIcon icon={faTimes} /> */}
                                        </button>
                                    </div>
                                    <div>
                                        <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                                            {/* <h5 className="text-lg font-semibold dark:text-white-light">Show/Hide Columns</h5> */}
                                            <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                                                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                                                    <div className="dropdown">
                                                        <Dropdown
                                                            placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                            btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                            button={
                                                                <>
                                                                    <span className="ltr:mr-1 rtl:ml-1">Filter Kolom</span>
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

                                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                        <div className="datatables">
                                            <DataTable
                                                className="table-hover whitespace-nowrap"
                                                records={recordsData}
                                                columns={[
                                                    {
                                                        accessor: 'no_dok',
                                                        title: 'No. LPB',
                                                        sortable: true,
                                                        hidden: hideCols.includes('no_dok'),
                                                    },
                                                    {
                                                        accessor: 'no_item',
                                                        title: 'No. Barang',
                                                        sortable: true,
                                                        hidden: hideCols.includes('no_item'),
                                                    },
                                                    {
                                                        accessor: 'diskripsi',
                                                        title: 'Nama barang',
                                                        sortable: true,
                                                        hidden: hideCols.includes('diskripsi'),
                                                    },
                                                    {
                                                        accessor: 'satuan',
                                                        title: 'Satuan',
                                                        sortable: true,
                                                        hidden: hideCols.includes('satuan'),
                                                    },
                                                    {
                                                        accessor: 'qty',
                                                        title: 'Kuantitas',
                                                        sortable: true,
                                                        hidden: hideCols.includes('qty'),
                                                    },
                                                    {
                                                        accessor: 'ket',
                                                        title: 'Keterangan',
                                                        sortable: true,
                                                        hidden: hideCols.includes('ket'),
                                                    },
                                                ]}
                                                highlightOnHover
                                                totalRecords={initialRecords.length}
                                                recordsPerPage={pageSize}
                                                // page={page}
                                                onPageChange={(p) => setPage(p)}
                                                recordsPerPageOptions={PAGE_SIZES}
                                                onRecordsPerPageChange={setPageSize}
                                                sortStatus={sortStatus}
                                                onSortStatusChange={setSortStatus}
                                                minHeight={200}
                                                // paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                            />
                                        </div>
                                    </div>
                                    <div className="mr-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-4"></div>

                                        <div className="mb-3 mt-3 flex space-x-4">
                                            {/* <button type="button" className="btn btn-primary" onClick={handleOKClick} style={{ width: '8vh', height: '4vh' }}>
                                            OK
                                        </button> */}
                                            <button type="button" className="btn btn-outline-danger" onClick={onClose} style={{ width: '8vh', height: '4vh' }}>
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
        // </Draggable>
    );
}

export { getServerSideProps };
// export default TabelDetailDokList;
