/**
 * Created by Administrator on 2017/6/19 0019.
 */
let express = require('express');
let cors = require('cors');
let app = express();
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let mysql = require('mysql');

//设置跨域访问
app.use(cors({
    allowedOrigins: [
        'http://localhost:63342'
    ]
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let url = 'mongodb://localhost:27017/test';

//mysql


//写个接口register
app.post('/register',function(req,res){
    console.log('请求的数据');
    console.log(req.body.name);
    register(req.body,res);
});
//写个接口login
app.get('/login',function (req,res) {
    console.log(req.query)
    let j = {"name":`${req.query.name}`,"psw":`${req.query.password}`}
    login(j,res);
})
//写个接口聊天室
app.post('/chat',function (req,res) {
    chat(req.body,res);
})
//配置服务端口
let server = app.listen(3000, function () {

    let host = server.address().address;

    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
})
