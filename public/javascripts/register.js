const SERVER_BASE_URL = 'http://localhost:3000';
const registerPanel = document.querySelector('#register-panel');

registerPanel.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;
  
  try {
    const response = await fetch(`${SERVER_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      window.location.href = '/login';
    } else {
      alert('註冊失敗:' + data.message)
    }
  } catch(err) {
    console.log('錯誤:', err);
    alert('發生錯誤，請稍後再試!');
  }

})