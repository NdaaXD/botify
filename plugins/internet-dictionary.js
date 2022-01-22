let fetch = require('node-fetch')
let gtts = require('node-gtts')
let fs = require('fs')
let path = require('path')

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Pengunaan:\n${usedPrefix + command} <teks>\n\nContoh:\n${usedPrefix + command} word`
    let res = await fetch(API('https://api.dictionaryapi.dev', '/api/v2/entries/en/' + text))
    if (!res.ok) throw eror
    let json = await res.json()
    m.reply(`
*Kata:* ${json[0].word}
*Fonetis:* ${json[0].phonetic}
*Asal:* ${json[0].origin}

${json[0].meanings.map(v => `
*Bagian dari:* ${v.partOfSpeech}
${v.definitions.map(u => `
*Definisi:* ${u.definition}
*Contoh:* ${u.example}
*Sinonim:* ${u.synonyms}
*Antonim:* ${u.antonyms}
`).join`\n`}
`.trim()).join`\n\n`}
    `.trim())
    let audio = await tts(text)
    conn.sendFile(m.chat, audio, 'tts.opus', '', m, 1)
}
handler.help = ['dictionary']
handler.tags = ['internet']
handler.command = /^(dictionary|kamus)$/i

module.exports = handler

function tts(text, lang = 'en') {
    return new Promise((resolve, reject) => {
        try {
            let tts = gtts(lang)
            let filePath = path.join(__dirname, '../tmp', (1 * new Date) + '.wav')
            tts.save(filePath, text, () => {
                resolve(fs.readFileSync(filePath))
                fs.unlinkSync(filePath)
            })
        } catch (e) { reject(e) }
    })
}