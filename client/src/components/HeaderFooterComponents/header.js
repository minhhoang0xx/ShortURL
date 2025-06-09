import { Header } from "antd/es/layout/layout";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const HeaderBar = () => {
  const navigate = useNavigate()
  const handleLogout = () => {
    console.log('header');
    localStorage.removeItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    message.success('Đăng xuất thành công.')
    navigate('/login')  
  }
    return (
      <Header className="header">
        <div className="header-content">
          <div>
            <img src="/logo.png" alt="Logo BA GPS" className="logo" />
            <span>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</span>
          </div>
          <div className="logout">
          <a onClick={handleLogout}><LogoutOutlined /></a>

          </div>
        </div>
      </Header>
    )
  }
  export default HeaderBar;
