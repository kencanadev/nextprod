export const HandleSearchPengemudi = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarPengemudi: any) => {
    const searchValue = event;
    // console.log("dataDaftarDataKendaraan",dataDaftarDataKendaraan);

    setStateDataHeader(searchValue);

    const filteredData = searchDataPengemudi(searchValue, dataDaftarPengemudi);

    setStateDataArray(filteredData);
};

const searchDataPengemudi = (keyword: any, dataDaftarPengemudi: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarPengemudi;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarPengemudi.filter((item: any) => item.nama_sales.toLowerCase().startsWith(keyword.toLowerCase()));
        return filteredData;
    }
};
