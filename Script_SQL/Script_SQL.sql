USE [LandingPageManagement]
GO

/****** Object:  Table [dbo].[ShortURL.Links]    Script Date: 4/15/2025 3:59:34 PM ******/
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
 CONSTRAINT [PK_ShortURL.Links] PRIMARY KEY CLUSTERED 
(
	[ShortId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO




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
    Null,
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
	null,
	GETDATE(),
	1,
	'market://details?id=com.binhanh.driver.baexpress&hl=vi&gl=US',
	'https://apps.apple.com/vn/app/baexpress/id1560112617',
	null
)


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
