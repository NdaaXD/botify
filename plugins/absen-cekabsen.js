let handler = async (m, { conn }) => {
    let id = m.chat
    conn.absen = conn.absen ? conn.absen : {}
    if (!(id in conn.absen)) return await conn.sendButton(m.chat, `Tidak ada absen berlangsung!`, wm, 'Mulai', `.+absen`, m)
    let d = new Date
    let date = d.toLocaleDateString('id', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    let absen = conn.absen[id][1]
    let list = absen.map((v, i) => `├ ${i + 1}. ${db.data.users[v].nim} ${db.data.users[v].name}`).join('\n')
    let caption = `
${date}
${conn.absen[id][2]}

┌「 *Absen* 」
├ Total: ${absen.length}
${list}
└────`.trim()
    await conn.send2ButtonLoc(m.chat, fla + 'Absen', caption, wm, 'Hadir', `.absen`, 'Hapus', `.-absen`, m)
}
handler.help = ['cekabsen']
handler.tags = ['absen']
handler.command = /^(cekabsen)$/i

module.exports = handler