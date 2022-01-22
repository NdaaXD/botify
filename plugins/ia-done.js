let handler = async (m, { conn }) => {
    conn.ia = conn.ia ? conn.ia : {}
    let id = m.chat
    if (!(id in conn.ia)) throw 'Tidak ada sesi!'
    delete conn.ia[id]
    m.reply('Berhasil diatur ulang')
}
handler.help = ['iadone']
handler.tags = ['tpd']
handler.command = /^(iadone)$/i

module.exports = handler