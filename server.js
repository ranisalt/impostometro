const { createServer } = require('http')
const { request } = require('https')
const { parse: parseURL, URL } = require('url')

const fetchData = state => new Promise((resolve, reject) => {
  const target = new URL('/Contador/Estado', 'https://impostometro.com.br')
  target.searchParams.append('estado', state)

  const req = request(target, {
    headers: {
      'x-requested-with': 'XMLHttpRequest'
    }
  }, res => {
    res.setEncoding('utf-8')

    let data = ''
    res.on('data', d => { data += d })
    res.on('end', () => {
      const {Valor: value, Incremento: increment} = JSON.parse(data)
      if (value === 0.0 && increment === 0.0) {
        reject(new Error('Invalid API call'))
      } else {
        resolve({value, increment})
      }
    })
  })
  req.end()
})

// mimic python http.server log messages
const monthname = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n, width = 2, char = '0') => n.toString().padStart(width, char)
const logdate = date => {
  const d = [pad(date.getUTCDate()), monthname[date.getUTCMonth()], date.getUTCFullYear()]
  const t = [pad(date.getUTCHours()), pad(date.getUTCMinutes()), pad(date.getUTCSeconds())]
  return `${d.join('/')} ${t.join(':')}`
}
const log = (date, remoteAddress, method, url, httpVersion) => (status = '-', size = '-') => {
  console.error(remoteAddress, '-', '-', `[${logdate(date)}]`, `"${method} ${url} HTTP/${httpVersion}"`, status, size)
}

const server = createServer((req, res) => {
  const now = new Date()
  const { httpVersion, method, url, connection: { remoteAddress } } = req
  const logger = log(now, remoteAddress, method, url, httpVersion)

  const { query } = parseURL(req.url, true)
  if (!query.state) {
    logger(400)
    res.writeHead(400)
    return res.end()
  }

  fetchData('sc')
    .then(data => {
      logger(200)
      res.setHeader('access-control-allow-origin', '*')
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(data))
    })
    .catch(() => {
      logger(400)
      res.writeHead(400)
      res.end()
    })
})

const { HOST = '0.0.0.0', PORT = 8080 } = process.env
server.listen(PORT, HOST, () => {
  console.log('Serving HTTP on', HOST, 'port', PORT, `(http://${HOST}:${PORT}/)`, '...')
})
