let handler = async (m, { conn }) => {
    let id = m.chat
    conn.absen = conn.absen ? conn.absen : {}
    if (!(id in conn.absen)) return await conn.sendButton(m.chat, `Tidak ada absen berlangsung!`, wm, 'Mulai', `.+absen`, m)
    let absen = conn.absen[id][1]
    const wasVote = absen.includes(m.sender)
    if (wasVote) throw 'Kamu sudah absen!'
    absen.push(m.sender)
    let d = new Date
    let date = d.toLocaleDateString('id', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    let list = absen.map((v, i) => `├ ${i + 1}. ${db.data.users[v].nim} ${db.data.users[v].name}`).join('\n')
    let caption = `
${date}
${conn.absen[id][2]}

┌「 *Absen* 」
├ Total: ${absen.length}
${list}
└────`.trim()
    await conn.send2Button(m.chat, caption, wm, 'Hadir', `.absen`, 'Cek', `.cekabsen`, m)
}
handler.help = ['hadir']
handler.tags = ['absen']
handler.command = /^(absen|hadir)$/i

handler.register = true

module.exports = handler