SET character_set_client = utf8 ; 
SET character_set_connection = utf8 ; 
SET character_set_database = utf8 ; 
SET character_set_results = utf8 ; 
SET character_set_server = utf8 ; 


CREATE TABLE `BackendUsers` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`Name` varchar(50) NOT NULL COMMENT '姓名',

`CreateTime` datetime NOT NULL COMMENT '创建时间',

`IsManager` tinyint(1) NOT NULL COMMENT '0不是管理员；1是管理员',

`LoginName` varchar(20) NOT NULL COMMENT '登录名',

`LoginPassword` varchar(64) NOT NULL COMMENT '登录密码',

`LastLoginTime` datetime NULL COMMENT '最近登录时间',

`LastLoginIP` varchar(20) NULL COMMENT '最近登录IP',

PRIMARY KEY (`ID`) ,

UNIQUE INDEX `LoginName_UNIQUE` (`LoginName`)

)

COMMENT='后台用户信息表'
;



CREATE TABLE `SMSLogs` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`Type` tinyint NOT NULL COMMENT '短信类型。0其它、1验证手机、2邀请朋友',

`PhoneNumber` varchar(20) NOT NULL COMMENT '短信发往的手机号',

`Content` varchar(200) NOT NULL COMMENT '短信内容',

`CreateTime` datetime NOT NULL COMMENT '创建时间',

`SendTime` datetime NULL COMMENT '发送成功的时间',

PRIMARY KEY (`ID`) 

)

COMMENT='短信发送日志表'
;



CREATE TABLE `SMSLogs_Check` (

`SMSID` int UNSIGNED NOT NULL COMMENT '短信ID',

`PhoneNumber` varchar(20) NOT NULL COMMENT '需要验证的手机号，冗余字段',

`VerificationCode` varchar(10) NOT NULL COMMENT '验证码',

`ExpirationTime` datetime NOT NULL COMMENT '验证码过期时间',

`IsVerified` tinyint(1) NOT NULL COMMENT '0未验证；1已验证',

PRIMARY KEY (`SMSID`) ,

INDEX `PhoneNumber_IsVerified_INDEX` (`PhoneNumber`, `IsVerified`)

)

COMMENT='验证短信信息表'
;



CREATE TABLE `Users` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`Type` tinyint NOT NULL COMMENT '用户类型。0公众号，1APP用户',

PRIMARY KEY (`ID`) 

)

COMMENT='用户ID表，包含公众号用户与应用用户'
;



CREATE TABLE `PartnerUsers` (

`PartnerUserID` int UNSIGNED NOT NULL COMMENT '公众号ID',

`Name` varchar(50) NOT NULL COMMENT '名称',

`IconFileName` varchar(50) NOT NULL COMMENT '头像文件名',

`Description` varchar(200) NULL COMMENT '描述',

`LoginName` varchar(20) NOT NULL COMMENT '登录名',

`LoginPassword` varchar(64) NOT NULL COMMENT '登录密码',

`Enabled` tinyint(1) NOT NULL COMMENT '0未启用，1已启用',

`CreateTime` datetime NOT NULL COMMENT '创建时间',

`LastLoginTime` datetime NULL COMMENT '最近登录时间',

`LastLoginIP` varchar(20) NULL COMMENT '最近登录IP',

`AppUserID` int UNSIGNED NULL COMMENT '公众号关联的APP用户ID',

PRIMARY KEY (`PartnerUserID`) ,

UNIQUE INDEX `LoginName_UNIQUE` (`LoginName`)

)

COMMENT='公众号用户信息表'
;



