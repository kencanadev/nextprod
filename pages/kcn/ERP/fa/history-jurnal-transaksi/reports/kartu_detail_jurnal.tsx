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
  const [dokumen, setDokumen] = useState('');
  const [isSelisih, setIsSelisih] = useState('');
  const [tglAwal, setTglAwal] = useState('');
  const [tglAkhir, setTglAkhir] = useState('');
  const [noDokumenValue, setNoDokumenValue] = useState('');
  const [namaAkunValue, setNamaAkunValue] = useState('');
  const [subledgerValue, setSubledgerValue] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlSearchString = window.location.search;
    const params = new URLSearchParams(urlSearchString);
    const entitas = params.get('entitas');
    const param1 = params.get('dokumen'); // dokumen
    const param2 = params.get('selisih'); // selisih
    const param3 = params.get('tgl_awal'); // start_date
    const param4 = params.get('tgl_akhir'); // end_date
    const param5 = params.get('no_dokumen'); // no dokumen
    const param6 = params.get('akun'); // nama akun
    const param7 = params.get('subledger'); // subledger
    const token = params.get('token');

    if (entitas !== null) {
      setEntitas(entitas);
    }
    if (param1 !== null) {
      setDokumen(param1);
    }
    if (param2 !== null) {
      setIsSelisih(param2);
    }
    if (param3 !== null) {
      setTglAwal(param3);
    }
    if (param4 !== null) {
      setTglAkhir(param4);
    }
    if (param5 !== null) {
      setNoDokumenValue(param5);
    }
    if (param6 !== null) {
      setNamaAkunValue(param6);
    }
    if (param7 !== null) {
      setSubledgerValue(param7);
    }
    if (token !== null) {
      setToken(token);
    }
  }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Kartu Detail Jurnal'));
  }, []);

  const parameter = {
    ReportParams: [
      { Name: 'entitas', Value: [entitas] },
      { Name: 'param1', Value: [dokumen] },
      { Name: 'param2', Value: [isSelisih] },
      { Name: 'param3', Value: [tglAwal] },
      { Name: 'param4', Value: [tglAkhir] },
      { Name: 'param5', Value: [noDokumenValue] },
      { Name: 'param6', Value: [namaAkunValue] },
      { Name: 'param7', Value: [subledgerValue] },
      { Name: 'token', Value: [token] },
    ],
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Viewer reportUri="/report/transaksi/fa/histori-jurnal-transaksi/kartu_histori_jurnal_transaksi.rdlx-json" reportParam={parameter} />
    </div>
  );
};

ReportPage.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
