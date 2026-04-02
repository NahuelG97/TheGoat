IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'nahuel')
BEGIN
  INSERT INTO Users (Username, PasswordHash, Role, Active, CreatedAt)
  VALUES ('nahuel', '$2a$10$pjwfERFtYp1W3chN1EwetOnAlhOuYgoEFpaP6U1y1Oc83uTkTJpxS', 'ADMINISTRADOR', 1, GETDATE())
END
ELSE
BEGIN
  UPDATE Users SET Role = 'ADMINISTRADOR' WHERE Username = 'nahuel'
END

SELECT Id, Username, Role, Active FROM Users ORDER BY Id
