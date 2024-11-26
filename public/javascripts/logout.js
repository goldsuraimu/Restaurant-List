const logoutBtn = document.querySelector('#logout-btn');

logoutBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    })

    const data = await response.json();
    alert(`${data.message}`)
    window.location.href = '/login';
  } catch(err) {
    console.log('錯誤:', err);
    alert('發生錯誤，請稍後再試!');
  }
})