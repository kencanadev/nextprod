export const MainTabList = [
    {
        key: 'besi',
        title: 'Besi',
    },
    {
        key: 'non-besi',
        title: 'Non Besi',
    },
];

export const jenisOpnameList = [
    {
        id: 1,
        value: 'M',
        text: '(M) Mingguan',
    },
    {
        id: 2,
        value: 'P',
        text: '(P) Putus',
    },
    {
        id: 3,
        value: 'T',
        text: '(T) GV. TTB',
    },
    {
        id: 4,
        value: 'A',
        text: '(A) Keseluruhan',
    },
];

export const statusOpnameList = [
    {
        id: 1,
        value: '0',
        text: 'Baru',
    },
    {
        id: 2,
        value: '9',
        text: 'Koreksi',
    },
    {
        id: 3,
        value: '8',
        text: 'Sudah Koreksi',
    },
    {
        id: 4,
        value: '1',
        text: 'Level 1',
    },
    {
        id: 5,
        value: '2',
        text: 'Level 2',
    },
    {
        id: 6,
        value: '3',
        text: 'Level 3',
    },
    {
        id: 7,
        value: '4',
        text: 'Disetujui',
    },
];

export const jenisTransaksiOpnameList = [
    {
        id: 1,
        value: 'MB',
        text: 'MB',
    },
    {
        id: 2,
        value: 'PS',
        text: 'PS',
    },
    {
        id: 3,
        value: 'ALL',
        text: 'Sesuai',
    },
];

export const tabFilePendukung = [
    {
        key: 'kartu-stok-gudang',
        text: 'Kartu Stok Gudang',
    },
    {
        key: 'foto-barang',
        text: 'Foto Barang',
    },
    {
        key: 'vidio-barang',
        text: 'Vidio Barang',
    },
    {
        key: 'form-ttb',
        text: 'Form GV.TTB',
    },
    // {
    //   key: 'kartu-stok-sistem',
    //   text: 'Kartu Stok Sistem',
    // },
];

export const AlasanPlusList = [
    {
        id: 1,
        text: 'Barang lebih',
    },
    {
        id: 2,
        text: 'Tertukar dengan barang lain',
    },
];

export const AlasanMinusList = [
    {
        id: 1,
        text: 'Barang hilang',
    },
    {
        id: 2,
        text: 'Selisih barang patah',
    },
    {
        id: 3,
        text: 'Tertukar dengan barang lain',
    },
    {
        id: 2,
        text: 'Pemakaian pribadi untuk kebutuhan gudang',
    },
];

// Grid configuration
export const gridOptions = {
    /**
     * page settings menyebabkan refresh terjadi ketika row selected.
     * jadi boleh dikomen untuk mencegah refresh ketika row selected.
     */
    pageSettings: {
        pageSize: 25,
        pageCount: 5,
        pageSizes: ['15', '25', '50', 'All'],
    },
    selectionSettings: {
        mode: 'Row',
        type: 'Single',
    },
    allowPaging: true,
    allowSorting: true,
    allowFiltering: false,
    allowResizing: true,
    allowReordering: false,
    rowHeight: 22,
    height: '100%',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
};
