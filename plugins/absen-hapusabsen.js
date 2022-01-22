let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (m.isGroup) {
        if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
    }
    let id = m.chat
    conn.absen = conn.absen ? conn.absen : {}
    if (!(id in conn.absen)) return conn.sendButton(m.chat, `Tidak ada absen berlangsung!`, wm, 'Mulai', `.+absen`, m)
    delete conn.absen[id]
    m.reply(`Berhasil menghapus sesi absen`)
}
handler.help = ['-absen']
handler.tags = ['absen']
handler.command = /^(delete|hapus|-)(attendance|absen)$/i

module.exports = handler