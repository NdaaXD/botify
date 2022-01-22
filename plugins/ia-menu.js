let handler = async (m, { conn, usedPrefix }) => {
    conn.send3Button(m.chat, `
*Menu Pilihan*

1. Input Angka ( ${usedPrefix}iainput )
2. Tampil hasil pengurutan ( ${usedPrefix}iaview )
3. Selesai ( ${usedPrefix}iadone )
    `.trim(), wm,
        '1', '.iainput',
        '2', '.iaview',
        '3', '.iadone', m)
}
handler.help = ['iamenu']
handler.tags = ['tpd']
handler.command = /^(iamenu)$/i

module.exports = handler