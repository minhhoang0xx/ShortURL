USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[Admin.Users]    Script Date: 6/25/2025 11:49:25 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Admin.Users](
	[AdminId] [uniqueidentifier] NOT NULL,
	[UserName] [nvarchar](50) NULL,
	[Password] [nvarchar](250) NULL,
	[Fullname] [nvarchar](50) NULL,
	[PhoneNumber] [varchar](50) NULL,
	[Email] [varchar](50) NULL,
	[IsLock] [bit] NULL,
	[IsDeleted] [bit] NULL,
	[CreatedByUser] [uniqueidentifier] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[UpdatedByUser] [uniqueidentifier] NULL,
	[UpdatedDate] [smalldatetime] NULL,
	[IPAddress] [nvarchar](250) NULL,
	[IsReadOnly] [bit] NULL,
 CONSTRAINT [PK_Admin.Users] PRIMARY KEY CLUSTERED 
(
	[AdminId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [uc_Admin.Users_UserName] UNIQUE NONCLUSTERED 
(
	[UserName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Admin.Users] ADD  CONSTRAINT [DF_Admin.Users_IsLock]  DEFAULT ((0)) FOR [IsLock]
GO

ALTER TABLE [dbo].[Admin.Users] ADD  CONSTRAINT [DF_Admin.Users_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
GO

ALTER TABLE [dbo].[Admin.Users] ADD  CONSTRAINT [DF_Admin.Users_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
-------------------------------------------------------------------------------------------------------------------------------------------------------
USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[Company.Config]    Script Date: 6/25/2025 11:49:18 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Company.Config](
	[PK_ConfigId] [int] IDENTITY(1,1) NOT NULL,
	[ConfigCode] [nvarchar](20) NULL,
	[UpdatedDate] [datetime] NULL,
	[JWTSecretKey] [nvarchar](50) NULL
) ON [PRIMARY]
GO


------------------------------------------------------------------------------------------------------------------------------------------------------------------
USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[ShortURL.Tags]    Script Date: 6/25/2025 11:48:52 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ShortURL.Tags](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ShortURL.Tags] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO


--------------------------------------------------------------------------------------------------------------------------------------------------------------------
USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[ShortURL.LinkTags]    Script Date: 6/25/2025 11:48:46 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ShortURL.LinkTags](
	[ShortId] [int] NOT NULL,
	[TagId] [int] NOT NULL,
 CONSTRAINT [PK_ShortURL.LinkTags] PRIMARY KEY CLUSTERED 
(
	[ShortId] ASC,
	[TagId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ShortURL.LinkTags]  WITH CHECK ADD  CONSTRAINT [FK_LinkTags_Links] FOREIGN KEY([ShortId])
REFERENCES [dbo].[ShortURL.Links] ([ShortId])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[ShortURL.LinkTags] CHECK CONSTRAINT [FK_LinkTags_Links]
GO

ALTER TABLE [dbo].[ShortURL.LinkTags]  WITH CHECK ADD  CONSTRAINT [FK_LinkTags_Tags] FOREIGN KEY([TagId])
REFERENCES [dbo].[ShortURL.Tags] ([Id])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[ShortURL.LinkTags] CHECK CONSTRAINT [FK_LinkTags_Tags]
GO


---------------------------------------------------------------------------------------------------------------------------------------------------------------------
USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[ShortURL.Links]    Script Date: 6/25/2025 11:48:38 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ShortURL.Links](
	[ShortId] [int] IDENTITY(1,1) NOT NULL,
	[ProjectName] [nvarchar](50) NOT NULL,
	[OriginalUrl] [nvarchar](max) NOT NULL,
	[Domain] [nvarchar](50) NOT NULL,
	[Alias] [nvarchar](50) NOT NULL,
	[QrCode] [nvarchar](max) NOT NULL,
	[CreateAt] [smalldatetime] NOT NULL,
	[CheckOS] [bit] NULL,
	[AndroidLink] [nvarchar](max) NULL,
	[IosLink] [nvarchar](max) NULL,
	[CreatedByUser] [nvarchar](50) NULL,
	[Expiry] [datetime] NULL,
	[Status] [bit] NOT NULL,
	[ClickCount] [int] NULL,
	[Tag] [nvarchar](max) NULL,
 CONSTRAINT [PK_ShortURL.Links] PRIMARY KEY CLUSTERED 
(
	[ShortId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
--------------------------------------------------------------------------------------------------------

USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[ShortURL.FormRequest]    Script Date: 4/15/2025 3:59:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ShortURL.FormRequest](
	[reqId] [int] IDENTITY(1,1) NOT NULL,
	[projectName] [nvarchar](max) NULL,
	[fullName] [nvarchar](max) NULL,
	[email] [nvarchar](max) NULL,
	[phoneNumber] [nvarchar](max) NULL,
	[message] [nvarchar](max) NULL,
	[address] [nvarchar](max) NULL,
	[company] [nvarchar](max) NULL,
	[status] [nvarchar](max) NULL,
 CONSTRAINT [PK_ShortURL.FormRequest] PRIMARY KEY CLUSTERED 
(
	[reqId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO



----------------------------------------------------------------------------------------------------------
USE [LandingPageManagement]
GO
/****** Object:  Table [dbo].[ShortURL.Domain]    Script Date: 4/15/2025 3:57:19 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ShortURL.Domain](
	[ShortDomainID] [int] IDENTITY(1,1) NOT NULL,
	[Link] [nvarchar](max) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_ShortURL.Domain] PRIMARY KEY CLUSTERED 
(
	[ShortDomainID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
-------------------------------------------------------------------------------------------------------------------------------------------------------------------
USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[ShortURL.Counts]    Script Date: 6/25/2025 11:48:22 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ShortURL.Counts](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ShortId] [int] NOT NULL,
	[IP] [nvarchar](100) NULL,
	[UserAgent] [nvarchar](max) NULL,
	[Device] [nvarchar](100) NULL,
	[OS] [nvarchar](100) NULL,
	[Browser] [nvarchar](100) NULL,
	[Referrer] [nvarchar](500) NULL,
	[ClickedAt] [datetime] NOT NULL,
	[Source] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ShortURL.Counts]  WITH CHECK ADD  CONSTRAINT [FK_ShortURL_Counts_Links] FOREIGN KEY([ShortId])
REFERENCES [dbo].[ShortURL.Links] ([ShortId])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[ShortURL.Counts] CHECK CONSTRAINT [FK_ShortURL_Counts_Links]
GO


-- *******************************************************************************************************
------------------ Appstore & GooglePlay fit OS devide-----------------------------
INSERT INTO [dbo].[ShortURL.Links] (
    ProjectName,
    OriginalUrl,
    Domain,
    Alias,
    QrCode,
    CreateAt,
    CheckOS,
    AndroidLink,
    IosLink,
    CreatedByUser
) 
VALUES 
(
    'Staxi',
    'https://app.g7taxi.vn/home/store',
    'https://staxi.vn',
    'staxi',
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http%3A%2F%2Flocalhost%3A3000%2Flink%2Fstaxi',
    GETDATE(),
    1,
    'market://details?id=com.binhanh.g7taxi&hl=vi&gl=US',
    'https://apps.apple.com/vn/app/g7-taxi/id1437487421',
    Null
),(
	'BAExpress',
	'https://baexpress.io/store',
	'https://baexpress.io',
	'baexpress',
	'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http%3A%2F%2Flocalhost%3A3000%2Flink%2Fbae',
	GETDATE(),
	1,
	'market://details?id=com.binhanh.driver.baexpress&hl=vi&gl=US',
	'https://apps.apple.com/vn/app/baexpress/id1560112617',
	null
)

------------------------------ Domain of project----------------------------- 
INSERT INTO [dbo].[ShortURL.Domain] (
   Link,
   Name
) 
VALUES 
(
    'https://staxi.vn',
	'Staxi'
),
(
	'https://baexpress.io',
	'BAExpress'
)
