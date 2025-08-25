import { useState } from 'react';
import { myAlertGlobal2, myAlertGlobal3 } from '@/utils/routines';
import { Grid } from '@syncfusion/ej2-react-grids';

let selectedDataChecked: any[] = [];
// let vtBreak: any[] = [];

export const handleTolakData = async (currentGrid: Grid | null) => {
    // Show confirmation dialog
    const confirmResult = await myAlertGlobal3('Apakah data yang di ceklis akan di Tolak / Batal Tolak ?', 'frmPraPp');

    if (confirmResult) {
        if (!currentGrid) return;

        const updatedData = (currentGrid.dataSource as any[]).map((item) => {
            if (item.pilih === 'Y') {
                if (item.tolak === 'N') {
                    // Case 1: If selected and not rejected, mark as rejected
                    return {
                        ...item,
                        tolak: 'Y',
                    };
                } else if (item.tolak === 'Y') {
                    // Case 2: If selected and already rejected, unmark rejection and unselect
                    return {
                        ...item,
                        tolak: 'N',
                        pilih: 'N',
                    };
                }
            }
            return item;
        });

        // Update grid data source
        currentGrid.dataSource = updatedData;
        currentGrid.refresh();
    }
};

export const handleOrderKePraPP = (currentGrid: any, dgPraPp: any) => {
    // Check if any items are selected
    const hasSelectedItems = (currentGrid.dataSource as any[]).some((item: any) => item.pilih === 'Y');

    if (!hasSelectedItems) {
        myAlertGlobal2('Silakan pilih item yang akan ditransfer ke Pra PP', 'frmPraPp');
        return;
    }

    // Get selected items that aren't rejected
    selectedDataChecked = (currentGrid.dataSource as any[]).filter((item: any) => item.pilih === 'Y' && item.tolak === 'N');
    // console.log('selectedDataChecked', selectedDataChecked);
    // Check if any selected items are not rejected
    if (selectedDataChecked.length === 0) {
        myAlertGlobal2('Tidak ada item yang dapat ditransfer ke Pra PP (semua item yang dipilih ditolak)', 'frmPraPp');
        return;
    }

    try {
        const updateDataSumber = (currentGrid.dataSource as any[]).filter((item: any) => item.tolak === 'Y' || item.pilih === 'N');
        currentGrid.dataSource = updateDataSumber;
        currentGrid.refresh();
        const existingPraPpData = dgPraPp.dataSource || [];
        const newPraPpData = Array.isArray(existingPraPpData) ? [...existingPraPpData, ...selectedDataChecked] : selectedDataChecked;

        const itemMap: { [key: string]: any } = {};
        newPraPpData.forEach((item: any) => {
            if (itemMap[item.no_item]) {
                itemMap[item.no_item].berat_order += item.berat_acc; // Assuming berat_acc is a number
            } else {
                itemMap[item.no_item] = { ...item, berat_order: item.berat_acc };
            }
        });

        const updatedPraPpData = Object.values(itemMap);

        dgPraPp.dataSource = updatedPraPpData;
        dgPraPp.refresh();
    } catch (error) {
        console.error('Error transferring data:', error);
        myAlertGlobal2('Terjadi kesalahan saat memindahkan data', 'frmPraPp');
    }
};

export const handleResetData = async (currentGrid: any, dgPraPp: any, jenisRefresh: any) => {
    // console.log('jenisRefresh', jenisRefresh);
    // Get current data from both grids
    const praPpData = (dgPraPp.dataSource as any[]) || [];
    const sourceData = (currentGrid.dataSource as any[]) || [];

    // Check both grids for any checked or rejected items
    const hasCheckedItems = sourceData.some((item) => item.pilih === 'Y') || praPpData.some((item) => item.pilih === 'Y');
    const hasRejectedItems = sourceData.some((item) => item.tolak === 'Y') || praPpData.some((item) => item.tolak === 'Y');

    if (jenisRefresh === 'manual') {
        // console.log('masuk sini 1');
        // If no modifications in either grid, show message and return
        if (!hasCheckedItems && !hasRejectedItems && praPpData.length === 0) {
            myAlertGlobal2('Tidak ada data yang perlu direset', 'frmPraPp');
            return;
        }
        const confirmResult = await myAlertGlobal3('Apakah data akan direset ?', 'frmPraPp');

        if (confirmResult) {
            try {
                // Combine all data from both grids
                const allData = [...sourceData, ...praPpData];

                // Reset all items to original state
                const resetData = allData.map((item) => ({
                    ...item,
                    pilih: 'N',
                    tolak: 'N',
                }));

                // Update source grid with all reset data
                currentGrid.dataSource = resetData;
                currentGrid.refresh();

                // Clear dgPraPp
                dgPraPp.dataSource = [];
                dgPraPp.refresh();

                myAlertGlobal2('Data berhasil direset ke keadaan semula', 'frmPraPp');
            } catch (error) {
                console.error('Error resetting data:', error);
                myAlertGlobal2('Terjadi kesalahan saat mereset data', 'frmPraPp');
            }
        }
    } else if (jenisRefresh === 'auto') {
        // console.log('masuk sini 2');

        try {
            // Combine all data from both grids
            const allData = [...sourceData, ...praPpData];

            // Reset all items to original state
            const resetData = allData.map((item) => ({
                ...item,
                pilih: 'N',
                tolak: 'N',
            }));

            // Update source grid with all reset data
            currentGrid.dataSource = resetData;
            currentGrid.refresh();

            // Clear dgPraPp
            dgPraPp.dataSource = [];
            dgPraPp.refresh();

            // myAlertGlobal2('Data berhasil direset ke keadaan semula', 'frmPraPp');
        } catch (error) {
            console.error('Error resetting data:', error);
            myAlertGlobal2('Terjadi kesalahan saat mereset data', 'frmPraPp');
        }
    }
    // Show confirmation dialog if there are any modifications
};

