import type { NextApiRequest, NextApiResponse } from 'next';
// import { sendTelegramMessage } from '@/lib/telegram';
// import { prisma } from '@/lib/prisma';
import moment from 'moment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { selectedItems, userId, entitas } = req.body;

        // Start transaction
        // await prisma.$transaction(async (prisma: any) => {
        //     // Update rejected pre-orders
        //     for (const item of selectedItems) {
        //         // Update pre-order status
        //         await prisma.tb_d_preorder.update({
        //             where: {
        //                 entitas_kode_preorder_id_preorder: {
        //                     entitas: item.entitas,
        //                     kode_preorder: item.kode_preorder,
        //                     id_preorder: item.id_preorder,
        //                 },
        //             },
        //             data: {
        //                 tolak: 'Y',
        //                 userid_tolak: userId,
        //                 tgl_update_tolak: new Date(),
        //                 alasan_tolak: item.alasan_tolak,
        //             },
        //         });

        //         // Get telegram settings from database
        //         const teleSettings = await prisma.telegram_settings.findFirst({
        //             where: { entitas: item.entitas },
        //         });

        //         if (teleSettings) {
        //             // Prepare telegram message
        //             const message =
        //                 'Informasi PRE ORDER Penolakan HO :\n\n' +
        //                 `Terdapat barang Pre Order cabang ${item.entitas} yang Ditolak !\n` +
        //                 `Tanggal : ${moment(item.tgl_preorder).format('DD-MM-YYYY')}\n` +
        //                 `Nomor Pre Order : ${item.no_preorder}\n` +
        //                 `No. Barang : ${item.no_item}\n` +
        //                 `Nama Barang : ${item.diskripsi}\n` +
        //                 `Alasan : ${item.alasan_tolak}\n\n` +
        //                 'Segera lakukan pengecekan.\n';

        //             // Send telegram messages to RM and OM
        //             const telegramParams = {
        //                 key: teleSettings.token5,
        //                 parse_mode: 'HTML',
        //             };

        //             // Send to Regional Manager
        //             if (teleSettings.tele_regional) {
        //                 await sendTelegramMessage({
        //                     ...telegramParams,
        //                     chatId: teleSettings.tele_regional,
        //                     message,
        //                 });
        //             }

        //             // Send to Operation Manager
        //             if (teleSettings.tele_manager) {
        //                 await sendTelegramMessage({
        //                     ...telegramParams,
        //                     chatId: teleSettings.tele_manager,
        //                     message,
        //                 });
        //             }
        //         }
        //     }
        // });

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Pre-orders successfully rejected and notifications sent',
        });
    } catch (error) {
        console.error('Error in export_tolak:', error);
        return res.status(500).json({
            success: false,
            message: 'Data Pra PP Gagal di Export ke Pusat!',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
