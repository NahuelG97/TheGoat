UPDATE Users 
SET PasswordHash = '$2a$10$awGcVeZcy7Z7.W7gAxGOFe6Npz63OG7zD4yIvYxsONjqfDpAJdppO' 
WHERE Username = 'nahuel'

SELECT Id, Username, PasswordHash, Role, Active FROM Users
