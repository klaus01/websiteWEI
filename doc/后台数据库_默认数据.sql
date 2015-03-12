/*
  视图
*/

CREATE VIEW VAppUsers AS
SELECT *,
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
SELECT *,
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

/*
  以下为测试用数据
-- App用户
INSERT INTO Users(Type) VALUES(1);
INSERT INTO AppUsers SET AppUserID=LAST_INSERT_ID(), PhoneNumber='18188888888', LoginPassword='111', RegistrationStatus=0, RegistrationTime=NOW();

INSERT INTO Users(Type) VALUES(1);
INSERT INTO AppUsers(AppUserID, Nickname, PhoneNumber, LoginPassword, IsMan, RegistrationStatus, RegistrationTime)
VALUES(LAST_INSERT_ID(), '柯', '13880440200', '111', 1, 0, NOW());

INSERT INTO Users(Type) VALUES(1);
INSERT INTO AppUsers(AppUserID, Nickname, PhoneNumber, LoginPassword, IsMan, RegistrationStatus, RegistrationTime)
VALUES(LAST_INSERT_ID(), '磊', '18181994671', '111', 0, 1, NOW());
-- 朋友关系
INSERT INTO Friends SET AppUserID=2,FriendUserID=3,IsBlack=0,CreateTime=NOW();
INSERT INTO Friends SET AppUserID=3,FriendUserID=2,IsBlack=0,CreateTime=NOW();
-- 公众号
-- 短信列表
INSERT INTO SMSLogs
VALUES (null, 1, '13880440200', '验证码：xxxx', NOW(), null),
    (null, 1, '13888888888', '验证码：xxxx', NOW(), NOW()),
    (null, 2, '13800000000', '朋友XXXX邀请您你一起使用WEI应用', NOW(), NOW());

INSERT INTO SMSLogs_Check
VALUES (1, '13880440200', 'xxxx', DATE_ADD(NOW(), INTERVAL 1 MINUTE), 0),
    (2, '13888888888', 'xxxx', DATE_ADD(NOW(), INTERVAL 1 MINUTE), 1);

*/