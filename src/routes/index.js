import React from "react";

const ListShortLink = React.lazy(() =>import("../pages/ShortURL/ListShortLink" )) ;
const NotFound = React.lazy(() => import("../pages/ShortURL/NotFound"));   
const LoginPage = React.lazy(() => import("../pages/ShortURL/LoginPage"))  ;
const RedirectPage = React.lazy(() => import("../pages/ShortURL/RedirectPage"))  ;


export const routes =[
    {
        path: '/',
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
        path: '/Login',
        page: LoginPage,
        requireAuth: false,
        isShowHeader: false,
        isShowFooter: false,
    },

]   