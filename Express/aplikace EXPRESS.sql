create table Users(
	id int primary key identity(1,1),
	username nvarchar(50) not null,
	password nvarchar(64) not null
);