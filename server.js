//common js 구문 import ---> require("모듈")
//express

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const multer = require("multer");

//서버 생성
const app = express();

const port = 8080;
//브라우져의 cors이슈를 막기 위해 설정
app.use(cors());

// json형식 데이터를 처리하도록 설정
app.use(express.json());
// upload폴더 클라이언트에서 접근 가능하도록 설정
app.use("/upload",express.static("upload"));
//storage생성
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'upload/event')
    },
    filename:(req,file,cb)=>{
        const newFilename = file.originalname
        cb(null,newFilename)
    }
})
//upload객체 생성하기
const upload = multer({ storage : storage });
//upload경로로 post 요청시 응답 구현하기
app.post("/upload",upload.single("file"),async (req,res)=>{
    res.send({
        imageURL:req.file.filename
    })
})

//mysql 연결 생성
const conn = mysql.createConnection({
    host:"customer-tutorial.cuukeoat8h7o.ap-northeast-1.rds.amazonaws.com",
    user:"admin",
    password:"kimdh991",
    port:"3306",
    database:"hotel"
})
conn.connect();

// conn.query("쿼리문","콜백함수")
app.get('/special',(req,res)=>{
    conn.query("select * from event where e_category = 'special'",(error,result,field)=>{
        res.send(result)
    })
})
//http://localhost:8080/special/1
//req{ params: {no:1}}
app.get("/special/:no",(req,res)=>{
    const {no} =req.params;
    conn.query(`select * from event where e_category='special' and e_no = ${no}`,(err,result,field)=>{
        res.send(result)
    })
})

app.listen(port,()=>{
    console.log("서버가 구동중입니다.")
})