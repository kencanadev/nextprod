import moment from 'moment';

export const handleInputChange = (setFilterState: any, setCheckboxState: any, e: any) => {
    const { name, value } = e.target;

    // Update filterState
    setFilterState((prev: any) => ({
        ...prev,
        [name]: value,
    }));

    // Update checkboxState
    setCheckboxState((prev: any) => ({
        ...prev,
        [name]: value.trim() !== '',
    }));
};

export const HandleSearchNoDataBok = (event: any, setStateDataHeader: Function, setStateDataArray: any, dataDaftarDataBok: any, status : any) => {
    const searchValue = event;
    // console.log("dataDaftarDataBok",dataDaftarDataBok);

    setStateDataHeader((prevState: any) => ({
        ...prevState,
        no_bok: searchValue,
    }));

    const filteredData = searchDataNoDataBok(searchValue, dataDaftarDataBok, status);

    // setStateDataArray(filteredData);
    setStateDataArray.setProperties({ dataSource: filteredData });
            setStateDataArray!.refresh();
};

const searchDataNoDataBok = (keyword: any, dataDaftarDataBok: any,status : any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '' && status === 'Semua') {
        console.log('masuk ke sini bre',status);
        return dataDaftarDataBok;
    } else if (keyword === '' && status !== 'Semua') {
        
        const filteredData = dataDaftarDataBok.filter((item: any) => item.st === status);
            return filteredData;
    } 
    else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        if(status === 'Semua') {

            const filteredData = dataDaftarDataBok.filter((item: any) => item.no_fk.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        } else {

            const filteredData = dataDaftarDataBok.filter((item: any) => item.st === status && item.no_fk.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    }
};

export const HandleSearchKeteranganDataBok = (event: any, setStateDataHeader: Function, setStateDataArray: any, dataDaftarDataBok: any, status : any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        keterangan_filter: searchValue,
    }));

    const filteredData = searchDataKeteranganDataBok(searchValue, dataDaftarDataBok,status);

    // setStateDataArray(filteredData);
    setStateDataArray.setProperties({ dataSource: filteredData });
            setStateDataArray!.refresh();
};

const searchDataKeteranganDataBok = (keyword: any, dataDaftarDataBok: any, status : any) => {
    // // Jika keyword kosong, kembalikan semua data
    // if (keyword === '') {
    //     return dataDaftarDataBok;
    // } else {
    //     // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
    //     const filteredData = dataDaftarDataBok.filter((item: any) => item.keterangan?.toLowerCase().startsWith(keyword.toLowerCase()));
    //     return filteredData;
    // }

    if (keyword === '' && status === 'Semua') {
        console.log('masuk ke sini bre',status);
        return dataDaftarDataBok;
    } else if (keyword === '' && status !== 'Semua') {
        
        const filteredData = dataDaftarDataBok.filter((item: any) => item.st === status);
            return filteredData;
    } 
    else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        if(status === 'Semua') {

            const filteredData = dataDaftarDataBok.filter((item: any) => item.keterangan?.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        } else {

            const filteredData = dataDaftarDataBok.filter((item: any) => item.st === status && item.keterangan?.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    }
};

export const HandleTgl = async (date: any, tipe: string, setDate1: Function, setDate2: Function, setIsTanggalChecked: Function) => {
    if (tipe === 'tanggalAwal') {
        setDate1(date);
        setIsTanggalChecked(true);
    } else {
        setDate2(date);
        setIsTanggalChecked(true);
    }
};

export const HandleSearchNoKendaraan = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarDataKendaraan: any) => {
    const searchValue = event;
    // console.log("dataDaftarDataKendaraan",dataDaftarDataKendaraan);

    setStateDataHeader(searchValue);

    const filteredData = searchDataNoKendaraan(searchValue, dataDaftarDataKendaraan);

    setStateDataArray(filteredData);
};

const searchDataNoKendaraan = (keyword: any, dataDaftarDataKendaraan: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarDataKendaraan;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarDataKendaraan.filter((item: any) => item.nopol.toLowerCase().startsWith(keyword.toLowerCase()));
        return filteredData;
    }
};

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
        const filteredData = dataDaftarPengemudi.filter((item: any) => item.pengemudi.toLowerCase().startsWith(keyword.toLowerCase()));
        return filteredData;
    }
};

export const HandleSearchJenisServis = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarJenisServis: any) => {
    const searchValue = event;
    // console.log("dataDaftarDataKendaraan",dataDaftarDataKendaraan);

    setStateDataHeader(searchValue);

    const filteredData = searchDataJenisServis(searchValue, dataDaftarJenisServis);

    setStateDataArray(filteredData);
};

const searchDataJenisServis = (keyword: any, dataDaftarJenisServis: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarJenisServis;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarJenisServis.filter((item: any) => item.jenis_servis.toLowerCase().startsWith(keyword.toLowerCase()));
        return filteredData;
    }
};
