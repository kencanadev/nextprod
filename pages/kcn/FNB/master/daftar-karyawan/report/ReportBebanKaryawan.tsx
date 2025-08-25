import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';

import dynamic from 'next/dynamic';
const Viewer = dynamic<ViewerWrapperProps>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewer')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    const [entitas, setEntitas] = useState('');
    const [kodeKry, setKodeKry] = useState('');
    const [tahunBeban, setTahunBeban] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const param1 = params.get('kode_kry');
        const param2 = params.get('tahun');
        const token = params.get('token');

        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (param1 !== null) {
            setKodeKry(param1);
        }
        if (param2 !== null) {
            setTahunBeban(param2);
        }
        if (token !== null) {
            setToken(token);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Laporan Buku Subledger'));
    });

    const parameter = {
        ReportParams: [
            {
                Name: 'entitas',
                Value: [entitas],
            },
            {
                Name: 'param1',
                Value: [kodeKry],
            },
            {
                Name: 'param2',
                Value: [tahunBeban],
            },
            {
                Name: 'token',
                Value: [token],
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/master/daftarKaryawan/detailBebanKaryawan.rdlx-json" reportParam={parameter} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