CREATE TABLE `AppUsers` (

`AppUserID` int UNSIGNED NOT NULL COMMENT '用户ID',

`PhoneNumber` varchar(20) NOT NULL COMMENT '电话号码',

`LoginPassword` varchar(64) NOT NULL COMMENT '登录密码',

`AreaType` tinyint UNSIGNED NOT NULL COMMENT '用户地区类型。0大陆，1香港',

`RegistrationStatus` int NOT NULL COMMENT '注册状态。0手机未验证，1手机已验证，2已经完善用户资料，3已进入应用主页',

`RegistrationTime` datetime NOT NULL COMMENT '注册时间',

`Nickname` varchar(50) NULL COMMENT '昵称',

`IconFileName` varchar(50) NULL COMMENT '头像图片文件名',

`IsMan` tinyint(1) NULL COMMENT '0女，1男',

`RegistrationDevice` varchar(255) NULL COMMENT '用户注册时使用的设备名称',

`RegistrationOS` varchar(255) NULL COMMENT '用户注册时使用操作系统版本',

`LastLoginTime` datetime NULL COMMENT '最近登录时间',

`LastLoginIP` varchar(20) NULL COMMENT '最近登录IP',

`LastLoginLongitude` double NULL COMMENT '最近登录地理经度',

`LastLoginLatitude` double NULL COMMENT '最近登录地理纬度',

`APNSToken` varchar(64) NULL COMMENT '苹果设备远程通知令牌',

PRIMARY KEY (`AppUserID`) ,

UNIQUE INDEX `PhoneNumber_UNIQUE` (`PhoneNumber`)

)

COMMENT='应用用户信息表'
;



CREATE TABLE `PartnerActivities` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`PartnerUserID` int UNSIGNED NOT NULL COMMENT '公众号用户ID',

`CreateTime` datetime NOT NULL COMMENT '创建时间',

`Mode` tinyint NOT NULL COMMENT '活动模式。0广播消息、1一段时间内需要回复的、2一段时间内在指定区域回复的',

`PictureFileName` varchar(50) NOT NULL COMMENT '活动图片文件名',

`Content` varchar(200) NOT NULL COMMENT '活动描述文字',

`URL` varchar(255) NULL COMMENT '相关URL地址',

PRIMARY KEY (`ID`) 

)

COMMENT='公众号活动表'
;



CREATE TABLE `Words` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`Number` char(8) NOT NULL COMMENT '字的编号。系统默认为1到10000，商家10001到10000000，用户10000001开始',

`CreateUserID` int UNSIGNED NULL COMMENT '创建这个字的应用用户ID',

`PictureFileName` varchar(50) NOT NULL COMMENT '字图片文件名',

`Description` varchar(200) NULL COMMENT '字的描述文本',

`AudioFileName` varchar(50) NULL COMMENT '字的音频文件名',

`UseCount_Before1D_CN` int UNSIGNED NOT NULL,

`UseCount_Before30D_CN` int UNSIGNED NOT NULL,

`UseCount_Before365D_CN` int UNSIGNED NOT NULL,

`UseCount_Before1D_HK` int UNSIGNED NOT NULL,

`UseCount_Before30D_HK` int UNSIGNED NOT NULL,

`UseCount_Before365D_HK` int UNSIGNED NOT NULL,

PRIMARY KEY (`ID`) ,

UNIQUE INDEX `Number_UNIQUE` (`Number`),

INDEX `CreateUserID` (`CreateUserID`)

)

COMMENT='字信息表'
;



CREATE TABLE `Messages` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`CreateTime` datetime NOT NULL COMMENT '创建时间',

`SourceUserID` int UNSIGNED NOT NULL COMMENT '发送者用户ID',

`ReceiveUserID` int UNSIGNED NOT NULL COMMENT '接收者用户ID',

`Type` tinyint NOT NULL COMMENT '消息类型，0成为朋友、1字、2公众号广播、3中奖',

`Content` varchar(200) NOT NULL COMMENT '消息内容',

`IsRead` tinyint(1) NOT NULL COMMENT '0：未读，1：已读',

PRIMARY KEY (`ID`) 

)

COMMENT='消息表'
;



CREATE TABLE `Friends` (

`AppUserID` int UNSIGNED NOT NULL,

`FriendUserID` int UNSIGNED NOT NULL,

`CreateTime` datetime NOT NULL,

`IsBlack` tinyint(1) UNSIGNED NOT NULL COMMENT '=1：AppUserID将FriendUserID列入黑名单',

PRIMARY KEY (`AppUserID`, `FriendUserID`) 

)

