const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

//서버생성
const app = express();
//프로세서의 주소포트번호 지정
const port = 8080;

//브라우저의 cors이슈를 막기위해서 사용
app.use(cors())
//json형식 데이터를 처리하도록 설정
app.use(express.json())

//mysql연결하기 
const conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"1234",
    port:"3306",
    database:"sample"
})
//선연결
conn.connect();

//get요청
app.get("/member" , (req,res)=>{
    conn.query("select * from member",function(err,result,fields){
        if(err){
            res.send(`불러오기 실패:${err}`)
        }else{
            res.send(result);
        }
    })
})


app.get("/member/:id" , (req,res)=>{
    const {id} = req.params
        conn.query(`select * from member where m_no = ${id}`,function(err,result,fields){
            res.send(result)
        })
})

//서버구동
app.listen(port,()=>{
    console.log("서버가 동작하고있습니다.")
})