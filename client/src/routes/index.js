
import ListShortLink from "../pages/ShortURL/ListShortLink";
import NotFound from "../pages/ShortURL/NotFound";
import LandingPageBAExpress from "../pages/BAExpress/LandingPage";    
import RegisterPage from "../pages/ShortURL/RegisterPage";
import LoginPage from "../pages/ShortURL/LoginPage";

export const routes =[
    {
        path: '/ShortUrl',
        page: ListShortLink,
        isShowHeader: true,
        isShowFooter: true,
        requireAuth: true
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
        requireAuth: false
    
    },
    {
        path: '/Register',
        page: RegisterPage,
        requireAuth: false
    },
    {
        path: '/Login',
        page: LoginPage,
        requireAuth: false
    },


]   