COMMENT='朋友关系表。订阅关系也在这里，用户A加朋友用户B此表有两条记录A->B和B->A，用户A订阅公众号C此表有一条记录A->C'
;



CREATE TABLE `SMSWaitingList` (

`SMSID` int UNSIGNED NOT NULL,

PRIMARY KEY (`SMSID`) 

)

COMMENT='等待发送的短信ID列表，短信发送成功后设置SMSLogs.SendTime且删除SMSWaitingList中的记录'
;



CREATE TABLE `APNSWaitingList` (

`ID` int UNSIGNED NOT NULL AUTO_INCREMENT,

`Token` varchar(64) NOT NULL,

`Type` tinyint NOT NULL,

`Content` varchar(200) NOT NULL,

PRIMARY KEY (`ID`) 

)

COMMENT='APNS待发送消息列表，发送后删除'
;



CREATE TABLE `InviteFriends` (

`AppUserID` int UNSIGNED NOT NULL,

`FriendPhoneNumber` varchar(20) NOT NULL,

PRIMARY KEY (`AppUserID`, `FriendPhoneNumber`) ,

INDEX `FriendPhoneNumber_INDEX` (`FriendPhoneNumber`)

)

COMMENT='应用用户邀请朋友关系表，邀请注册后删除记录'
;



CREATE TABLE `WordMessages` (

`MessageID` int UNSIGNED NOT NULL,

`WordID` int UNSIGNED NOT NULL,

PRIMARY KEY (`MessageID`, `WordID`) 

)

COMMENT='字消息列表'
;



CREATE TABLE `ActivitiesExt` (

`PartnerActivityID` int UNSIGNED NOT NULL,

`BeginTime` datetime NOT NULL COMMENT '活动开始时间',

`EndTime` datetime NOT NULL COMMENT '活动结束时间',

`ExpireAwardTime` datetime NOT NULL COMMENT '终止领奖时间',

`Longitude` double NULL COMMENT '活动指定经度',

`Latitude` double NULL COMMENT '活动指定纬度',

`DistanceMeters` int UNSIGNED NULL COMMENT '活动指定经纬度距离 米',

PRIMARY KEY (`PartnerActivityID`) 

)

COMMENT='公众号广播活动的扩展信息'
;



CREATE TABLE `ActivityMessages` (

`MessageID` int UNSIGNED NOT NULL,

`PartnerActivityID` int UNSIGNED NOT NULL COMMENT '活动ID',

`AppUserID` int UNSIGNED NOT NULL COMMENT '参加活动的用户ID',

PRIMARY KEY (`MessageID`) ,

UNIQUE INDEX `PartnerActivityID_AppUserID_UNIQUE` (`PartnerActivityID`, `AppUserID`)

)

COMMENT='活动消息表。也表示活动发给了哪些应用用户'
;



CREATE TABLE `ActivityGiftMessages` (

`MessageID` int UNSIGNED NOT NULL,

`PartnerActivityID` int UNSIGNED NOT NULL COMMENT '活动ID',

`AppUserID` int UNSIGNED NOT NULL COMMENT '中奖用户ID',

`AwardQRCodeInfo` varchar(1000) NOT NULL COMMENT '领奖时的二维码字符串内容。链接到后台领奖登记接口的URL',

`AwardTime` datetime NULL COMMENT '领奖时间。NULL视为未领奖',

PRIMARY KEY (`MessageID`) ,

UNIQUE INDEX `PartnerActivityID_AppUserID_UNIQUE` (`PartnerActivityID`, `AppUserID`)

)

COMMENT='应用用户活动中奖关系表'
;





ALTER TABLE `SMSLogs_Check` ADD CONSTRAINT `fk_SMSLogs_Check_SMSLogs_1` FOREIGN KEY (`SMSID`) REFERENCES `SMSLogs` (`ID`);

ALTER TABLE `PartnerUsers` ADD CONSTRAINT `fk_PartnerUsers_Users_1` FOREIGN KEY (`PartnerUserID`) REFERENCES `Users` (`ID`);

