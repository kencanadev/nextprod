import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
export const HandleSearchNoItem = async (event: any, setStateDataHeader: Function, setStateDataArray: any, dataDaftarcustKredit: any, token: any, kode_entitas: any, filterState: any) => {
  const searchValue = event;
  setStateDataHeader(event);

  const filteredData = await searchDataNoItem(searchValue, dataDaftarcustKredit, token, kode_entitas, filterState);

  setStateDataArray.current.dataSource = filteredData;
  setStateDataArray.current.refresh();
};

const searchDataNoItem = async (keyword: any, dataDaftarcustKredit: any, token: any, kode_entitas: any, filterState: any) => {
  // Jika keyword kosong, kembalikan semua data
  if (keyword === '') {
    return dataDaftarcustKredit;
  } else {
    // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
    const response = await axios.get(`${apiUrl}/erp/list_barang_so?`, {
      params: {
        entitas: kode_entitas,
        param1: filterState.kode_cust,
        param3: keyword,
        param2: 'all',
        param4: '25',
      },
    });

    console.log('response so', response.data.data);

    return response.data.data;
  }
};


export const HandleSearchNamaItem = async (event: any, setStateDataHeader: Function, setStateDataArray: any, dataDaftarcustKredit: any, token: any, kode_entitas: any, filterState: any) => {
  const searchValue = event;
  setStateDataHeader(event);

  const filteredData = await searchDataNamaItem(searchValue, dataDaftarcustKredit, token, kode_entitas, filterState);

  setStateDataArray.current.dataSource = filteredData;
  setStateDataArray.current.refresh();
};

const searchDataNamaItem = async (keyword: any, dataDaftarcustKredit: any, token: any, kode_entitas: any, filterState: any) => {
  // Jika keyword kosong, kembalikan semua data
  if (keyword === '') {
    return dataDaftarcustKredit;
  } else {
    // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
    const response = await axios.get(`${apiUrl}/erp/list_barang_so?`, {
      params: {
        entitas: kode_entitas,
        param1: filterState.kode_cust,
        param3: 'all',
        param2: keyword,
        param4: '25',
      },
    });

    console.log('response so', response.data.data);

    return response.data.data;
  }
};