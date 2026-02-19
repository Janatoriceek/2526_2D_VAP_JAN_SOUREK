select jmeno, prijmeni
from Zamestnanci
where plat between 30000 and 60000;
 
select count(*) as pocet_muzu
from Zamestnanci
where pohlavi = 'M';
 
select avg(plat) as prumerny_plat
from Zamestnanci
where oddeleni = 0;
 
select *
from Zamestnanci
where plat > (select avg(plat) from Zamestnanci);
 
select top(1) *
from Zamestnanci
order by DatumNarozeni;
 
select *
from Zamestnanci z
where plat > (
    select avg(plat)
    from Zamestnanci
    where oddeleni = z.oddeleni
);
 