ALTER TABLE `AppUsers` ADD CONSTRAINT `fk_AppUsers_Users_1` FOREIGN KEY (`AppUserID`) REFERENCES `Users` (`ID`);

ALTER TABLE `PartnerActivities` ADD CONSTRAINT `fk_PartnerActivities_PartnerUsers_1` FOREIGN KEY (`PartnerUserID`) REFERENCES `PartnerUsers` (`PartnerUserID`);

ALTER TABLE `Words` ADD CONSTRAINT `fk_Words_AppUsers_1` FOREIGN KEY (`CreateUserID`) REFERENCES `AppUsers` (`AppUserID`);

ALTER TABLE `Messages` ADD CONSTRAINT `fk_Messages_Users_1` FOREIGN KEY (`SourceUserID`) REFERENCES `Users` (`ID`);

ALTER TABLE `Messages` ADD CONSTRAINT `fk_Messages_Users_2` FOREIGN KEY (`ReceiveUserID`) REFERENCES `Users` (`ID`);

ALTER TABLE `Friends` ADD CONSTRAINT `fk_Friends_AppUsers_1` FOREIGN KEY (`AppUserID`) REFERENCES `AppUsers` (`AppUserID`);

ALTER TABLE `SMSWaitingList` ADD CONSTRAINT `fk_SMSWaitingList_SMSLogs_1` FOREIGN KEY (`SMSID`) REFERENCES `SMSLogs` (`ID`);

ALTER TABLE `PartnerUsers` ADD CONSTRAINT `fk_PartnerUsers_AppUsers_1` FOREIGN KEY (`AppUserID`) REFERENCES `AppUsers` (`AppUserID`);

ALTER TABLE `InviteFriends` ADD CONSTRAINT `fk_InviteFriends_AppUsers_1` FOREIGN KEY (`AppUserID`) REFERENCES `AppUsers` (`AppUserID`);

ALTER TABLE `WordMessages` ADD CONSTRAINT `fk_WordMessages_Messages_1` FOREIGN KEY (`MessageID`) REFERENCES `Messages` (`ID`);

ALTER TABLE `WordMessages` ADD CONSTRAINT `fk_WordMessages_Words_1` FOREIGN KEY (`WordID`) REFERENCES `Words` (`ID`);

ALTER TABLE `ActivitiesExt` ADD CONSTRAINT `fk_ActivitieExt_PartnerActivities_1` FOREIGN KEY (`PartnerActivityID`) REFERENCES `PartnerActivities` (`ID`);

ALTER TABLE `ActivityMessages` ADD CONSTRAINT `fk_ActivityMessages_Messages_1` FOREIGN KEY (`MessageID`) REFERENCES `Messages` (`ID`);

ALTER TABLE `ActivityMessages` ADD CONSTRAINT `fk_ActivityMessages_PartnerActivities_1` FOREIGN KEY (`PartnerActivityID`) REFERENCES `PartnerActivities` (`ID`);

ALTER TABLE `ActivityGiftMessages` ADD CONSTRAINT `fk_ActivityGiftMessages_PartnerActivities_1` FOREIGN KEY (`PartnerActivityID`) REFERENCES `PartnerActivities` (`ID`);

ALTER TABLE `ActivityGiftMessages` ADD CONSTRAINT `fk_ActivityGiftMessages_Messages_1` FOREIGN KEY (`MessageID`) REFERENCES `Messages` (`ID`);

ALTER TABLE `Friends` ADD CONSTRAINT `fk_Friends_Users_1` FOREIGN KEY (`FriendUserID`) REFERENCES `Users` (`ID`);

ALTER TABLE `ActivityMessages` ADD CONSTRAINT `fk_ActivityMessages_AppUsers_1` FOREIGN KEY (`AppUserID`) REFERENCES `AppUsers` (`AppUserID`);

ALTER TABLE `ActivityGiftMessages` ADD CONSTRAINT `fk_ActivityGiftMessages_AppUsers_1` FOREIGN KEY (`AppUserID`) REFERENCES `AppUsers` (`AppUserID`);



