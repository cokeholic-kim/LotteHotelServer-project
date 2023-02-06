//common js 구문 import ---> require("모듈")
//express

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const multer = require("multer");
const bcrypt = require('bcrypt');
const saltRounds = 10;

//서버 생성
const app = express();

//포트번호
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
//회원가입요청
app.post("/join",async (req,res)=>{
    //입력받은 비밀번호를 mytextpass로 저장
    const mytextpass = req.body.m_pass;
    let myPass = ""
    const {m_name,m_pass,m_phone,m_nickname,m_add1,m_add2,m_email} = req.body;

    // 빈문자열이 아니고 undefined가 아닐때
    if(mytextpass != '' && mytextpass != undefined){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            //hash메소드 호출되면 인자로 넣어준 비밀번호를 암호화 하여 콜백함수 안 hash로 돌려준다
            bcrypt.hash(mytextpass, salt, function(err, hash) {// hash는 암호화시켜서 리턴되는값.
                // Store hash in your password DB.
                myPass = hash;
                conn.query(`insert into member(m_name,m_pass,m_phone,m_nickname,m_address1,m_address2,m_email) 
                values( '${m_name}' , '${myPass}' , '${m_phone}' , '${m_nickname}' , '${m_add1}' , '${m_add2}' , '${m_email}' )`
                ,(err,result,fields)=>{
                    console.log(result);
                    res.send("등록되었습니다.")
                })
            
            });
        });
    }
    console.log(req.body)
})

//로그인 요청
app.post("/login",async (req,res)=>{
    // 1) useremail 값에 일치하는 데이터가 있는지 확인
    // 2) userpass 암호화해서 쿼리 결과의 패스워드랑 일치하는지 체크
    const {useremail , userpass } = req.body;
    console.log(req.body)
    conn.query(`select * from member where m_email = '${useremail}'`,(error,result,field)=>{
        //결과가 undefined가 아니고 결과의 0번째가 undefined가 아닐때
        //결과가 있을때.
        if(result != undefined && result[0] != undefined){
            bcrypt.compare(userpass,result[0].m_pass,function(err,res2){
                //result == true / false
                if(res2){
                    console.log("로그인 성공")
                    res.send(result)
                }else{
                    console.log("로그인 실패")
                    res.send("실패")
                }
            })
        }else{
            console.log("데이터가 없습니다")
        }
    })
})

app.listen(port,()=>{
    console.log("서버가 구동중입니다.")
})