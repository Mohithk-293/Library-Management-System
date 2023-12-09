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




-- create procedure search_reader9(in id int,)  AS $$
-- begin
-- select  * into valueQuery  from reader where user_id=id;
-- end;
-- $$ LANGUAGE plpgsql;

-- call search_reader9(29)














DO $$
DECLARE
    valueQuery reader;
BEGIN
    CALL search_reader(29), OUT output_row);
    -- Now, the output_row variable contains the entire row for id=1
    RAISE NOTICE 'Result: %', output_row;
END $$;





SET @inputValue = 5; -- Set the input value
CALL search_reader9(29, @outputResult); -- Call the stored procedure
SELECT @outputResult AS SquareResult; 

DO $$
DECLARE
    output_row reader;
BEGIN
    CALL search_reader(29), OUT output_row);
    -- Now, the output_row variable contains the entire row for id=1
    RAISE NOTICE 'Result: %', output_row;
END $$;


select * from reader


CREATE function seacrh_reader10(u_id INT)
    RETURNS TABLE (
        user_id INT,
        name VARCHAR(20),
        email VARCHAR(50),
        address varchar(100)
    )
AS $$
BEGIN
    RETURN QUERY SELECT * FROM reader WHERE user_id=u_id;
END;
$$ LANGUAGE plpgsql;

call seacrh_reader10(29)
