import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';
import dynamic from 'next/dynamic';

const Viewer = dynamic<ViewerWrapperProps | any>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewer')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    const [entitas, setEntitas] = useState('');
    const [param1, setParam1] = useState('');
    const [param2, setParam2] = useState('');
    const [param3, setParam3] = useState('');
    const [param4, setParam4] = useState('');
    const [token, setToken] = useState('');
    const [allowPrint, setaAllowPrint] = useState('');


    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const param1 = params.get('param1'); 
        const param2 = params.get('param2'); 
        const param3 = params.get('param3'); 
        const param4 = params.get('param4'); 
        const token = params.get('token');
        const allowPrint = params.get('allowPrint');
        if (allowPrint !== null) {
                    setaAllowPrint(allowPrint);
                }
        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (param1 !== null) {
            setParam1(param1);
        }
        if (param2 !== null) {
            setParam2(param2);
        }
        if (param3 !== null) {
            setParam3(param3);
        }
        if (param4 !== null) {
            setParam4(param4);
        }
        if (token !== null) {
            setToken(token);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Form Jurnal Umum'));
    });

    const parameters = {
        ReportParams: [
            {
                Name: 'entitas',
                Value: [entitas],
            },
            {
                Name: 'param1',
                Value: [param1],
            },
            {
                Name: 'param2',
                Value: [param2],
            },
            {
                Name: 'param3',
                Value: [param3],
            },
            {
                Name: 'param4',
                Value: [param4],
            },
            {
                Name: 'token',
                Value: [token],
            },
        ],
    };
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/transaksi/laporan/laporan_keuangan//laba_rubi_komparasi.rdlx-json" reportParam={parameters} hiddenPrint={allowPrint} />

        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
