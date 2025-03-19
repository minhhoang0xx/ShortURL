import { message } from "antd";
import { Navigate } from "react-router-dom";
import * as AuthenticationService from "../services/AuthenticationService";

const PrivateRoute = ({ children }) => {
    const isLoggedIn = AuthenticationService.isLoggedIn();
    if(!isLoggedIn) {
        message.warning("Bạn cần đăng nhập trước!")
        return <Navigate to="/Login" replace />;
    }
    return children;
};

export default PrivateRoute;