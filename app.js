/**
 * Created by Administrator on 2017/6/19 0019.
 */
let express = require('express');
let helmet = require('helmet');
let cors = require('cors');
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let proxy = require('http-proxy-middleware');

let app = express();

const context = /^(?!\/api).*$/;

app.use(helmet());

// //设置跨域访问
// app.use(cors({
//     allowedOrigins: [
//         'http://localhost:3001'
//     ]
// }));
// 地址转发
app.use(context, proxy({ target: 'http://localhost:3001', changeOrigin: true }));


// app.post('/*',function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*")
//     // res.header("Context-Type", "application/json;charset-utf-8")
//     next()
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let url = 'mongodb://localhost:27017/test';

//插入文档
let insertDocument = (db,aa,res,callback) => {
    db.collection('blog').insertOne(aa,(err, result) => {
        assert.equal(err, null);
        console.log('新增文档成功');
        console.log(result.ops);
        callback(result.ops,res);
    })
}
let insertDocumentChat = (db,aa,res,callback) => {
    db.collection('chat').insertOne(aa,(err, result) => {
        assert.equal(err, null);
        console.log('新增文档成功');
        console.log(result.ops);
        callback(result.ops,res);
    })
}
let chat = (a,res) => {
    MongoClient.connect(url, (err,db) => {
        console.log(a)
        assert.equal(null,err);
        insertDocumentChat(db,a,res, (result,res) => {
            selectDataFromChat(db,a,res, (result,res) => {
                res.status(200).json(result).end();
                db.close();
            });
        })
    })
}
//插入操作
let register = (a,res) => {
   MongoClient.connect(url, (err,db) => {
        console.log(a);
        assert.equal(null,err);
       selectData(db,a,res, (result,res) => {
           console.log('插入前的判断');
           console.log(result);
           console.log(a);
           if(result.length !== 0){
               res.status(200).json({message:'用户名已存在',status: 401}).end()
           }else {
               insertDocument(db,a,res, (result,res) => {
                   // res.status(200).json(result).end();
                   res.status(200).json({message:'恭喜你注册成功',status: 200}).end();
                   db.close();
               })
           }
       });
    })
}

let selectData = (db,rt,res, callback) =>{
    //连接到表
    let collection = db.collection('blog');
    //查询数据
    let whereStr = rt;
    collection.find(whereStr).toArray(function(err, result) {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }
        callback(result,res);
    });
}

let selectDataFromChat = (db,a,res, callback) =>{
    //连接到表
    let collection = db.collection('chat');
    //查询数据
    collection.find().sort({_id:-1}).limit(5).toArray((err, result) => {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }
        callback(result,res);
    });
}

let login = (rt,res) => {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("连接成功！");
        selectData(db,rt,res, (result,res) => {
            res.status(200).json({message:'恭喜你登录成功',status: 200}).end();
            db.close();
        });
    });
};

//mysql


//写个接口register
app.post('/api/register',function(req,res){
    console.log('请求的数据');
    console.log(req.body.name);
    register(req.body,res);
});
//写个接口login
app.get('/api/login',function (req,res) {
    console.log(req.query);
    let j = {"name":`${req.query.name}`,"psw":`${req.query.password}`};
    login(j,res);
});
//写个接口聊天室
app.post('/api/chat',function (req,res) {
    chat(req.body,res);
});
//配置服务端口
let server = app.listen(3000, function () {

    let host = server.address().address;

    let port = server.address().port;

    console.log('服务监听端口 http://%s:%s', host, port);
});
