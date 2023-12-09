import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import Cryptr from "cryptr";
const cryptr = new Cryptr('myTotallySecretKey');

const app=express();
const port=3000;

const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"library-management-system",
    password:"M200429h",
    port:5432,

});

db.connect();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const d = new Date();
let year=d.getFullYear()
let month = d.getMonth()+1;
let date=d.getDate();
let TodayDate=date+"-"+month+"-"+year;


const AdminCode=200429;
let staffLogedIn,bookId,authorLoggedIn,readerLoggedIn;

async function no_of_readers(){
    const nuOfReaders=await db.query("select count(*) from reader");
    return nuOfReaders.rows[0].count;
}
async function no_of_books(){
    const nuOfBooks=await db.query("select count(*) from book");
    return nuOfBooks.rows[0].count;
}
async function no_of_authors(){
    const nuOfAuthors=await db.query("select count(*) from author");
    return nuOfAuthors.rows[0].count;
}
async function no_of_reports(){
    const nuOfReports=await db.query("select count(*) from report");
    return nuOfReports.rows[0].count;
}
async function no_of_requests(){
    const nuOfRequests=await db.query("select count(*) from booksToBeIssued");
    return nuOfRequests.rows[0].count;
}

async function loadingStaffMainPage(res){
    const countReader=await no_of_readers();
    const countBook=await no_of_books();
    const countAuthor=await no_of_authors();
    const countReport=await no_of_reports();
    const countRequest=await no_of_requests();
    res.render('staff-main-page.ejs',{
        readerCount:countReader,
        bookCount:countBook,
        authorCount:countAuthor,
        reportCount:countReport,
        requestCount:countRequest
    });
}
async function loadingAuthorMainPage(res){
    const authData= await db.query("select * from book b,author a where b.auth_id=a.auth_id and email=$1",
    [authorLoggedIn]);
    res.render('authorMain.ejs',{
        authData:authData.rows
    })
}

async function loadingAuthorMainPageTriggerInfo(res,dataTrigger){
    const authData= await db.query("select * from book b,author a where b.auth_id=a.auth_id and email=$1",
    [authorLoggedIn]);
    res.render('authorMain.ejs',{
        authData:authData.rows,
        triggerMsg:dataTrigger
    })
}

async function viewStaffProfile(res){
    const staffProfile=await db.query("select * from staff where email=$1",
    [staffLogedIn]);
    res.render('staffProfile.ejs',{
        staffName:staffProfile.rows[0].name,
        staffId:staffProfile.rows[0].id,
        staffEmail:staffProfile.rows[0].email,
        staffpwd:cryptr.decrypt(staffProfile.rows[0].password)
    });
}

async function viewAuthorProfile(res){
    const authorProfile=await db.query("select * from author where email=$1",
    [authorLoggedIn]);
    console.log(authorProfile)
    res.render('authorProfile.ejs',{
        authorName:authorProfile.rows[0].auth_name,
        authorId:authorProfile.rows[0].auth_id,
        authorEmail:authorProfile.rows[0].email,
        authorPhone:authorProfile.rows[0].phone,
        authorpwd:cryptr.decrypt(authorProfile.rows[0].password)
    });
}

async function viewReaderProfile(res){
    const readerProfile=await db.query("select * from reader where email=$1",
    [readerLoggedIn]);
    res.render('readerProfile.ejs',{
        readerName:readerProfile.rows[0].name,
        readerId:readerProfile.rows[0].user_id,
        readerEmail:readerProfile.rows[0].email,
        readerPhone:readerProfile.rows[0].phone,
        readerAdd:readerProfile.rows[0].address,
        readerpwd:cryptr.decrypt(readerProfile.rows[0].password)
    });
}


async function displayUserInfo(res){
    const readerData =await db.query("select * from reader"); 
    res.render('user-info.ejs',{
        userData:readerData.rows
    });
}
async function displayBookInfo(res){
    const bookData=await db.query("select * from book order by book_id  asc");
    res.render('bookInfo.ejs',{
        bookData:bookData.rows
    })
}

async function displayBookTriggerInfo(res,dataTrigger){
    const bookData=await db.query("select * from book order by book_id  asc");
    res.render('bookInfo.ejs',{
        bookData:bookData.rows,
        triggerMsg:dataTrigger
    })
}



async function displayAuthorInfo(res){
    const authorData=await db.query("select * from author order by auth_id  asc");
    res.render('authorInfo.ejs',{
        authData:authorData.rows
    })
}

