let simple = require('./lib/simple')
let util = require('util')
let fs = require('fs')
let chalk = require('chalk')
let { MessageType } = require('@adiwajshing/baileys')

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
module.exports = {
  async handler(chatUpdate) {
    if (global.db.data == null) await global.loadDatabase()
    if (!chatUpdate.hasNewMessage) return
    if (!chatUpdate.messages && !chatUpdate.count) return
    let m = chatUpdate.messages.all()[0]
    try {
      simple.smsg(this, m)
      switch (m.mtype) {
        case MessageType.image:
        case MessageType.video:
        case MessageType.audio:
          if (!m.key.fromMe) await delay(1000)
          if (!m.msg.url) await this.updateMediaMessage(m)
          break
      }
      try {
        let user = global.db.data.users[m.sender]
        if (typeof user !== 'object') global.db.data.users[m.sender] = {}
        if (user) {
          if (!('registered' in user)) user.registered = false
          if (!user.registered) {
            if (!('name' in user)) user.name = this.getName(m.sender)
            if (!('nim' in user)) user.nim = -1
            if (!isNumber(user.regTime)) user.regTime = -1
          }
          if (!isNumber(user.afk)) user.afk = -1
          if (!('afkReason' in user)) user.afkReason = ''
          if (!('banned' in user)) user.banned = false
        } else global.db.data.users[m.sender] = {
          registered: false,
          name: this.getName(m.sender),
          nim: -1,
          regTime: -1,
          afk: -1,
          afkReason: '',
          banned: false,
        }

        let chat = global.db.data.chats[m.chat]
        if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
        if (chat) {
          if (!('isBanned' in chat)) chat.isBanned = false
          if (!('welcome' in chat)) chat.welcome = true
          if (!('goodbye' in chat)) chat.goodbye = true
          if (!('detect' in chat)) chat.detect = false
          if (!('sWelcome' in chat)) chat.sWelcome = ''
          if (!('sBye' in chat)) chat.sBye = ''
          if (!('sPromote' in chat)) chat.sPromote = ''
          if (!('sDemote' in chat)) chat.sDemote = ''
          if (!('delete' in chat)) chat.delete = true
          if (!('desc' in chat)) chat.desc = true
          if (!('restrict' in chat)) chat.restrict = false
        } else global.db.data.chats[m.chat] = {
          isBanned: false,
          welcome: true,
          goodbye: true,
          detect: false,
          sWelcome: '',
          sBye: '',
          sPromote: '',
          sDemote: '',
          delete: true,
          desc: false,
          restrict: false,
        }

        let settings = global.db.data.settings[this.user.jid]
        if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
        if (settings) {
          if (!'anticall' in settings) settings.anticall = false
          if (!'autoonline' in settings) settings.autoonline = false
          if (!'autoread' in settings) settings.autoread = false
          if (!'group' in settings) settings.group = false
          if (!'private' in settings) settings.private = false
          if (!'self' in settings) settings.self = false
        } else global.db.data.settings[this.user.jid] = {
          anticall: false,
          autoonline: false,
          autoread: false,
          group: false,
          private: false,
          self: false,
        }
      } catch (e) {
        console.error(e)
      }
      if (db.data.settings[this.user.jid].private && m.chat.endsWith('g.us')) return
      if (typeof m.text !== 'string') m.text = ''
      for (let name in global.plugins) {
        let plugin = global.plugins[name]
        if (!plugin) continue
        if (plugin.disabled) continue
        if (!plugin.all) continue
        if (typeof plugin.all !== 'function') continue
        try {
          await plugin.all.call(this, m, chatUpdate)
        } catch (e) {
          if (typeof e === 'string') continue
          console.error(e)
        }
      }
      if (m.isBaileys) return

      let usedPrefix
      let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

      let isROwner = [global.conn.user.jid, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
      if (!isROwner && db.data.settings[this.user.jid].self) return
      let isOwner = isROwner || m.fromMe
      let isPrems = isROwner || db.data.users[m.sender].premium
      let groupMetadata = m.isGroup ? this.chats.get(m.chat).metadata || await this.groupMetadata(m.chat) : {} || {}
      let participants = m.isGroup ? groupMetadata.participants : [] || []
      let user = m.isGroup ? participants.find(u => u.jid == m.sender) : {}
      let bot = m.isGroup ? participants.find(u => u.jid == this.user.jid) : {}
      let isAdmin = user.isAdmin || user.isSuperAdmin || false
      let isBotAdmin = bot.isAdmin || bot.isSuperAdmin || false
      let isBlocked = this.blocklist.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != this.user.jid).includes(m.sender)
      if (isBlocked) return
      for (let name in global.plugins) {
        let plugin = global.plugins[name]
        if (!plugin) continue
        if (plugin.disabled) continue
        if (!global.db.data.settings[this.user.jid].restrict) if (plugin.tags && plugin.tags.includes('admin')) continue
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
        let match = (_prefix instanceof RegExp ? // RegExp Mode?
          [[_prefix.exec(m.text), _prefix]] :
          Array.isArray(_prefix) ? // Array?
            _prefix.map(p => {
              let re = p instanceof RegExp ? // RegExp in Array?
                p :
                new RegExp(str2Regex(p))
              return [re.exec(m.text), re]
            }) :
            typeof _prefix === 'string' ? // String?
              [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
              [[[], new RegExp]]
        ).find(p => p[1])
        if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
          match,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          isBlocked,
        })) continue
        if (typeof plugin !== 'function') continue
        if ((usedPrefix = (match[0] || '')[0])) {
          let noPrefix = m.text.replace(usedPrefix, '')
          let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
          args = args || []
          let _args = noPrefix.trim().split` `.slice(1)
          let text = _args.join` `
          command = (command || '').toLowerCase()
          let fail = plugin.fail || global.dfail // When failed
          let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
            plugin.command.test(command) :
            Array.isArray(plugin.command) ? // Array?
              plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
                cmd.test(command) :
                cmd === command
              ) :
              typeof plugin.command === 'string' ? // String?
                plugin.command === command :
                false

          if (!isAccept) continue
          m.plugin = name
          if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
            let chat = global.db.data.chats[m.chat]
            let user = global.db.data.users[m.sender]
            let set = global.db.data.settings[this.user.jid]
            if (!(['owner.js'].includes(name) || isPrems || m.isGroup) && set.group) return
            if (!(['owner.js'].includes(name) || isPrems) && chat && chat.isBanned) return
            if (!(['owner.js'].includes(name) || isPrems) && user && user.banned) return
          }
          if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // keduanya owner
            fail('owner', m, this)
            continue
          }
          if (plugin.rowner && !isROwner) { // owner sebnarnya
            fail('rowner', m, this)
            continue
          }
          if (plugin.owner && !isOwner) { // no owner / yang numpang
            fail('owner', m, this)
            continue
          }
          if (plugin.group && !m.isGroup) { // hanya grup
            fail('group', m, this)
            continue
          } else if (plugin.botAdmin && !isBotAdmin) { // kamu (sebagai bot) admin
            fail('botAdmin', m, this)
            continue
          } else if (plugin.admin && !isAdmin) { // pengguna admin
            fail('admin', m, this)
            continue
          }
          if (plugin.private && m.isGroup) { // chat pribadi
            fail('private', m, this)
            continue
          }
          if (plugin.register == true && _user.registered == false) { // daftar
            fail('unreg', m, this)
            continue
          }

          m.isCommand = true
          let extra = {
            match,
            usedPrefix,
            noPrefix,
            _args,
            args,
            command,
            text,
            conn: this,
            participants,
            groupMetadata,
            user,
            bot,
            isROwner,
            isOwner,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            isBlocked,
          }
          try {
            await plugin.call(this, m, extra)
          } catch (e) {
            // Error occured
            m.error = e
            console.error(e)
            if (e) {
              let text = util.format(e.message ? e.message : e)
              for (let key of Object.values(global.APIKeys))
                text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
              m.reply(text)
            }
          } finally {
            // m.reply(util.format(_user))
            if (typeof plugin.after === 'function') {
              try {
                await plugin.after.call(this, m, extra)
              } catch (e) {
                console.error(e)
              }
            }
          }
          break
        }
      }
    } finally {
      let user, stats = global.db.data.stats
      if (m) {
        let stat
        if (m.plugin) {
          let now = + new Date
          if (m.plugin in stats) {
            stat = stats[m.plugin]
            if (!isNumber(stat.total)) stat.total = 1
            if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
            if (!isNumber(stat.last)) stat.last = now
            if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
          } else stat = stats[m.plugin] = {
            total: 1,
            success: m.error != null ? 0 : 1,
            last: now,
            lastSuccess: m.error != null ? 0 : now
          }
          stat.total += 1
          stat.last = now
          if (m.error == null) {
            stat.success += 1
            stat.lastSuccess = now
          }
        }
      }

      try {
        require('./lib/print')(m, this)
      } catch (e) {
        console.log(m, m.quoted, e)
      }
      if (db.data.settings[this.user.jid].autoread) await this.chatRead(m.chat).catch(_ => _)
      if (db.data.settings[this.user.jid].autoonline) await this.updatePresence(m.chat, 'available').catch(_ => _)
    }
  },
  async participantsUpdate({ jid, participants, action }) {
    let chat = global.db.data.chats[jid] || {}
    let text = ''
    switch (action) {
      case 'add':
        if (chat.welcome) {
          let groupMetadata = await this.groupMetadata(jid)
          for (let user of participants) {
            if (user.includes(this.user.jid)) return
            text = (chat.sWelcome || this.welcome || conn.welcome || 'Selamat datang, @user!').replace('@subject', this.getName(jid)).replace('@desc', groupMetadata.desc ? String.fromCharCode(8206).repeat(4001) + groupMetadata.desc : '').replace(/@user/g, '@' + user.split`@`[0])
            this.sendButtonLoc(jid, fla + 'Welcome', text, wm, 'Selamat Datang', 'welcome')
          }
        }
        break
      case 'remove':
        if (chat.goodbye) {
          for (let user of participants) {
            if (user.includes(this.user.jid)) return
            text = (chat.sBye || this.bye || conn.bye || 'Sampai jumpa, @user!').replace(/@user/g, '@' + user.split`@`[0])
            this.sendButtonLoc(jid, fla + 'Goodbye', text, wm, 'Sampai Jumpa', 'goodbye')
          }
        }
        break
      case 'promote':
        text = (chat.sPromote || this.spromote || conn.spromote || '@user sekarang admin')
      case 'demote':
        if (!text) text = (chat.sDemote || this.sdemote || conn.sdemote || '@user sekarang bukan admin')
        text = text.replace(/@user/g, '@' + participants[0].split('@')[0])
        if (chat.detect) this.reply(jid, text)
        break
    }
  },
  async delete(m) {
    if (m.key.fromMe) return
    let chat = global.db.data.chats[m.key.remoteJid]
    if (chat.delete) return
    await this.sendButton(m.key.remoteJid, `
Terdeteksi @${m.participant.split`@`[0]} menghapus pesan
`.trim(), wm, 'Matikan', '.0 antidelete', m.message)
    this.copyNForward(m.key.remoteJid, m.message).catch(e => console.log(e, m))
  },
  async onCall(json) {
    if (!db.data.settings[this.user.jid].anticall) return
    let jid = json[2][0][1]['from']
    let isOffer = json[2][0][2][0][0] == 'offer'
    let users = db.data.users
    let user = users[jid] || {}
    if (user.whitelist) return
    user.call += 1
    if (jid && isOffer) {
      const tag = this.generateMessageTag()
      const nodePayload = ['action', 'call', ['call', {
        'from': this.user.jid,
        'to': `${jid.split`@`[0]}@s.whatsapp.net`,
        'id': tag
      }, [['reject', {
        'call-id': json[2][0][2][0][1]['call-id'],
        'call-creator': `${jid.split`@`[0]}@s.whatsapp.net`,
        'count': '0'
      }, null]]]]
      this.sendJSON(nodePayload, tag)
      m.reply('Otomatis menolak panggilan')
    }
  },
  async GroupUpdate({ jid, desc, descId, descTime, descOwner, announce }) {
    if (!db.data.chats[jid].desc) return
    if (!desc) return
    let caption = `
@${descOwner.split`@`[0]} baru saja mengganti deskripsi grup.

${desc}
        `.trim()
    this.sendButton(jid, caption, wm, 'Matikan', '.0 desc')
  }
}

global.dfail = (type, m, conn) => {
  let msg = {
    rowner: 'Perintah ini hanya bisa digunakan oleh _*Pemilik Bot*_',
    owner: 'Perintah ini hanya bisa digunakan oleh _*Owner Bot*_',
    group: 'Perintah ini hanya bisa digunakan di grup',
    private: 'Perintah ini hanya bisa digunakan di chat pribadi',
    admin: 'Perintah ini hanya untuk *Admin* grup',
    botAdmin: 'Jadikan bot sebagai admin untuk menggunakan perintah ini',
    unreg: 'Daftar untuk menggunakan perintah ini:\n\nPenggunaan:\n.reg <nama>.<nim>\n\nContoh:\n.reg Arif Febrianto.12191960'
  }[type]
  if (msg) return m.reply(msg)
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Memperbaharui 'handler.js'"))
  delete require.cache[file]
  if (global.reloadHandler) console.log(global.reloadHandler())
})