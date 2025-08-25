import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '@/components/ReportViewer';

import dynamic from 'next/dynamic';
const Viewer = dynamic<ViewerWrapperProps>(
  async () => {
    return (await import('@/components/grapecity-viewer')).default;
  },
  { ssr: false }
);

const ReportPage = () => {
  const [entitas, setEntitas] = useState('');
  const [tglAwal, setTglAwal] = useState('');
  const [tglAkhir, setTglAkhir] = useState('');
  const [checkboxBarang, setCheckboxBarang] = useState('');
  const [kodeGudang, setKodeGudang] = useState('');
  const [kodeItem, setKodeItem] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlSearchString = window.location.search;
    const params = new URLSearchParams(urlSearchString);
    const entitas = params.get('entitas');
    const param1 = params.get('tgl_awal');
    const param2 = params.get('tgl_akhir');
    const param3 = params.get('checkbox_barang');
    const param4 = params.get('kode_gudang');
    const param5 = params.get('kode_item');
    const token = params.get('token');

    if (entitas !== null) {
      setEntitas(entitas);
    }
    if (param1 !== null) {
      setTglAwal(param1);
    }
    if (param2 !== null) {
      setTglAkhir(param2);
    }
    if (param3 !== null) {
      setCheckboxBarang(param3);
    }
    if (param4 !== null) {
      setKodeGudang(param4);
    }
    if (param5 !== null) {
      setKodeItem(param5);
    }
    if (token !== null) {
      setToken(token);
    }
  }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Kartu Persediaan'));
  }, []);

  const parameter = {
    ReportParams: [
      { Name: 'entitas', Value: [entitas] },
      { Name: 'param1', Value: [tglAwal] },
      { Name: 'param2', Value: [tglAkhir] },
      { Name: 'param3', Value: [checkboxBarang] },
      { Name: 'param4', Value: [kodeGudang] },
      { Name: 'param5', Value: [kodeItem] },
      { Name: 'token', Value: [token] },
    ],
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Viewer reportUri="/report/master/persediaan/kartu_persediaan_barang_dagang.rdlx-json" reportParam={parameter} />
    </div>
  );
};

ReportPage.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
