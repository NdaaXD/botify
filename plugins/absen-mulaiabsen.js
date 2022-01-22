let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (m.isGroup) {
        if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
    }
    conn.absen = conn.absen ? conn.absen : {}
    let id = m.chat
    if (id in conn.absen) return conn.send2Button(m.chat, `masih ada sesi absen berlangsung!`, wm, 'Hapus', `.hapusabsen`, 'Cek', '.cekabsen', m)
    conn.absen[id] = [
        await conn.sendButton(m.chat, `Absen dimulai`, wm, 'Hadir', `.absen`, m),
        [],
        text
    ]
}
handler.help = ['+absen [teks]']
handler.tags = ['absen']
handler.command = /^(start|mulai|\+)(attendance|absen)$/i

module.exports = handler