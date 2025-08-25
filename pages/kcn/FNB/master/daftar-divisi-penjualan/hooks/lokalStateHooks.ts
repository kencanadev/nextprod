import { useEffect, useState } from 'react';
import { Divisi } from '../model/api';
import { useSession } from '@/pages/api/sessionContext';

const LokalStateHooks = () => {
    let interval: any;

    const { sessionData, isLoading } = useSession(); // tetap di atas
    const [dataDivisi, setDataDivisi] = useState<Divisi[]>([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');
    const [stateDokumen, setStateDokumen] = useState({
        kode_entitas: '',
        userid: '',
        kode_user: '',
        token: '',
        masterKodeDokumen: '',
        masterDataState: '',
    });

    useEffect(() => {
        // console.log('sessionData luar', sessionData);
        // console.log('isLoadingr', isLoading);

        if (!isLoading && sessionData) {
            // console.log('sessionData dalam', sessionData);
            setStateDokumen((prev) => ({
                ...prev,
                userid: sessionData.userid ?? '',
                kode_entitas: sessionData.kode_entitas ?? '',
                kode_user: sessionData.kode_user ?? '',
                token: sessionData.token ?? '',
            }));
        }
    }, [isLoading, sessionData]);

    return {
        dataDivisi,
        setDataDivisi,
        sessionData,
        stateDokumen,
        setStateDokumen,
        isLoadingProgress,
        setIsLoadingProgress,
        progressValue,
        setProgressValue,
        displayedProgress,
        setDisplayedProgress,
        loadingMessage,
        setLoadingMessage,
    };
};

export default LokalStateHooks;
