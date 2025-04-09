USE OruCa_DB;

CREATE TABLE logs (
    student_ID VARCHAR(16) NOT NULL PRIMARY KEY,
    isInRoom BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    student_ID VARCHAR(16) NOT NULL PRIMARY KEY,
    student_Name VARCHAR(64),
    token CHAR(64) NOT NULL
);

CREATE VIEW student_token_view AS
    SELECT u.student_ID, u.token
    FROM users u
    JOIN logs l ON u.student_ID = l.student_ID;

CREATE VIEW student_log_view AS
    SELECT l.student_ID, u.student_Name, l.isInRoom, l.updated_at
    FROM logs l
    JOIN users u ON l.student_ID = u.student_ID;

SET @admin_page_pass = '$ADMIN_PAGE_PASS';

CREATE PROCEDURE insert_or_update_log(IN stuID VARCHAR(16))
BEGIN
    DECLARE password VARCHAR(32) DEFAULT @admin_page_path;
    DECLARE salt VARCHAR(32);
    DECLARE token VARCHAR(64);

    -- ランダムなsaltの生成（例としてUUIDを使用）
    SET salt = SHA2(stuID,256);

    -- ハッシュ生成 (saltとpasswordを結合してハッシュ化)
    SET token = SHA2(CONCAT(stuID, password, salt), 256);

    -- logsテーブルへのINSERT/UPDATE
    INSERT INTO logs (student_ID, isInRoom) 
    VALUES (stuID, TRUE)
    ON DUPLICATE KEY UPDATE
        isInRoom = NOT isInRoom,
        updated_at = CURRENT_TIMESTAMP;

    -- usersテーブルへのINSERT (saltとtokenを保存)
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE student_ID = stuID) THEN
        INSERT INTO users (student_ID,student_Name, token)
        VALUES (stuID,NULL, token);
    END IF;
END;

CREATE PROCEDURE update_student_name(IN stuID VARCHAR(16),IN stuName VARCHAR(64))
BEGIN
    UPDATE logs
    SET student_Name = stuName
    WHERE student_ID = stuID;
END;

CREATE PROCEDURE get_student_token(IN stuID VARCHAR(16))
BEGIN
    SELECT token
    FROM student_token_view
    WHERE student_ID = stuID;
END;