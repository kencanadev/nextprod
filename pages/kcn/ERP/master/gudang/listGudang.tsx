import { useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import CreateGudang from './modal/CreateGudang';
import EditGudang from './modal/EditGudang';
import { useRouter } from 'next/router';
import { useSession } from '@/pages/api/sessionContext';
import { HandleSearchNamaGudang } from './function/function';

const ListGudang = () => {
    const router = useRouter();

    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';

    if (isLoading) {
        return;
    }

    const { userPermissions } = router.query;

    const [editDisabled, setEditDisabled] = useState(false);
    const [createDisabled, setCreateDisabled] = useState(false);
    const [deleteDisabled, setDeleteDisabled] = useState(false);
    const [namaGudang, setnamaGudang] = useState('');

    useEffect(() => {
        if (typeof userPermissions === 'string') {
            const permissionsObj = JSON.parse(userPermissions);
            setEditDisabled(!permissionsObj.edit);
            setCreateDisabled(!permissionsObj.create);
            setDeleteDisabled(!permissionsObj.delete);
        }
    }, [userPermissions]);

    type MasterGudangItem = {
        kode_gudang: any;
        nama_gudang: any;
        alamat: any;
        alamat2: any;
        personal: any;
        catatan: any;
        aktif: any;
        userid: any;
        tgl_update: any;
        jenis: any;
        kpi: any;
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [25, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'kode_gudang',
        direction: 'asc',
    });

    const [totalRecords, setTotalRecords] = useState(0);
    const [allRecords, setAllRecords] = useState<MasterGudangItem[]>([]);
    const [originalDataState, setOriginalDataState] = useState<any>([]);

    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [recordsData, setRecordsData] = useState<MasterGudangItem[]>([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/master_gudang?`, {
                params: {
                    entitas: kode_entitas,
                },
            });
            const responseData = response.data.data;

            const transformedData: MasterGudangItem[] = responseData.map((item: any) => ({
                kode_gudang: item.kode_gudang,
                nama_gudang: item.nama_gudang,
                alamat: item.alamat,
                alamat2: item.alamat2,
                personal: item.personal,
                catatan: item.catatan,
                aktif: item.aktif,
                userid: item.userid,
                tgl_update: item.tgl_update,
                jenis: item.jenis,
                kpi: item.kpi,
            }));

            setAllRecords(transformedData);
            setTotalRecords(transformedData.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/master_gudang?`, {
                    params: {
                        entitas: kode_entitas,
                    },
                });
                const responseData = response.data.data;

                const transformedData: MasterGudangItem[] = responseData.map((item: any) => ({
                    kode_gudang: item.kode_gudang,
                    nama_gudang: item.nama_gudang,
                    alamat: item.alamat,
                    alamat2: item.alamat2,
                    personal: item.personal,
                    catatan: item.catatan,
                    aktif: item.aktif,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    jenis: item.jenis,
                    kpi: item.kpi,
                }));

                setAllRecords(transformedData);
                setTotalRecords(transformedData.length);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataUseEffect();
    }, []);

    //fix table kosong saat di last page lalu pilih jumlah data
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = Math.min(from + pageSize, totalRecords);

        const sortedData = [...allRecords].sort((a, b) => {
            const columnAccessor = sortStatus.columnAccessor as keyof MasterGudangItem;
            const direction = sortStatus.direction === 'asc' ? 1 : -1;

            if (a[columnAccessor] < b[columnAccessor]) return -direction;
            if (a[columnAccessor] > b[columnAccessor]) return direction;
            return 0;
        });

        const dataToDisplay = sortedData.slice(from, to);
        setRecordsData(dataToDisplay);
        setOriginalDataState(dataToDisplay);
    }, [page, pageSize, sortStatus, allRecords, totalRecords]);

    const handleDelete = async (kode_gudang: any) => {
        try {
            const response = await axios.delete(`${apiUrl}/erp/delete_master_gudang?`, {
                params: {
                    kode_gudang: kode_gudang,
                    entitas: kode_entitas,
                },
            });

            if (response.data.status == true) {
                fetchData();
            }

            const newTotalRecords = totalRecords - 1;
            const totalPages = Math.ceil(newTotalRecords / pageSize);

            // fix page number jika pada last page hanya ada 1 data dan data tersebut dihapus
            if (page > totalPages) {
                setPage(Math.max(totalPages, 1));
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const handleRowClick = (record: any, index: number) => {
        if (selectedRowIndex === index) {
            setEditGudangModal(true);
        } else {
            setSelectedRow(record);
            setSelectedRowIndex(index);
        }
    };

    // modal
    const [createGudangModal, setCreateGudangModal] = useState(false);
    const [deleteGudangModal, setDeleteGudangModal] = useState(false);
    const [editGudangModal, setEditGudangModal] = useState(false);

    //refresh
    const handleRefresh = async () => {
        fetchData();
    };

    return (
        <div>
            <div className="mb-4 flex flex-col justify-between md:flex-row">
                <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="flex flex-col md:flex-row">
                        <button
                            disabled={createDisabled}
                            type="submit"
                            className="btn mb-2 md:mb-0 md:mr-2"
                            onClick={() => {
                                setCreateGudangModal(true);
                            }}
                            style={{ background: '#3b3f5c', color: 'white' }}
                        >
                            Baru
                        </button>
                        <CreateGudang
                            kode_entitas={kode_entitas}
                            fetchData={fetchData}
                            isOpen={createGudangModal}
                            onClose={() => setCreateGudangModal(false)}
                            userid={userid}
                            entitasUser={kode_entitas}
                        />
                        <button
                            disabled={editDisabled}
                            type="submit"
                            className="btn mb-2 md:mb-0 md:mr-2"
                            onClick={() => {
                                if (selectedRow) {
                                    setEditGudangModal(true);
                                } else {
                                    alert('Pilih data gudang terlebih dahulu');
                                }
                            }}
                            style={{ background: '#3b3f5c', color: 'white' }}
                        >
                            Ubah
                        </button>
                        <EditGudang
                            kode_entitas={kode_entitas}
                            selectedRow={selectedRow}
                            fetchData={fetchData}
                            isOpen={editGudangModal}
                            onClose={() => setEditGudangModal(false)}
                            userid={userid}
                            entitasUser={kode_entitas}
                        />
                        {/* <button
                        disabled={deleteDisabled}
                        type="button"
                        className="btn mb-2 md:mb-0 md:mr-2"
                        onClick={() => {
                            if (selectedRow) {
                                setDeleteGudangModal(true);
                            } else {
                                alert('Pilih data gudang terlebih dahulu');
                            }
                        }}
                        style={{ background: '#3b3f5c', color: 'white' }}
                    >
                        Hapus
                    </button> */}

                        <Transition appear show={deleteGudangModal}>
                            <Dialog as="div" open={deleteGudangModal} onClose={() => setDeleteGudangModal(false)}>
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
                                            <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                                <div className="p-5">
                                                    <p>Apakah anda yakin ingin menghapus data?</p>
                                                    <div className="mt-8 flex items-center justify-end">
                                                        <button
                                                            onClick={() => {
                                                                if (selectedRow) {
                                                                    handleDelete(selectedRow.kode_gudang);
                                                                    setSelectedRow(null);
                                                                    setDeleteGudangModal(false);
                                                                } else {
                                                                    alert('Pilih Data Gudang terlebih dahulu');
                                                                }
                                                            }}
                                                            className="btn btn-danger mb-2 md:mb-0 md:mr-2"
                                                        >
                                                            Hapus
                                                        </button>
                                                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setDeleteGudangModal(false)}>
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
                        <button type="submit" style={{ background: '#3b3f5c', color: 'white' }} className="btn mb-2 md:mb-0 md:mr-2" onClick={() => handleRefresh()}>
                            Refresh
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row">
                        <div className="mb-1 flex w-full items-start">
                            <input
                                type="text"
                                id="nama_gudang"
                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder={'Nama Gudang'}
                                name="nama_gudang"
                                value={namaGudang}
                                onChange={(e) => HandleSearchNamaGudang(e.target.value, setnamaGudang, setRecordsData, originalDataState)}
                                // style={{ height: '4vh' }}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Grid Layouts */}
            <div className="panel">
                <div className="justify-between gap-5 sm:flex">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
                        <DataTable
                            withBorder={true}
                            withColumnBorders={true}
                            highlightOnHover
                            className={`sticky-table whitespace-nowrap`}
                            records={recordsData}
                            onRowClick={(record, index) => handleRowClick(record, index)}
                            rowStyle={(record, rowIndex) => ({
                                cursor: 'pointer',
                                background: selectedRowIndex === rowIndex ? '#f6f8fa' : 'transparent',
                            })}
                            columns={[
                                {
                                    accessor: 'nama_gudang',
                                    title: 'Nama Gudang',
                                    titleStyle: { textAlign: 'center' },
                                    width: 340,
                                    sortable: true,
                                },
                                {
                                    accessor: 'catatan',
                                    title: 'Keterangan',
                                    titleStyle: { textAlign: 'center' },
                                    width: 400,
                                    sortable: true,
                                },
                                {
                                    accessor: 'personal',
                                    title: 'Penanggung Jawab',
                                    titleStyle: { textAlign: 'center' },
                                    width: 340,
                                    sortable: true,
                                },
                                {
                                    accessor: 'jenis',
                                    title: 'Jenis Gudang',
                                    titleStyle: { textAlign: 'center' },
                                    width: 150,
                                    sortable: true,
                                    render: (record) => (
                                        <div style={{ textAlign: 'center' }}>
                                            {record.jenis === 'E' && <span> Eksternal</span>}
                                            {record.jenis === 'I' && <span> Internal</span>}
                                            {record.jenis === 'P' && <span> Pabrik</span>}
                                            {record.jenis === 'C' && <span> Cabang</span>}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'kpi',
                                    title: 'Stok OD',
                                    titleStyle: { textAlign: 'center' },
                                    width: 120,
                                    sortable: true,
                                    render: ({ kpi }) => (
                                        <div key={kpi} style={{ textAlign: 'center' }}>
                                            <input type="checkbox" className="form-checkbox" checked={kpi === 'Y'} />
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'aktif',
                                    title: 'Non Aktif',
                                    titleStyle: { textAlign: 'center' },
                                    width: 120,
                                    sortable: true,
                                    render: ({ aktif }) => (
                                        <div style={{ textAlign: 'center' }}>
                                            <input type="checkbox" className="form-checkbox" checked={aktif === 'N'} />
                                        </div>
                                    ),
                                },
                            ]}
                            totalRecords={totalRecords}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            height={'62vh'}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListGudang;
