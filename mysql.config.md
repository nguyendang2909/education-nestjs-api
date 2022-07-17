CREATE DATABASE education;
CREATE USER 'lesleiapp'@'localhost' IDENTIFIED BY 'mypass';
CREATE USER 'lesleiapp'@'%' IDENTIFIED BY 'mypass';
GRANT ALL PRIVILEGES ON education.* TO 'lesleiapp'@'%';


Allow access remote for mysql config file




<!-- remove global sql mode: only full group by -->
SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

<!-- if SQL is not working well, do it: -->
SET SESSION sql_mode = sys.list_drop(@@SESSION.sql_mode, 'ONLY_FULL_GROUP_BY');
SET sql_mode = sys.list_drop(@@sql_mode, 'ONLY_FULL_GROUP_BY');
SET @@sql_mode = sys.list_drop(@@sql_mode, 'ONLY_FULL_GROUP_BY');
