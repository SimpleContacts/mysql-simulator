-- All keywords are lowercase

create table aaa (id int primary key);
create table bbb (id int primary key);
alter table bbb
  add column a int null,
  add foreign key(a) references aaa(id),
  add constraint foreign key(a) references aaa(id),
  --             ^^^^^^^
  --             This should NOT be interpreted as an identifier, but as keyword
  add constraint xxxxxxx foreign key(a) references aaa(id);
  --             ^^^^^^^
  --             This SHOULD get interpreted as an identifier, not as a keyword
