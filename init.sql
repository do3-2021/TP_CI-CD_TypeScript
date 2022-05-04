create table if not exists city_api
(
    id          serial
        constraint city_api_pk
            primary key,
    department_code        varchar(50),
    insee_code varchar(50),
    zip_code varchar(50), 
    name varchar(50) not null, 
    lat real not null,
    lon real not null,
);

create unique index if not exists city_api_id_uindex
    on city_api (id);