async function displayReportInfo(res){
    const reportData=await db.query("select * from report order by reg_no asc");
    res.render('reportInfo.ejs',{
        repData:reportData.rows
    })
}

async function loadingUserMainPage(res){
    const bookData=await db.query("select * from book order by book_id  asc");
    const issuedBookData=await db.query("select * from issuedBooks ");
    res.render('readerMainPage.ejs',{
        userBookData:bookData.rows,
        issuedBooksData:issuedBookData.rows
    })
}

async function loadBooksToBeIssuedPage(res){
    const data=await db.query("select * from booksToBeIssued")
    res.render('issuedBooksPage.ejs',{
        issuedBooksData:data.rows
    })
}



// Staff

app.get('/',async(req,res)=>{
    res.render('staff-login.ejs')
})

app.get('/staff-register',(req,res)=>{
    res.render('staff-register.ejs')
});

app.post('/staffRegister',async(req,res)=>{
    const userName=req.body.userName;
    const userEmail=req.body.userEmail;
    const pwd=req.body.password;
    const adminCode=req.body.adminCode;
    if(adminCode==AdminCode){
     const encryptedPassword = cryptr.encrypt(pwd);
     try{
     await db.query(`insert into staff (name,email,password) values($1,$2,$3)`,
     [userName,userEmail,encryptedPassword]);
     res.redirect('/');
     }catch(err){
      console.log(err);
     }
    }else{
     res.render('staff-register.ejs',{
         adminCodeErr:"Incorrect admin code"
     });
    }
    
 });
 
 app.post('/staffLogin',async(req,res)=>{
     const loginEmail=req.body.userEmail;
     const loginpwd=req.body.password;
     try{
         const data=await db.query("select * from staff where email=$1",
         [loginEmail]);
         staffLogedIn=loginEmail;
         if(data.rows!=""){
             const decryptedPassword = cryptr.decrypt(data.rows[0].password);
              if(decryptedPassword==loginpwd){
                 await loadingStaffMainPage(res);
              }else{
                 res.render('staff-login.ejs',{
                     pwdError:"Incorrect password"
                 });
              }
 
         }else{
             res.render('staff-login.ejs',{
                 mailError:"Username is not registered"
             });
         }
     }
     catch(err){
         console.log(err);
     }
 
 });
 
 app.post('/returnToStaffMain',async(req,res)=>{
     await loadingStaffMainPage(res);
 })

 app.post('/staffViewProfile',async(req,res)=>{
    try{
    await viewStaffProfile(res);    
    }catch(err){
        console.log(err)
    }
    
});

app.post('/staffEditProfile',(req,res)=>{
    res.render('staff-edit-profile.ejs');
})

app.post('/editProfileStaff',async(req,res)=>{
    const upStaffId=req.body.staffEditId;
    const upStaffName=req.body.staffEditName;
    const upStaffEmail=req.body.staffEditEmail;
    if(upStaffId!="" && upStaffName=="" && upStaffEmail==""){
        await db.query("update staff set id=$1 where email=$2",
        [upStaffId,staffLogedIn]);
    }else if(upStaffId=="" && upStaffName!="" && upStaffEmail==""){
        await db.query("update staff set name=$1 where email=$2",
       [upStaffName,staffLogedIn]);
    }else if(upStaffId=="" && upStaffName=="" && upStaffEmail!=""){
        await db.query("update staff set email=$1 where email=$2",
        [upStaffEmail,staffLogedIn]);
        staffLogedIn=upStaffEmail;
    }else if(upStaffId!="" && upStaffName!="" && upStaffEmail!=""){
        await db.query("update staff set id=$1,name=$2,email=$3 where email=$4",
        [upStaffId,upStaffName,upStaffEmail,staffLogedIn]);
        staffLogedIn=upStaffEmail;
    }
    await viewStaffProfile(res);

});

app.post('/changeStaffPwd',async(req,res)=>{
    res.render('change-staff-pwd.ejs');
})

app.post('/edit-pwd-staff',async(req,res)=>{
   const changedPwd=req.body.upPwd;
   const confirmedPwd=req.body.confirmUpPwd;
    if(changedPwd==confirmedPwd){
        const encryptedPassword = cryptr.encrypt(confirmedPwd);
        await db.query("update staff set password=$1 where email=$2",
        [encryptedPassword,staffLogedIn]);
        await viewStaffProfile(res);
    }else{
        res.render('change-staff-pwd.ejs',{
            error:"Password doesn't match"
        });
    }
});

