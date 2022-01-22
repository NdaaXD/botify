let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner, isPrems }) => {
    let isEnable = /on|1/i.test(command)
    let chat = db.data.chats[m.chat]
    let set = db.data.settings[conn.user.jid]
    let type = (args[0] || '').toLowerCase()
    let isAll = false
    let isUser = false
    let grup = [
        'desc',
        'detect',
        'goodbye',
        'welcome',
        'restrict',
    ]
    let ch = [
        'antidelete',
        'delete',
    ]
    let ow = [
        'anticall',
        'autoonline',
        'autoread',
        'gc',
        'pc',
        'public',
    ]
    switch (type) {
        // Grup 
        case 'welcome':
            if (!m.isGroup) {
                if (!isOwner) return dfail('group', m, conn)
            } else if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            chat.welcome = isEnable
            break
        case 'goodbye':
            if (!m.isGroup) {
                if (!isOwner) return dfail('group', m, conn)
            } else if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            chat.goodbye = isEnable
            break
        case 'detect':
            if (!m.isGroup) {
                if (!isOwner) return dfail('group', m, conn)
            } else if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            chat.detect = isEnable
            break
        case 'desc':
            if (!m.isGroup) {
                if (!isOwner) return dfail('group', m, conn)
            } else if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            chat.desc = isEnable
            break
        case 'restrict':
            if (!m.isGroup) {
                if (!isOwner) return dfail('group', m, conn)
            } else if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            if (!isPrems) return dfail('premium', m, conn)
            chat.restrict = isEnable
            break
        case 'delete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            }
            chat.delete = isEnable
            break
        case 'antidelete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            }
            chat.delete = !isEnable
            break
        // Owner
        case 'online':
        case 'autoonline':
            isAll = true
            if (!isOwner) return dfail('owner', m, conn)
            set.autoonline = isEnable
            break
        case 'read':
        case 'autoread':
            isAll = true
            if (!isOwner) return dfail('owner', m, conn)
            set.autoread = isEnable
            break
        case 'public':
            isAll = true
            if (!isROwner) return dfail('rowner', m, conn)
            set.self = !isEnable
            break
        case 'anticall':
            isAll = true
            if (!isOwner) return dfail('owner', m, conn)
            set.anticall = isEnable
            break
        case 'pc':
            isAll = true
            if (!isOwner) return dfail('owner', m, conn)
            set.private = isEnable
            break
        case 'gc':
            isAll = true
            if (!isOwner) return dfail('owner', m, conn)
            set.group = isEnable
            break
        default:
            if (!/[01]/.test(command)) throw `
Penggunaan:
${usedPrefix + command} <opsi>

Contoh:
${usedPrefix}on welcome
${usedPrefix}off welcome

┌「 *Pilihan* 」${isOwner ? '\n' + ow.map(v => '├ ' + v).join`\n` : ''}${m.isGroup ? '\n' + grup.map(v => '├ ' + v).join`\n` : ''}
${ch.map(v => '├ ' + v).join`\n`}
└────
  `.trim()
            throw !1
    }
    m.reply(`
  *${type}* berhasil *di${isEnable ? 'nyalakan' : 'matikan'}* ${isAll ? 'untuk bot ini' : isUser ? '' : 'untuk chat ini'}
  `.trim())
}
handler.help = ['on', 'off'].map(v => v + ' <opsi>')
handler.tags = ['group', 'owner']
handler.command = /^(o(n|ff)|[01])$/i

module.exports = handler