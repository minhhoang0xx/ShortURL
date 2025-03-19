import { message } from "antd";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if(!isLoggedIn) {
        message.warning("Bạn cần đăng nhập trước!")
        return <Navigate to="/Login" replace />;
    }
    return children;
};

export default PrivateRoute;