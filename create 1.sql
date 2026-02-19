create table Zamestnanci(
	Id int primary key identity(0, 1), 
	Jmeno nvarchar(50) not null,
	Prijmeni nvarchar(50) not null,
	Plat decimal not null check(plat > 0),
	Pohlavi nchar(1) check (pohlavi = N'Z' or pohlavi = N'M'),
	DatumNarozeni Date not null,
	Oddeleni int,
);