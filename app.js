const path = require('path');
const express = require('express');
const fs = require('fs'); 
const {engine} = require('express-handlebars');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const restaurants = require(path.join(__dirname, "public/jsons/restaurant.json")).results;

// express
const app = express();

const port = 3000;
const publicRoutes = ['/login', '/register']; //例外路由 
const usersFilePath = path.join(__dirname, "public/jsons/userdata.json"); //模擬資料庫

// jwt密鑰
const SECRET_KEY = 'this_a_secret_key';
const TOKEN_EXPIRATION = '1h';

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

// 將public設定為靜態路徑
app.use(express.static(path.join(__dirname, 'public')));
// 解析json格式的請求資料(body)的中介軟體
app.use(express.json());
//解析url
app.use(express.urlencoded({extended: true}));
// 解析cookie的中介軟體
app.use(cookieParser());
// 身分驗證中介軟體
app.use(AuthenticateToken);

app.get('/', (req, res) => {
  res.redirect('/restaurantlist') 
})


app.get('/login', (req, res) => {
  res.render('login_panel', {title: 'login | My restaurant List', extraCSS: "login.css", extraJS: "login.js"});
})

app.get('/register', (req, res) => {
  res.render('register', {title: 'register | My restaurant List', extraCSS: 'register.css', extraJS: 'register.js' })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUser(); //現有全部使用者名單

  if (!users.find(u => u.username === username)) {
    return res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
  }

  //密碼驗證
  const isVaiildPassword = await bcrypt.compare(password,user.password);
  if(!isVaiildPassword) {
    return res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
  }

  const token = jwt.sign({username: user.username}, SECRET_KEY, {expiresIn: TOKEN_EXPIRATION});
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict', //防止CSRF攻擊
    maxAge: 3600000, //1h
  })

  res.status(200).json({success: true, message: '登入成功'});
})

app.post('/register', (req, res) => {
  const {username, password} = req.body;
  const users = readUser();

  if(users.find(u => u.username === username)) {
    res.status(400),json({})
  }
})

app.get('/restaurantlist', (req, res) => {
  const keyword = req.query.keyword;
  //若有輸入關鍵字，就傳入經關鍵字篩選過的餐廳名單，若沒有就傳入完整名單
  const matchedResta = keyword ? restaurants.filter((resta) => Object.values(resta).some((property) => {
      if (typeof property === 'string') {
        return property.toLowerCase().includes(keyword.toLowerCase());
      }
    })
) : restaurants;  
  res.render('index', {title: 'My Restaurant List',restaurants: matchedResta, keyword});
})

app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id;
  const restaurant = restaurants.find((restaurant) => restaurant.id === Number(id))
  res.render('detail', { title: `${restaurant.name} | My Restaurant List`,restaurant });
})

app.listen(port, (req, res) => {
  console.log(`the app is running at http://localhost:${port}`);
})


// function 

function readUser() {
  if(!fs.existsSync(usersFilePath)) return [];
  return JSON.parse(fs.readFileSync(usersFilePath,'utf-8'));
}

function writeUser(user) {
  fs.writeFileSync(usersFilePath, JSON.stringify(user,null,2));
}

function AuthenticateToken(req, res, next){
  // 檢查是否為例外路由
  if(publicRoutes.includes(req.path)){
    return next();
  }

  // 驗證token
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if(err) {
      return res.status(401).json({message: '登入憑證無效!'});
    }
    req.user = user;
    next();
  })
}