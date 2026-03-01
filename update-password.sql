USE RotisserieDB;
GO

UPDATE Users 
SET PasswordHash = '$2a$10$HzPbFD5AA/PrFe4Eo2VQweoO9MABDLr2Ue6svEimmeuG5LJNSJM7e' 
WHERE Username = 'cajero';

SELECT Username, PasswordHash, Role, Active FROM Users WHERE Username = 'cajero';
