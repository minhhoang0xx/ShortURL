import { Header } from "antd/es/layout/layout";

const header = () =>{
    return(
        <Header className="header">
        <div className="header-content">
          <img src="/logo.png" alt="Logo BA GPS" className="logo" />

          <span>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</span>
        </div>
      </Header>
    )
}
export default header;