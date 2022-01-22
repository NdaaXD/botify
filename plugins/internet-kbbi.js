let fetch = require('node-fetch')

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Pengunaan:\n${usedPrefix + command} <teks>\n\nContoh:\n${usedPrefix + command} kata`
    let res = await fetch(API('https://new-kbbi-api.herokuapp.com', '/cari/' + text))
    if (!res.ok) throw eror
    let json = await res.json()
    if (!json.status) throw 'Kata tidak ditemukan!'
    m.reply(`
${json.data[0].lema}

${json.data[0].arti.map(v => `*${v.kelas_kata}*\n${v.deskripsi}`).join`\n\n`}
    `.trim())
}
handler.help = ['kbbi']
handler.tags = ['internet']
handler.command = /^(kbbi)$/i

module.exports = handler