app.post('/deleteStaffAcnt',(req,res)=>{
    res.render('delete-staff-acnt.ejs');
});

app.post('/delete-Account',async(req,res)=>{
      const checkPwd=req.body.checkPwd;
      const pwd=await db.query("select password from staff where email=$1",
      [staffLogedIn]);
      if(checkPwd==cryptr.decrypt(pwd.rows[0].password)){
        await db.query("delete from staff where email=$1",
        [staffLogedIn]);
        res.redirect('/');
      }else{
        res.render('delete-staff-acnt.ejs',{
            error:"Incorrect Password"
        });
      }
});


// Reader

app.get('/userLogin',async(req,res)=>{
    res.render('userLogin.ejs')

})

app.get('/user-register',async(req,res)=>{
    await db.query("delete from logs")
    res.render('userRegister.ejs')
})

app.post('/returnToReaderMain',async(req,res)=>{
    await loadingUserMainPage(res)
})

app.post('/readerViewProfile',async(req,res)=>{
    try{
    await viewReaderProfile(res);    
    }catch(err){
        console.log(err)
    }
    
});

app.post('/readerEditProfile',(req,res)=>{
    res.render('reader-edit-profile.ejs');
})

app.post('/userInfo',async(req,res)=>{
    await displayUserInfo(res);
});

app.post('/deleteUser',async(req,res)=>{
    const idToDeleteUser=req.body.deleteReader;
    db.query("delete from reader where user_id=$1",
    [idToDeleteUser]);
    await displayUserInfo(res);
})

app.post('/searchReader',async(req,res)=>{
    const user_id=req.body.readerId;
    const user_name=req.body.readerName;
    const user_Address=req.body.readerAddress;
     try{
    if(user_id!="" && user_name=="" && user_Address==""){
       const dataUsingUserId= await db.query("select * from reader where user_id=$1",
       [user_id]);
       res.render('user-info.ejs',{
        userData:dataUsingUserId.rows
       })
    }else if(user_id=="" && user_name!="" && user_Address==""){
       const dataUsingUserName= await db.query("select * from reader where name=$1",
       [user_name]);
       res.render('user-info.ejs',{
        userData:dataUsingUserName.rows
       })
    }else if(user_id=="" && user_name=="" && user_Address!=""){
       const dataUsingUserAddress= await db.query("select * from reader where address=$1",
       [user_Address]);
       res.render('user-info.ejs',{
        userData:dataUsingUserAddress.rows
       })
    }else if(user_id!="" && user_name!="" && user_Address!=""){
        const dataUser= await db.query("select * from reader where user_id=$1 and name=$2 and address=$3",
        [user_id,user_name,user_Address]);
        res.render('user-info.ejs',{
            userData:dataUser.rows
        })
    }
}catch(err){
    console.log(err);
    res.render('user-info.ejs',{
        userData:""
    });
}    
})


app.post('/userRegister',async(req,res)=>{
    const userName=req.body.userName;
    const userEmail=req.body.userEmail;
    const userPhone=req.body.userPhone;
    const userAddress=req.body.userAddress;
    const createPwd=req.body.createPassword;
    const confirmpwd=req.body.confirmPassword;
    if(createPwd==confirmpwd){
     const encryptedPassword = cryptr.encrypt(createPwd);
     try{
     await db.query(`insert into reader (name,email,phone,address,password) values($1,$2,$3,$4,$5)`,
     [userName,userEmail,userPhone,userAddress,encryptedPassword]);
     res.redirect('/userLogin');
     }catch(err){
      console.log(err);
     }
    }else{
     res.render('userRegister.ejs',{
         passwordErr:"Password doesn't match"
     });
    }
 });
 
 app.post("/ReaderLogin",async(req,res)=>{
    const loginEmail=req.body.userEmail;
    const loginpwd=req.body.password;
    try{
        const data=await db.query("select * from reader where email=$1",
        [loginEmail]);
        readerLoggedIn=loginEmail;
        if(data.rows!=""){
            const decryptedPassword = cryptr.decrypt(data.rows[0].password);
             if(decryptedPassword==loginpwd){
               await loadingUserMainPage(res)
             }else{
                res.render('userLogin.ejs',{
                    pwdError:"Incorrect password"
                });
             }

        }else{
            res.render('userLogin.ejs',{
                mailError:"Username is not registered"
            });
        }
    }
    catch(err){
        console.log(err);
    }
})
app.post('/requestBook',async(req,res)=>{
     const requestedBookId=req.body.requestBook;
     try{
     const data=await db.query("select title from book where book_id=$1",
     [requestedBookId]);
     const userData=await db.query("select * from reader where email=$1",
     [readerLoggedIn]);
     await db.query("insert into booksToBeIssued (book_id,user_id,book_title,reader_name) values ($1,$2,$3,$4)",
     [requestedBookId,userData.rows[0].user_id,data.rows[0].title,userData.rows[0].name])
     await loadingUserMainPage(res)
     }catch(err){
        console.log(err)
     }


})

