let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `Masukkan jumlah angka yang akan diinput!\n\nContoh:\n${usedPrefix + command} 5`
    conn.ia = conn.ia ? conn.ia : {}
    let id = m.chat
    if (id in conn.ia) throw 'Masih ada sesi belum dihapus!'
    conn.ia[id] = [
        args[0],
        []
    ]
    m.reply(`Berhasil, selanjutnya gunakan perintah *${usedPrefix + command}2*`)
}
handler.help = ['iainput <angka>']
handler.tags = ['tpd']
handler.command = /^(iainput)$/i

module.exports = handler