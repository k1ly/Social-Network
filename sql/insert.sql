use social_network;

insert into roles(name)
values ('ADMIN');

insert into roles(name)
values ('CLIENT');

insert into roles(name)
values ('GUEST');

begin
    declare @login varchar(max) = 'admin';
    declare @password varchar(max) = '$2b$10$80MiPAklihkYXtUch6.PL.kN3DlrAhgkRN0P1qAoAQg3rENmQnxhi';
    declare @name varchar(max) = 'admin';
    declare @email varchar(max) = 'admin@gmail.com';
    declare @blocked bit = 0;
    declare @roleId bigint;
    select @roleId = id
    from roles
    where name = 'ADMIN';
    insert into users(login, password, name, email, blocked, roleId)
    values (@login, @password, @name, @email, @blocked, @roleId);
end;

select *
from roles;
select *
from users;
select *
from posts;
select *
from likes;
select *
from comments;
select *
from messages;