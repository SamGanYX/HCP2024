ALTER USER 'devSync'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON devSync.* TO 'devSync'@'%';
FLUSH PRIVILEGES; 