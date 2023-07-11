use social_network;

-- alter table users
--     drop constraint user_role_fk;
-- alter table posts
--     drop constraint post_author_fk;
-- alter table likes
--     drop constraint likes_author_fk;
-- alter table likes
--     drop constraint like_post_fk;
-- alter table comments
--     drop constraint comment_author_fk;
-- alter table likes
--     drop constraint comment_post_fk;
-- alter table messages
--     drop constraint message_from_user_fk;
-- alter table messages
--     drop constraint message_to_user_fk;
--
-- drop table roles;
-- drop table users;
-- drop table posts;
-- drop table likes;
-- drop table comments;
-- drop table messages;

---------------------------

create table roles
(
    id   bigint primary key identity,
    name nvarchar(30) not null unique
);

create table users
(
    id       bigint primary key identity,
    login    varchar(20)  not null unique,
    password varchar(200) not null,
    name     nvarchar(40) not null,
    email    varchar(40)  null,
    blocked  bit          not null default 0,
    roleId   bigint       not null
);

create table posts
(
    id       bigint primary key identity,
    text     varchar(200) not null,
    imageUrl varchar(100) null,
    date     datetime     not null default sysdatetime(),
    authorId bigint       not null
);

create table likes
(
    id       bigint primary key identity,
    authorId bigint not null,
    postId   bigint not null
);

create table comments
(
    id       bigint primary key identity,
    text     varchar(200) not null,
    date     datetime     not null default sysdatetime(),
    authorId bigint       not null,
    postId   bigint       not null
);

create table messages
(
    id         bigint primary key identity,
    text       varchar(500) not null,
    date       datetime     not null default sysdatetime(),
    fromUserId bigint       not null,
    toUserId   bigint       not null
);

alter table users
    add constraint user_role_fk foreign key (roleId) references roles (id);

alter table posts
    add constraint post_author_fk foreign key (authorId) references users (id);

alter table likes
    add constraint likes_author_fk foreign key (authorId) references users (id);
alter table likes
    add constraint like_post_fk foreign key (postId) references posts (id);

alter table comments
    add constraint comment_author_fk foreign key (authorId) references users (id);
alter table likes
    add constraint comment_post_fk foreign key (postId) references posts (id);

alter table messages
    add constraint message_from_user_fk foreign key (fromUserId) references users (id);
alter table messages
    add constraint message_to_user_fk foreign key (toUserId) references users (id);