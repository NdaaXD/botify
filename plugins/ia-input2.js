let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.ia = conn.ia ? conn.ia : {}
    let id = m.chat
    if (!id in conn.ia) return conn.reply(m.chat, 'Tidak ada sesi!', m)
    if (!text) throw `Masukkan ${conn.ia[id][0]} angka!\n\nContoh:\n${usedPrefix + command} 5 2 1 4 3`
    let array = text.split(/[ ,]/).filter(v => v != '')
    if (array.length != conn.ia[id][0]) throw `Jumlah angka tidak sesuai input awal!`
    conn.ia[id][1] = array
    conn.sendButton(m.chat, 'Berhasil', wm, 'Cek Hasil', '.iaview', m)
}
handler.help = ['iainput2 <angka>']
handler.tags = ['tpd']
handler.command = /^(iainput2)$/i

module.exports = handler