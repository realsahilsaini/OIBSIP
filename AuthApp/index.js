const express = require('express');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "yourjwtsecret";

const app = express();

app.use(express.json());

const users = [];

app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/index.html');
})

//Register a user
app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //We need to check if the user already exists
  const exisitngUser = users.find((user)=> user.username === username);

  if(exisitngUser){
    return res.status(409).send('User already exists');
  }else{
    users.push({
      username: username,
      password: password,
    });
  }
  res.status(201).json({message: 'User created successfully'});
});


app.post('/signin', (req,res)=>{
  const username = req.body.username;
  const password = req.body.password;

  const foundUser = users.find((user)=> user.username === username && user.password === password);

  if(!foundUser){
    return res.status(401).send('Invalid username or password');
  }else{
    const token = jwt.sign({username: foundUser.username}, JWT_SECRET);
    res.status(200).json({token: token});
  }

})

app.get('/user', (req,res)=>{
  const token = req.headers.token;

  if(!token){
    return res.status(401).send('Access denied');
  }

  try{
    const decodedUser = jwt.verify(token, JWT_SECRET);

    const userDetails = users.find((user)=> user.username === decodedUser.username);

    res.status(200).json(userDetails);

  }catch(err){
    res.status(400).send('Invalid token');
  }

})
function authMiddleware(req,res,next){  
  const token = req.headers.token;

  if(token){
    return res.status(401).send('Access denied');
  }

  try{
    const jwtVerify = jwt.verify(token, JWT_SECRET);
    
    if(jwtVerify){
      next();
    }

  }catch(error){
    res.status(400).send('Invalid token');
  }
}

app.listen(3000, ()=>{
  console.log('Server listening http://localhost:3000');
})