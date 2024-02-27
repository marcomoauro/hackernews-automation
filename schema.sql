create table posts
(
    id          bigint unsigned auto_increment primary key,
    path        varchar(100) not null,
    url         varchar(255) not null,
    is_pickable tinyint(1)   not null default 1,
    created_at  datetime     not null default CURRENT_TIMESTAMP,
    updated_at  datetime     not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP
) engine = InnoDB;

create table submissions
(
    id         bigint unsigned auto_increment primary key,
    post_id    bigint unsigned not null,
    title      varchar(255)    not null,
    url        varchar(255)    not null,
    text       text            not null,
    created_at datetime        not null default CURRENT_TIMESTAMP,
    updated_at datetime        not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    foreign key (post_id) references posts (id)
) engine = InnoDB;

create table site_titles
(
    id         bigint unsigned auto_increment primary key,
    title      varchar(255) not null,
    created_at datetime     not null default CURRENT_TIMESTAMP,
    updated_at datetime     not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP
) engine = InnoDB;

alter table site_titles
    add unique key (title);