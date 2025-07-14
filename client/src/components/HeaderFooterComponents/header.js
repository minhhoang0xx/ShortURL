import { Header } from "antd/es/layout/layout";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";

const HeaderBar = () => {

  const navigate = useNavigate()
  const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
  let userName = null;
  try {
    if (token) {
      const decodedToken = jwtDecode(token);
      userName = decodedToken["name"];
    }
  } catch (err) {
    localStorage.removeItem(`${process.env.REACT_APP_TOKEN_KEY}`); 
  }

  const handleLogout = () => {
    localStorage.removeItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    message.success('Đăng xuất thành công.')
    navigate('/login')
  }

  return (
    <Header className="header">
      <div className="header-content">
        <div className="header-content-left">
          <img src="/logo.png" alt="Logo BA GPS" className="logo" />
          <span>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</span>
        </div>
        {userName && (
          <div className="logout">
            <a onClick={handleLogout}>
              <UserOutlined /> <span>{userName}</span> <LogoutOutlined />
            </a>
          </div>
        )}
      </div>
    </Header>
  )
}
export default HeaderBar;
