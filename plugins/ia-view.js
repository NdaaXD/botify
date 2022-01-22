let handler = async (m, { conn }) => {
    conn.ia = conn.ia ? conn.ia : {}
    let id = m.chat
    if (!(id in conn.ia)) throw 'Tidak ada sesi!'
    let array = conn.ia[id][1]
    let sort = array.sort()
    m.reply(`${sort.map(v => v).join`, `}`)
}
handler.help = ['iaview']
handler.tags = ['tpd']
handler.command = /^(iaview)$/i

module.exports = handler