app.post('/returnBook',async(req,res)=>{
    const bookId=req.body.returntBook;
    try{
    await db.query("delete from issuedBooks where book_id=$1",
    [bookId]);
    await loadingUserMainPage(res);
    }catch(err){
        console.log(err);
    }
})

// app.post('/editProfileReader',async(req,res)=>{
//     const upReaderName=req.body.readerEditName;
//     const upReaderEmail=req.body.readerEditEmail;
//       const upReaderPhone=req.body.readerEditPhone;
//       const upReaderAdd=req.body.readerEditAdd;
//     if(upReaderName!="" && upReaderEmail=="" && upReaderPhone=="" && upReaderAdd=="" ){
//         await db.query("update reader set name=$1  where email=$2",
//         [upReaderName,readerLogedIn]);
//     }else if(upReaderName=="" && upReaderEmail!="" && upReaderPhone=="" && upReaderAdd=="" ){
//         await db.query("update staff set email=$1 where email=$2",
//        [upReaderEmail,readerLogedIn]);
//            readerLogedIn=upReaderEmail;
//     }else if(upStaffId=="" && upStaffName=="" && upStaffEmail!=""){
//         await db.query("update staff set email=$1 where email=$2",
//         [upStaffEmail,staffLogedIn]);
//         staffLogedIn=upStaffEmail;
//     }else if(upStaffId!="" && upStaffName!="" && upStaffEmail!=""){
//         await db.query("update staff set id=$1,name=$2,email=$3 where email=$4",
//         [upStaffId,upStaffName,upStaffEmail,staffLogedIn]);
//         staffLogedIn=upStaffEmail;
//     }
//     await viewStaffProfile(res);

// });


// Author

app.get('/authorLogin',(req,res)=>{
    res.render('AuthorLogin.ejs')
})

app.get('/author-register',(req,res)=>{
    res.render('authorRegister.ejs');
})

app.post('/author-Login',async(req,res)=>{
    const authorEmail=req.body.authorEmail;
    const authorpwd=req.body.password;
    try{
        const data=await db.query("select * from author where email=$1",
        [authorEmail]);
         authorLoggedIn=authorEmail;
        if(data.rows!=""){
            const decryptedPassword = cryptr.decrypt(data.rows[0].password);
             if(decryptedPassword==authorpwd){
                await loadingAuthorMainPage(res);
             }else{
                res.render('AuthorLogin.ejs',{
                    pwdError:"Incorrect password"
                });
             }

        }else{
            res.render('staff-login.ejs',{
                mailError:"Username is not registered"
            });
        }
    }
    catch(err){
        console.log(err);
    }
})



app.post('/returnToAuthorMain',async(req,res)=>{
    await loadingAuthorMainPage(res);
})

app.post('/authorViewProfile',async(req,res)=>{
    try{
    await viewAuthorProfile(res);    
    }catch(err){
        console.log(err)
    }
    
});
app.post('/deleteAuthor',async(req,res)=>{
    const idToDeleteAuthor=req.body.deleteAuthor;
    db.query("delete from author where auth_id=$1",
    [idToDeleteAuthor]);
    await displayAuthorInfo(res);
});

app.post('/searchAuthor',async(req,res)=>{
    const auth_id=req.body.authId;
    const auth_name=req.body.authName;

    try{
        if(auth_id!="" && auth_name==""){
            const dataUsingAuthId= await db.query("select * from author where auth_id=$1",
            [auth_id]);
            res.render('authorInfo.ejs',{
            authData:dataUsingAuthId.rows
            })
        }else if(auth_id=="" && auth_name!=""){
            const dataUsingAuthName= await db.query("select * from author where auth_name=$1",
            [auth_name]);
            res.render('authorInfo.ejs',{
            authData:dataUsingAuthName.rows
            })
        }else if(auth_id!="" && auth_name!=""){
            const dataAuth= await db.query("select * from author where auth_name=$1 ",
            [auth_id]);
            res.render('authorInfo.ejs',{
            authData:dataAuth.rows
            })
        }
    }catch(err){
        console.log(err);
        res.render('authorInfo.ejs',{
        authData:""
    });
    }
})


