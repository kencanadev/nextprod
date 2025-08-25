export const HandleTglPSB = async (date: any, tipe: string, setFilterData: Function, setCheckboxFilter: Function) => {
    if (tipe === 'tanggal_awal') {
        setFilterData((prevState: any) => ({
            ...prevState,
            tanggal_awal: date,
        }));
        setCheckboxFilter((prevState: any) => ({
            ...prevState,
            tanggal_input: true,
        }));
    } else {
        setFilterData((prevState: any) => ({
            ...prevState,
            tanggal_akhir: date,
        }));
        setCheckboxFilter((prevState: any) => ({
            ...prevState,
            tanggal_input: true,
        }));
    }
};


export const HandleSearchNokaryawan = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarkaryawanKredit: any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        nip: searchValue,
    }));

    const filteredData = searchDataNokaryawan(searchValue, dataDaftarkaryawanKredit);
    
    setStateDataArray(filteredData);

    
};

const searchDataNokaryawan = (keyword: any, dataDaftarkaryawanKredit: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarkaryawanKredit;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarkaryawanKredit.filter((item: any) => item.emp_no.toLowerCase().includes(keyword.toLowerCase()));
        return filteredData;
    }
};

export const HandleSearchNamakaryawan = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarkaryawanKredit: any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        nama_karyawan: searchValue,
    }));

    const filteredData = searchDataNamakaryawan(searchValue, dataDaftarkaryawanKredit);
    
    setStateDataArray(filteredData);

    
};
const searchDataNamakaryawan = (keyword: any, dataDaftarkaryawanKredit: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarkaryawanKredit;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarkaryawanKredit.filter((item: any) => item.Full_Name.toLowerCase().includes(keyword.toLowerCase()));
        return filteredData;
    }
};
