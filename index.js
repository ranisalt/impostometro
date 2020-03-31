(() => {
  const interval = 1000 / 30

  const fetchData = () => {
    const target = new URL('/', 'https://taxmeter.herokuapp.com')
    target.searchParams.append('state', 'sc')
    return window.fetch(target, {mode: 'no-cors'}).then(response => response.json())
  }

  document.addEventListener('DOMContentLoaded', ev => {
    const counter = document.querySelector('.counter')

    fetchData().then(({value, increment}) => {
      const updateCounter = () => {
        const now = new Date()
        const elapsed = now.getUTCMilliseconds() + 1000 * (now.getSeconds() + 60 * (now.getMinutes() + 60 * now.getHours()))

        const total = (value + (elapsed / 1000) * increment).toFixed()
          .replace(/\d(?=(\d{3})+$)/g, '$&.')
        window.requestAnimationFrame(() => { counter.innerText = `R$ ${total}` })
      }

      updateCounter()
      setInterval(updateCounter, interval)
    })
  })
})()