app.post('/authorRegister',async(req,res)=>{
    const authorName=req.body.authorName;
    const authorEmail=req.body.authorEmail;
    const authorPhone=req.body.authorPhone;
    const createPwd=req.body.createPassword;
    const confirmpwd=req.body.confirmPassword;
    if(createPwd==confirmpwd){
     const encryptedPassword = cryptr.encrypt(createPwd);
     try{
     await db.query("insert into author (auth_name,email,phone,password) values($1,$2,$3,$4)",
     [authorName,authorEmail,authorPhone,encryptedPassword]);
     res.redirect('/authorLogin');
     }catch(err){
      console.log(err);
     }
    }else{
     res.render('userRegister.ejs',{
         passwordErr:"Password doesn't match"
     });
    }
})

app.post('/authorInfo',async(req,res)=>{
    await displayAuthorInfo(res);
});

app.post('/insertBookFromAuthor',async(req,res)=>{
    const bookName=req.body.bookName;
    const price=req.body.bookPrice;
    if(bookName!="" && price!=""){
    try{
        const author_id=await db.query("select auth_id from author where email=$1",
        [authorLoggedIn]);
        console.log(authorLoggedIn)
        console.log(author_id.rows[0].auth_id)
        const auth_id_check=await db.query("select * from author where auth_id=$1",
        [author_id.rows[0].auth_id]);
        if(auth_id_check.rows!=""){
            db.query("insert into book (title,price,auth_id) values($1,$2,$3)",
            [bookName,price,author_id.rows[0].auth_id]);
        }
        const dataTrigger=await db.query("select message1 from logs")
        await db.query("delete from logs");
        await loadingAuthorMainPageTriggerInfo(res,dataTrigger.rows[0].message1);
       
    }catch(err){
        console.log(err);
    }
}
    await loadingAuthorMainPage(res);
})


// book

app.post('/bookInfo',async(req,res)=>{
    await displayBookInfo(res);
});


app.post('/insertBook',(req,res)=>{
    res.render('insertBook.ejs')
})

app.post('/insertNewBook',async(req,res)=>{
    const bookName=req.body.bookName;
    const price=req.body.bookPrice;
    const auth_id=req.body.bookAuthor;
    try{
        const auth_id_check=await db.query("select * from author where auth_id=$1",
        [auth_id]);
        if(auth_id_check.rows!=""){
            db.query("insert into book (title,price,auth_id) values($1,$2,$3)",
            [bookName,price,auth_id]);
        }
        const dataTrigger=await db.query("select message1 from logs")
        await db.query("delete from logs");
        await displayBookTriggerInfo(res,dataTrigger.rows[0].message1);
        
       
    }catch(err){
        console.log(err);
        await displayBookInfo(res);
    }
   

    
})

app.post('/deleteBook',async(req,res)=>{
    const idToDeleteBook=req.body.deleteBook;
    try{
    db.query("delete from book where book_id=$1",
    [idToDeleteBook]);
    }catch(err){
        console.log(err);
    }
    await displayBookInfo(res);
});

app.post('/searchBook',async(req,res)=>{
    const book_id=req.body.bookId;
    const book_name=req.body.bookName;
    const auth_name=req.body.authName;
     try{
    if(book_id!="" && book_name=="" && auth_name==""){
       const dataUsingBookId= await db.query("select * from book where book_id=$1",
       [book_id]);
       res.render('bookInfo.ejs',{
        bookData:dataUsingBookId.rows
       })
    }else if(book_id=="" && book_name!="" && auth_name==""){
       const dataUsingBookName= await db.query("select * from book where title=$1",
       [book_name]);
       res.render('bookInfo.ejs',{
        bookData:dataUsingBookName.rows
       })
    }else if(book_id=="" && book_name=="" && auth_name!=""){
       const dataUsingBookAuthor= await db.query("select * from book b,author a where b.auth_id=a.auth_id and auth_name=$1",
       [auth_name]);
       res.render('bookInfo.ejs',{
        bookData:dataUsingBookAuthor.rows
       })
    }else if(user_id!="" && user_name!="" && user_Address!=""){
        const dataBook= await db.query("select * from book b,author a where b.auth_id=a.auth_id and book_id=$1 and title=$2 and auth_name=$3",
        [book_id,book_name_name,auth_name]);
        res.render('bookInfo.ejs',{
            bookData:dataBook.rows
        })
    }
}catch(err){
    console.log(err);
    res.render('bookInfo.ejs',{
        bookData:""
    });
}
});

