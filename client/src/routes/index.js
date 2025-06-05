import React from "react";

const ListShortLink = React.lazy(() =>import("../pages/ShortURL/ListShortLink" )) ;
const NotFound = React.lazy(() => import("../pages/ShortURL/NotFound"));
const LandingPageBAExpress = React.lazy(() => import("../pages/BAExpress/LandingPage"))  ;    
const RegisterPage = React.lazy(() => import( "../pages/ShortURL/RegisterPage")) ;
const LoginPage = React.lazy(() => import("../pages/ShortURL/LoginPage"))  ;
const RedirectPage = React.lazy(() => import("../pages/ShortURL/RedirectPage"))  ;
const LandingPageStaxi = React.lazy(() => import("../pages/Staxi/LandingPage"))  ;

export const routes =[
    {
        path: '/ShortUrl',
        page: ListShortLink,
        isShowHeader: true,
        isShowFooter: true,
        requireAuth: true
    },
    {
        path: 'link/:alias',
        page: RedirectPage,
        isShowHeader: false,
        isShowFooter: false,
        requireAuth: false
    },
    {
        path: '*',
        page: NotFound,
        isShowHeader: true,
        isShowFooter: true,
        requireAuth: false
    },
    {
        path: '/',
        page: LandingPageBAExpress,
        requireAuth: false,
        isShowHeader: false,
        isShowFooter: false,
    },
    {
        path: '/Register',
        page: RegisterPage,
        requireAuth: false,
        isShowHeader: false,
        isShowFooter: false,
    },
    {
        path: '/Login',
        page: LoginPage,
        requireAuth: false,
        isShowHeader: false,
        isShowFooter: false,
    },
    {
        path: 'Staxi',
        page: LandingPageStaxi,
        requireAuth: false,
        isShowHeader: false,
        isShowFooter: false,
    }
  
]   