// import { db } from '../../lib/db';
export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            const { kode_prapp, id_prapp } = req.query;
            const records = await db.query('SELECT * FROM tb_d_prapp_break WHERE kode_prapp = ? AND id_prapp = ?', [kode_prapp, id_prapp]);
            return res.status(200).json(records);

        case 'POST':
            const { action, data } = req.body; // action can be 'insert' or 'update'
            if (action === 'update') {
                const { kode_prapp, id_prapp, entitas, kode_preorder, id_preorder, berat_acc } = data;
                await db.query('UPDATE tb_d_prapp_break SET berat_acc = berat_acc + ? WHERE kode_prapp = ? AND id_prapp = ? AND entitas = ? AND kode_preorder = ? AND id_preorder = ?', [
                    berat_acc,
                    kode_prapp,
                    id_prapp,
                    entitas,
                    kode_preorder,
                    id_preorder,
                ]);
            } else if (action === 'insert') {
                await db.query(
                    'INSERT INTO tb_d_prapp_break (kode_prapp, id_prapp, entitas, kode_preorder, id_preorder, kode_item, berat_order, berat_sisa, berat_acc, export) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [data.kode_prapp, data.id_prapp, data.entitas, data.kode_preorder, data.id_preorder, data.kode_item, data.berat_order, data.berat_sisa, data.berat_acc, data.export]
                );
            }
            return res.status(200).json({ message: 'Success' });

        case 'DELETE':
            const { kode_prapp: delKodePrapp, id_prapp: delIdPrapp } = req.body;
            await db.query('DELETE FROM tb_d_prapp_break WHERE kode_prapp = ? AND id_prapp = ?', [delKodePrapp, delIdPrapp]);
            return res.status(200).json({ message: 'Deleted successfully' });

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
