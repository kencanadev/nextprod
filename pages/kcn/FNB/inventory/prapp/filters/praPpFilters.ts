import moment from 'moment';

export interface FilterState {
    // Pra PP List
    selectAll: boolean;
    searchNamaBarang: string;
    isNoPraPpListChecked: boolean;
    noPraPpList: string;
    isTanggalPraPpListChecked: boolean;
    date1PraPpList: moment.Moment;
    date2PraPpList: moment.Moment;
    isNamaBarangPraPpChecked: boolean;
    namaBarangPraPpList: string;
    selectedOption: string;

    // Pra PP Approved
    isNoPraPpListAppChecked: boolean;
    noPraPpAppList: string;
    isTanggalPraPpListAppChecked: boolean;
    date1PraPpAppList: moment.Moment;
    date2PraPpAppList: moment.Moment;
    isNamaBarangPraPpAppChecked: boolean;
    namaBarangPraPpAppList: string;
    selectedOptionApp: string;

    // Penolakan Pre Order
    isNoTolakChecked: boolean;
    noTolakList: string;
    isTanggalTolakChecked: boolean;
    date1TolakList: moment.Moment;
    date2TolakList: moment.Moment;
    isTanggalPreOrderTolakChecked: boolean;
    date1PreOrderTolakList: moment.Moment;
    date2PreOrderTolakList: moment.Moment;
    isNamaBarangTolakChecked: boolean;
    namaBarangTolakList: string;
}

export const resetFilters = (tabIndex: number, setState: (updates: Partial<FilterState>) => void) => {
    switch (tabIndex) {
        case 1: // Pra PP List
            setState({
                selectAll: false,
                searchNamaBarang: '',
                isNoPraPpListChecked: false,
                noPraPpList: '',
                isTanggalPraPpListChecked: true,
                date1PraPpList: moment(),
                date2PraPpList: moment().endOf('month'),
                isNamaBarangPraPpChecked: false,
                namaBarangPraPpList: '',
                selectedOption: 'N',
            });
            break;

        case 2: // Pra PP Approved
            setState({
                isNoPraPpListAppChecked: false,
                noPraPpAppList: '',
                isTanggalPraPpListAppChecked: true,
                date1PraPpAppList: moment(),
                date2PraPpAppList: moment().endOf('month'),
                isNamaBarangPraPpAppChecked: false,
                namaBarangPraPpAppList: '',
                selectedOptionApp: 'Y',
            });
            break;

        case 3: // Penolakan Pre Order
            setState({
                isNoTolakChecked: false,
                noTolakList: '',
                isTanggalTolakChecked: true,
                date1TolakList: moment(),
                date2TolakList: moment().endOf('month'),
                isTanggalPreOrderTolakChecked: false,
                date1PreOrderTolakList: moment(),
                date2PreOrderTolakList: moment().endOf('month'),
                isNamaBarangTolakChecked: false,
                namaBarangTolakList: '',
            });
            break;
    }
};

export const getFilters = (filterState: FilterState, kode_entitas: string) => ({
    praPpList: {
        entitas: kode_entitas ?? 'KOSONG',
        param1: filterState.isNoPraPpListChecked ? filterState.noPraPpList : 'all',
        param2: filterState.isTanggalPraPpListChecked ? moment(filterState.date1PraPpList).format('YYYY-MM-DD') : 'all',
        param3: filterState.isTanggalPraPpListChecked ? moment(filterState.date2PraPpList).format('YYYY-MM-DD') : 'all',
        param4: filterState.isNamaBarangPraPpChecked ? filterState.namaBarangPraPpList : 'all',
        param5: filterState.selectedOption,
    },
    praPpAppList: {
        entitas: kode_entitas ?? 'KOSONG',
        param1: filterState.isNoPraPpListAppChecked ? filterState.noPraPpAppList : 'all',
        param2: filterState.isTanggalPraPpListAppChecked ? moment(filterState.date1PraPpAppList).format('YYYY-MM-DD') : 'all',
        param3: filterState.isTanggalPraPpListAppChecked ? moment(filterState.date2PraPpAppList).format('YYYY-MM-DD') : 'all',
        param4: filterState.isNamaBarangPraPpAppChecked ? filterState.namaBarangPraPpAppList : 'all',
        param5: filterState.selectedOptionApp,
    },
    praPpTolakList: {
        entitas: kode_entitas ?? 'KOSONG',
        param1: filterState.isNoTolakChecked ? filterState.noTolakList : 'all',
        param2: filterState.isTanggalTolakChecked ? moment(filterState.date1TolakList).format('YYYY-MM-DD') : 'all',
        param3: filterState.isTanggalTolakChecked ? moment(filterState.date2TolakList).format('YYYY-MM-DD') : 'all',
        param4: filterState.isTanggalPreOrderTolakChecked ? moment(filterState.date1PreOrderTolakList).format('YYYY-MM-DD') : 'all',
        param5: filterState.isTanggalPreOrderTolakChecked ? moment(filterState.date2PreOrderTolakList).format('YYYY-MM-DD') : 'all',
        param6: filterState.isNamaBarangTolakChecked ? filterState.namaBarangTolakList : 'all',
    },
});