export const handleHapusData = (currentGrid: any, dgPraPp: any) => {
    // Check if there's data in dgPraPp
    if (!dgPraPp.dataSource || (dgPraPp.dataSource as any[]).length === 0) {
        myAlertGlobal2('Tidak ada data yang dapat dihapus', 'frmPraPp');
        return;
    }

    // Get selected records from dgPraPp using getSelectedRowIndexes
    const selectedIndexes = dgPraPp.getSelectedRowIndexes();

    if (!selectedIndexes || selectedIndexes.length === 0) {
        myAlertGlobal2('Silakan pilih record yang akan dihapus', 'frmPraPp');
        return;
    }

    try {
        // Get current data from dgPraPp
        const currentData = dgPraPp.dataSource as any[];
        // Get selected records using indexes
        const selectedRecords = selectedIndexes.map((index: number) => currentData[index]);

        // Filter out selected records
        const updatedData = currentData.filter((_, index) => !selectedIndexes.includes(index));

        // Update dgPraPp with remaining records
        dgPraPp.dataSource = updatedData;
        dgPraPp.refresh();

        // Get current data from source grid
        const sourceData = currentGrid.dataSource as any[];

        // Add deleted records back to source grid
        // const recordsToReturn = selectedRecords.map((item: any) => ({
        //     ...item,
        //     pilih: 'N',
        // }));

        const recordsToReturn = selectedDataChecked
            .map((item: any) => ({
                ...item,
                pilih: 'N',
            }))
            .filter((record: any) => selectedRecords.some((selected: any) => selected.no_item === record.no_item));

        // console.log('recordsToReturn', recordsToReturn);
        // Combine with source grid data
        const combinedData = [...sourceData, ...recordsToReturn];
        currentGrid.dataSource = combinedData;
        currentGrid.refresh();

        myAlertGlobal2(`${selectedRecords.length} record berhasil dihapus`, 'frmPraPp');
    } catch (error) {
        console.error('Error deleting records:', error);
        myAlertGlobal2('Terjadi kesalahan saat menghapus data', 'frmPraPp');
    }
};

export const checkAlasan = (currentGrid: any): boolean => {
    // console.log('cek ALASAN');
    if (!currentGrid || !currentGrid.dataSource) return false;

    const dataSource = currentGrid.dataSource as any[];
    // console.log('dataSource', dataSource);
    // console.log(
    //     'dataSource.find((item) => item.tolak === Y && (!item.alasan_tolak || item.alasan_tolak.trim() === ))',
    //     dataSource.find((item) => item.pilih === 'Y' && (!item.alasan_tolak || item.alasan_tolak.trim() === ''))
    // );
    // Find any rejected item without a reason
    const rejectedWithoutReason = dataSource.find((item) => item.tolak === 'Y' && (!item.alasan_tolak || item.alasan_tolak.trim() === ''));
    // const rejectedWithoutReason = dataSource.find((item) => item.pilih === 'Y' && (!item.alasan_tolak || item.alasan_tolak.trim() === ''));

    // console.log('rejectedWithoutReason', rejectedWithoutReason);
    if (rejectedWithoutReason) {
        myAlertGlobal2(`${rejectedWithoutReason.no_item}   Alasan penolakan harus diisi..!`, 'frmPraPp');
        return true;
    }

    return false;
};
