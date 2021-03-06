/*
  视图
*/

CREATE VIEW VAppUsers AS
SELECT AppUserID, PhoneNumber, AreaType, RegistrationStatus, RegistrationTime,
    Nickname, IconFileName, IsMan, RegistrationDevice, RegistrationOS, LastLoginTime,
    LastLoginIP, LastLoginLongitude, LastLoginLatitude, APNSToken,
    CASE IsMan
        WHEN 0 THEN '女'
        WHEN 1 THEN '男'
        ELSE ''
    END AS IsManDescription,
    CASE RegistrationStatus
        WHEN 0 THEN '手机未验证'
        WHEN 1 THEN '手机已验证'
        WHEN 2 THEN '已经完善用户资料'
        WHEN 3 THEN '已进入应用主页'
        ELSE ''
    END AS RegistrationStatusDescription
FROM AppUsers;

CREATE VIEW VSMSLogs AS
SELECT a.*,
    CASE a.Type
        WHEN 1 THEN '验证手机'
        WHEN 2 THEN '邀请朋友'
        ELSE '其它'
    END AS TypeDescription,
    b.IsVerified,
    CASE b.IsVerified
        WHEN 0 THEN '未验证'
        WHEN 1 THEN '已验证'
        ELSE ''
    END AS IsVerifiedDescription
FROM SMSLogs AS a LEFT JOIN SMSLogs_Check AS b ON a.ID=b.SMSID;

CREATE VIEW VPartnerUsers AS
SELECT PartnerUserID, Name, IconFileName, Description, LoginName, Enabled,
    CreateTime, LastLoginTime, LastLoginIP, AppUserID,
    CASE Enabled
        WHEN 1 THEN '启用'
        ELSE '禁用'
    END AS EnabledDescription
FROM PartnerUsers;

CREATE VIEW VPartnerActivities AS
SELECT *,
    CASE Mode
        WHEN 1 THEN '活动(回复消息)'
        WHEN 2 THEN '活动(区域回复)'
        ELSE '广播消息'
    END AS ModeDescription
FROM PartnerActivities;


/*
  数据
*/

INSERT INTO BackendUsers(Name, CreateTime, IsManager, LoginName, LoginPassword)
VALUES('管理员', NOW(), 1, 'admin', '111');

INSERT INTO Words(Number, PictureFileName, Description, AudioFileName, UseCount_Before1D_CN, UseCount_Before30D_CN, UseCount_Before365D_CN, UseCount_Before1D_HK, UseCount_Before30D_HK, UseCount_Before365D_HK)
VALUES ('00000001', 'word_system_1.png', '这是一个字，猜猜', 'word_system_1.amr', 0, 0, 0, 0, 0, 0),
    ('00000002', 'word_system_2.png', '这个字不好认哦', 'word_system_2.amr', 0, 0, 0, 0, 0, 0),
    ('00000003', 'word_system_3.png', '这字没音频，更难猜', null, 0, 0, 0, 0, 0, 0);

/* 以下数据需要在mysql命令行中运行

--存储过程

DELIMITER //
CREATE PROCEDURE P_UpdateWordUseCount(aUpdateFieldName VARCHAR(100), aAreaType INT, aUseBeginTime DATETIME, aUseEndTime DATETIME)
BEGIN
SET @sql = CONCAT('
UPDATE Words, (
SELECT w.ID AS WordID, COUNT(m.ID) AS UseCount 
FROM Words AS w
    INNER JOIN WordMessages AS wm ON w.ID=wm.WordID
    INNER JOIN (SELECT ID, SourceUserID FROM Messages WHERE CreateTime BETWEEN ? AND ?) AS m ON wm.MessageID=m.ID
    INNER JOIN (SELECT AppUserID FROM AppUsers WHERE AreaType=?) AS u ON m.SourceUserID=u.AppUserID
GROUP BY w.ID
) AS d
SET ',
aUpdateFieldName,
'=d.UseCount WHERE ID=d.WordID');

PREPARE stmt1 FROM @sql;
SET @pBeginTime = aUseBeginTime;
SET @pEndTime = aUseEndTime;
SET @pAreaType = aAreaType;
EXECUTE stmt1 USING @pBeginTime, @pEndTime, @pAreaType;
DEALLOCATE PREPARE stmt1;

END//
DELIMITER ;

-- 作业

CREATE EVENT E_UpdateWord_UseCount_Before1D_CN
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 10 SECOND
DO CALL P_UpdateWordUseCount('UseCount_Before1D_CN', 0, CURDATE() - INTERVAL 1 DAY, CURDATE() - INTERVAL 1 SECOND);

CREATE EVENT E_UpdateWord_UseCount_Before30D_CN
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 11 SECOND
DO CALL P_UpdateWordUseCount('UseCount_Before30D_CN', 0, CURDATE() - INTERVAL 30 DAY, CURDATE() - INTERVAL 1 SECOND);

CREATE EVENT E_UpdateWord_UseCount_Before365D_CN
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 12 SECOND
DO CALL P_UpdateWordUseCount('UseCount_Before365D_CN', 0, CURDATE() - INTERVAL 365 DAY, CURDATE() - INTERVAL 1 SECOND);

CREATE EVENT E_UpdateWord_UseCount_Before1D_HK
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 13 SECOND
DO CALL P_UpdateWordUseCount('UseCount_Before1D_HK', 1, CURDATE() - INTERVAL 1 DAY, CURDATE() - INTERVAL 1 SECOND);

CREATE EVENT E_UpdateWord_UseCount_Before30D_HK
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 14 SECOND
DO CALL P_UpdateWordUseCount('UseCount_Before30D_HK', 1, CURDATE() - INTERVAL 30 DAY, CURDATE() - INTERVAL 1 SECOND);

CREATE EVENT E_UpdateWord_UseCount_Before365D_HK
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 15 SECOND
DO CALL P_UpdateWordUseCount('UseCount_Before365D_HK', 1, CURDATE() - INTERVAL 365 DAY, CURDATE() - INTERVAL 1 SECOND);

*/
