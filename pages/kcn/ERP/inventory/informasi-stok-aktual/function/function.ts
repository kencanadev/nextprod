export const HandleTglInformasiStok = async (date: any, tipe: string, setFilterData: Function) => {
    if (tipe === 'tanggal_awal') {
        setFilterData((prevState: any) => ({
            ...prevState,
            tanggal_awal: date,
        }));
    }
};

export const HandleSearchNoitem = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftaritemKredit: any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        no_item: searchValue,
    }));

    const filteredData = searchDataNoitem(searchValue, dataDaftaritemKredit);

    setStateDataArray(filteredData);
};

const searchDataNoitem = (keyword: any, dataDaftaritemKredit: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftaritemKredit;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftaritemKredit.filter((item: any) => item.no_item.toLowerCase().includes(keyword.toLowerCase()));
        return filteredData;
    }
};

export const HandleSearchNamaitem = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftaritemKredit: any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        nama_item: searchValue,
    }));

    const filteredData = searchDataNamaitem(searchValue, dataDaftaritemKredit);

    setStateDataArray(filteredData);
};

const searchDataNamaitem = (keyword: any, dataDaftaritemKredit: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftaritemKredit;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftaritemKredit.filter((item: any) => item.nama_item.toLowerCase().includes(keyword.toLowerCase()));
        return filteredData;
    }
};
