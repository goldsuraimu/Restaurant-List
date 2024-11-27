const loginPanel = document.querySelector('#login-panel')

loginPanel.addEventListener('submit', async function accountSubmit (e) {
  e.preventDefault()

  const username = document.querySelector('#username').value
  const password = document.querySelector('#password').value

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    })

    const data = await response.json()
    if (data.success) {
      alert('登入成功!')
      window.location.href = '/restaurantlist'
    } else {
      alert('登入失敗:' + data.message)
    }
  } catch (err) {
    console.log('錯誤:', err)
    alert('發生錯誤，請稍後再試!')
  }
})
