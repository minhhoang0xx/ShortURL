import { EnvironmentFilled, GlobalOutlined, PhoneFilled } from "@ant-design/icons";
import { Footer } from "antd/es/layout/layout";

const footer = () => {
    return (
        <Footer className="footer">
        <div className="footer-content">
          <span><EnvironmentFilled /> 14 Nguyễn Cảnh Dị, Đại Kim, Hà Nội</span>
          <span><PhoneFilled /> 0988 333 666</span>
          <a href="https://admin.baexpress.io" target="_blank"><GlobalOutlined /> https://admin.baexpress.io</a>
        </div>
      </Footer>
    )

}
export default footer;