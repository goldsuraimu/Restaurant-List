const path = require('path')
const express = require('express')
const fs = require('fs')
const { engine } = require('express-handlebars')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const restaurants = require(path.join(__dirname, 'public/jsons/restaurant.json')).results

// express
const app = express()

const port = 3000
const publicRoutes = ['/login', '/register'] // 例外路由
const usersFilePath = path.join(__dirname, 'public/jsons/userdata.json') // 模擬資料庫

// jwt密鑰
const SECRET_KEY = 'this_a_secret_key'
const TOKEN_EXPIRATION = '1h'

app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

// 將public設定為靜態路徑
app.use(express.static(path.join(__dirname, 'public')))
// 解析json格式的請求資料(body)的中介軟體
app.use(express.json())
// 解析url
app.use(express.urlencoded({ extended: true }))
// 解析cookie的中介軟體
app.use(cookieParser())
// 身分驗證中介軟體
app.use(AuthenticateToken)

app.get('/', (_, res) => {
  res.redirect('/restaurantlist')
})

app.get('/login', (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.render('login_panel', { title: 'login | My restaurant List', extraCSS: 'login.css', extraJS: 'login.js' })
  }
  res.redirect('/restaurantlist')
})

app.get('/register', (_, res) => {
  res.render('register', { title: 'register | My restaurant List', extraCSS: 'register.css', extraJS: 'register.js' })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = findUser('username', username)

  if (!username || !password) {
    return res.status(401).json({ success: false, message: '請輸入帳號或密碼!' })
  }

  if (!user) {
    return res.status(401).json({ success: false, message: '帳號或密碼錯誤!' })
  }

  // 密碼驗證
  const isVaiildPassword = await bcrypt.compare(password, user.password)
  if (!isVaiildPassword) {
    return res.status(401).json({ success: false, message: '帳號或密碼錯誤!' })
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION })

  res.cookie('token', token, {
    httpOnly: true, // 防止XSS
    secure: false,
    sameSite: 'strict', // 防止CSRF攻擊
    maxAge: 3600000 // 1h
  })

  res.status(200).json({ success: true, message: '登入成功' })
})

app.post('/logout', (_, res) => {
  res.clearCookie('token') // 清除tokken
  res.status(200).json({ message: '登出成功' })
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  const users = readUser()

  if (!username || !password) {
    return res.status(401).json({ success: false, message: '帳號或密碼未填!' })
  }

  if (users.some(u => u.username === username)) {
    return res.status(400).json({ success: false, message: '此帳號已被註冊!' })
  }
  // 密碼加密
  const hashedPassword = await bcrypt.hash(password, 10)

  users.push({ id: users.length + 1, username, password: hashedPassword })
  writeUser(users)
  res.status(200).json({ success: true, message: '註冊成功' })
})

app.get('/restaurantlist', (req, res) => {
  const keyword = req.query.keyword
  // 若有輸入關鍵字，就傳入經關鍵字篩選過的餐廳名單，若沒有就傳入完整名單
  const matchedResta = keyword
    ? restaurants.filter((resta) => Object.values(resta).some((property) => {
      if (typeof property === 'string') {
        return property.toLowerCase().includes(keyword.toLowerCase())
      }
      return false
    })
    )
    : restaurants
  matchedResta.length === 0 
    ? res.render('no_result', { title: 'My Restaurant List', restaurants: matchedResta, extraCSS: 'no_result.css', keyword, username: req. userDetails.username })
    : res.render('index', { title: 'My Restaurant List', restaurants: matchedResta, keyword, username: req.userDetails.username })
})

app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id
  const restaurant = restaurants.find((restaurant) => restaurant.id === Number(id))
  res.render('detail', { title: `${restaurant.name} | My Restaurant List`, restaurant, username: req.userDetails.username })
})

app.listen(port, () => {
  console.log(`the app is running at http://localhost:${port}`)
})

// function

// 讀取使用者名單資料
function readUser () {
  if (!fs.existsSync(usersFilePath)) return []
  return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
}

// 新增使用者帳號密碼
function writeUser (user) {
  fs.writeFileSync(usersFilePath, JSON.stringify(user, null, 2))
}

// 尋找使用者
function findUser (userKey, userValue) {
  const users = readUser()
  return users.find(u => u[userKey] === userValue)
}

// 驗證token
function AuthenticateToken (req, res, next) {
  // 檢查是否為例外路由
  if (publicRoutes.includes(req.path)) {
    return next()
  }

  const token = req.cookies.token

  if (!token) {
    return res.redirect('/login')
  }
  // 驗證token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: '登入憑證無效!' })
    }
    req.userDetails = findUser('id', user.id)
    next()
  })
}
