
import ListShortLink from "../pages/ListShortLink";
import NotFound from "../pages/NotFound";


export const routes =[
    {
        path: '/',
        page: ListShortLink,
        isShowHeader: true,
        isShowFooter: true,
    },
    {
        path: '*',
        page: NotFound,
        isShowHeader: true,
        isShowFooter: true,
    
    },


]   