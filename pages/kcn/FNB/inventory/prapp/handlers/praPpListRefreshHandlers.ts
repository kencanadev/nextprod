import axios from 'axios';
import { Grid } from '@syncfusion/ej2-react-grids';
import moment from 'moment';

interface RefreshHandlerProps {
    currentGrid: Grid;
    apiUrl: string;
    token: string;
    filters: any;
    setIsLoading: (value: boolean) => void;
    // setProgressValue: (value: number) => void;
    setProgressValue: React.Dispatch<React.SetStateAction<number>>;
}

export const handleRefreshPraPpList = async ({ currentGrid, apiUrl, token, filters, setIsLoading, setProgressValue }: RefreshHandlerProps) => {
    // console.log('handleRefreshPraPpList');
    // console.log('currentGrid', currentGrid);
    // console.log('apiUrl', apiUrl);
    // console.log('filters', filters);

    setIsLoading(true);
    setProgressValue(0);
    let interval: any;

    try {
        interval = setInterval(() => {
            setProgressValue((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 2;
            });
        }, 40);

        const response = await axios.get(`${apiUrl}/erp/list_prapp`, {
            params: filters.praPpList,
            headers: { Authorization: `Bearer ${token}` },
        });

        // console.log('filters.praPpList', filters.praPpList);

        const resultData = response.data.data;

        const initializedData = resultData.map((item: any) => ({
            ...item,
            tgl_prapp: moment(item.tgl_prapp).format('DD-MM-YYYY'),
            // uniqId: `${item.kode_prapp}_${item.entitas}_${item.no_item}`,
            uniqId: `${item.kode_prapp}_${item.no_prapp}_${item.no_item}`,

            pilih: 'N',
        }));

        // console.log('initializedData PraPpList', initializedData);

        setProgressValue(100);

        if (currentGrid) {
            currentGrid.dataSource = initializedData;
            currentGrid.refresh();
        }

        clearInterval(interval);

        setTimeout(() => {
            setIsLoading(false);
            setProgressValue(0);
        }, 1000);
    } catch (error: any) {
        console.error('Error refreshing Pra PP List:', error);
        clearInterval(interval);
        setIsLoading(false);
        setProgressValue(0);
    } finally {
        clearInterval(interval);
    }
};

export const handleRefreshPraPpAppList = async ({ currentGrid, apiUrl, token, filters, setIsLoading, setProgressValue }: RefreshHandlerProps) => {
    // console.log('handleRefreshPraPpAppList');
    setIsLoading(true);
    setProgressValue(0);
    let interval: any;

    try {
        interval = setInterval(() => {
            setProgressValue((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 2;
            });
        }, 40);

        const response = await axios.get(`${apiUrl}/erp/list_prapp_app`, {
            params: filters.praPpAppList,
            headers: { Authorization: `Bearer ${token}` },
        });

        const resultData = response.data.data;
        const initializedData = resultData.map((item: any) => ({
            ...item,
            tgl_prapp: moment(item.tgl_prapp).format('DD-MM-YYYY'),
            tgl_app: moment(item.tgl_app).format('DD-MM-YYYY HH:MM:ss'),
            // uniqId: `${item.kode_prapp}_${item.entitas}_${item.no_item}`,
            uniqId: `${item.kode_prapp}_${item.no_prapp}_${item.no_item}`,

            pilih: 'N',
        }));
        // console.log('refresh', initializedData);
        setProgressValue(100);

        if (currentGrid) {
            currentGrid.dataSource = initializedData;
            currentGrid.refresh();
        }

        clearInterval(interval);

        setTimeout(() => {
            setIsLoading(false);
            setProgressValue(0);
        }, 1000);
    } catch (error: any) {
        console.error('Error refreshing Pra PP App List:', error);
        clearInterval(interval);
        setIsLoading(false);
        setProgressValue(0);
    } finally {
        clearInterval(interval);
    }
};

export const handleRefreshTolakList = async ({ currentGrid, apiUrl, token, filters, setIsLoading, setProgressValue }: RefreshHandlerProps) => {
    // console.log('handleRefreshTolakList');
    setIsLoading(true);
    setProgressValue(0);
    let interval: any;

    try {
        interval = setInterval(() => {
            setProgressValue((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 2;
            });
        }, 40);

        const response = await axios.get(`${apiUrl}/erp/list_preorder_prapp`, {
            params: filters.praPpTolakList,
            headers: { Authorization: `Bearer ${token}` },
        });

        const resultData = response.data.data;

        const initializedData = resultData.map((item: any) => ({
            ...item,
            tgl_update_tolak: moment(item.tgl_update_tolak).format('DD-MM-YYYY'),
            tgl_preorder: moment(item.tgl_preorder).format('DD-MM-YYYY'),
            // uniqId: `${item.kode_prapp}_${item.entitas}_${item.no_item}`,
            // pilih: 'N',
        }));

        // console.log('tolak refresh', initializedData);

        setProgressValue(100);

        if (currentGrid) {
            currentGrid.dataSource = initializedData; //resultData;
            currentGrid.refresh();
        }

        clearInterval(interval);

        setTimeout(() => {
            setIsLoading(false);
            setProgressValue(0);
        }, 1000);
    } catch (error: any) {
        console.error('Error refreshing Tolak List:', error);
        clearInterval(interval);
        setIsLoading(false);
        setProgressValue(0);
    } finally {
        clearInterval(interval);
    }
};
