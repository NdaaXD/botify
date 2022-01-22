let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
    let user = db.data.users[m.sender]
    if (user.registered === true) return conn.sendButton(m.chat, 'Kamu sudah terdaftar!', wm, 'Batalkan Pendaftaran', `${usedPrefix}unreg`, m)
    if (!Reg.test(text)) throw `Penggunaan:\n${usedPrefix + command} <nama>.<nim>\n\nContoh:\n${usedPrefix + command} Arif Febrianto.12191960`
    let [_, name, splitter, nim] = text.match(Reg)
    if (!name) throw 'Nama tidak boleh kosong (Alphanumeric)'
    if (!nim) throw 'NIM tidak boleh kosong (Angka)'
    nim = parseInt(nim)
    if (name.length > 30) throw 'Nama terlalu panjang, maksimal 30 karakter'
    user.name = name.trim()
    user.nim = nim
    user.regTime = + new Date
    user.registered = true
    m.reply(`
┌「 *Daftar* 」
├ Nama: ${name}
├ NIM: ${nim} 
└──── 
`.trim())
}
handler.help = ['daftar'].map(v => v + ' <nama>.<nim>')
handler.tags = ['main']
handler.command = /^(daftar|reg(ister)?)$/i

module.exports = handler