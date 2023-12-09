create table staff(
id serial primary key,
name varchar(50),
email varchar(50),
password varchar(300)	
)

create table reader(
user_id serial primary key,
name varchar(20),
email varchar(50),
phone char(10),
address varchar(100),
password(200)	
)

create table author(
auth_id serial primary key,
auth_name varchar(20),
email varchar(20),
phone char(10),
password varchar(200)	
)

create table report(
reg_no serial primary key,
book_title varchar(20),
reader_name varchar(20),
dateofborrow varchar(10)	
)

create table book(
book_id serial primary key,
title varchar(20),
price int,
auth_id int references author(auth_id) on delete cascade on update cascade	
)

create table bookstobeissued(
id serial primary key,
book_id int references book(book_id) on delete cascade on update cascade	
user_id int references reader(user_id) on delete cascade on update cascade	
book_title varchar(20),
reader_name varchar(20)	
)

create table issuedbooks(
id serial primary key,
book_id int references book(book_id) on delete cascade on update cascade	
user_id int references reader(user_id) on delete cascade on update cascade	
book_title varchar(20)		
)





create trigger insert_book after insert on book for each row EXECUTE PROCEDURE add_book();

CREATE OR REPLACE FUNCTION add_book() RETURNS TRIGGER AS $example_table$
   BEGIN
      insert into logs values('Inserted a new book succesfully');
      RETURN NEW;
   END;
$example_table$ LANGUAGE plpgsql;