app.post('/editBook',async(req,res)=>{
    bookId=req.body.editBook;
    res.render('bookInfoEdit.ejs')
})

app.post('/updateBook',async(req,res)=>{
    const updateBookName=req.body.bookEditName;
    const updateBookPrice=req.body.bookEditPrice;
    const updateAuthorId=req.body.bookAuthorId;
    try{
        if(updateBookName!="" && updateBookPrice=="" && updateAuthorId==""){
            await db.query("update book set title=$1 where book_id=$2" ,
            [updateBookName,bookId]);

         }else if(updateBookName=="" && updateBookPrice!="" && updateAuthorId==""){
            await db.query("update book set price=$1 where book_id=$2" ,
            [updateBookPrice,bookId]);

         }else if(updateBookName=="" && updateBookPrice=="" && updateAuthorId!=""){
            await db.query("update book set auth_id=$1 where book_id=$2" ,
            [updateAuthorId,bookId]);

         }else if(updateBookName!="" && updateBookPrice!="" && updateAuthorId!=""){
            await db.query("update book set title=$1, price=$2 ,auth_id=$3 where book_id=$4" ,
            [updateBookName,updateBookPrice,updateAuthorId,bookId]);

         }
        await displayBookInfo(res);

    }catch(err){
        console.log(err);
    }
})


// report

app.post('/reportInfo',async(req,res)=>{
    await displayReportInfo(res);
})

app.post('/deleteReport',async(req,res)=>{
 const idToDeleteReport=req.body.deleteReport;
 db.query("delete from report where reg_no=$1",
 [idToDeleteReport]);
 await displayReportInfo(res);
})

app.post('/searchReport',async(req,res)=>{
 const regno=req.body.reg_no;
 const book_name=req.body.bookName;
 const reader_name=req.body.readName;
  try{
 if(regno!="" && book_name=="" && reader_name==""){
    const dataUsingregno= await db.query("select * from report where reg_no=$1",
    [regno]);
    res.render('reportInfo.ejs',{
     repData:dataUsingregno.rows
    })
 }else if(regno=="" && book_name!="" && reader_name==""){
    const dataUsingBookName= await db.query("select * from report where book_title=$1",
    [book_name]);
    res.render('reportInfo.ejs',{
     repData:dataUsingBookName.rows
    })
 }else if(regno=="" && book_name=="" && reader_name!=""){
    const dataUsingreadName= await db.query("select * from report where reader_name=$1",
    [reader_name]);
    res.render('reportInfo.ejs',{
     repData:dataUsingreadName.rows
    })
 }else if(regno=="" && book_name!="" && reader_name!=""){
     const dataUsingreadNameAndbookName= await db.query("select * from report where reader_name=$1 and book_title=$2",
     [reader_name,book_name]);
     res.render('reportInfo.ejs',{
      repData:dataUsingreadNameAndbookName.rows
     })
 }else if(regno!="" && book_name!="" && reader_name!=""){
     const dataUsingregno= await db.query("select * from report where reg_no=$1",
     [regno]);
     res.render('reportInfo.ejs',{
      repData:dataUsingregno.rows
     })
 }
}catch(err){
 console.log(err);
 res.render('bookInfo.ejs',{
     bookData:""
 });
}
})

// issue-book

app.post('/toBeIssued',async(req,res)=>{
    await loadBooksToBeIssuedPage(res);

})

app.post('/issueBook',async(req,res)=>{
    const primaryId=req.body.issueBook;
    const data=await db.query("select * from booksToBeIssued where id=$1",
    [primaryId]);
    const user_id=data.rows[0].user_id;
    const book_id=data.rows[0].book_id;
    const bookName=data.rows[0].book_title;
    try{
        await db.query("insert into issuedBooks (book_id,user_id,book_title) values($1,$2,$3)",
        [book_id,user_id,bookName]);
        await db.query("delete from booksToBeIssued where id=$1",
        [primaryId]);
        const reader_name=await db.query("select reader_name from booksToBeIssued where user_id=$1",
        [user_id]);
        await db.query("insert into report (book_title,reader_name,dateOfBorrow) values($1,$2,$3)",
        [bookName,reader_name.rows[0].reader_name,TodayDate]);
    }catch(err){
        console.log(err);
    }
    await loadBooksToBeIssuedPage(res);
})


app.listen(port,()=>{
    console.log(`Server running in https://localhost:${port}`);
});
