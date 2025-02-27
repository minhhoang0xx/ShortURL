import React, { useState } from 'react';
import { Layout, Form, Input, Button, Select, Space } from 'antd';
import './style.css';
import { useNavigate } from 'react-router-dom';


const { Header, Content, Footer } = Layout;
const { Option } = Select;


const CreateShortLink = () => {
  const [qrLink, setQrLink] = useState(" ");
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log('Received values:', values);
    // Xử lý logic khi submit form (ví dụ: tạo shortlink)
    const longUrl = values.longUrl; // Lấy URL người dùng nhập vào
    if (longUrl) {
      setQrLink(`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(longUrl)}`);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout>
      <Header className="header">
        <div className="header-content">
          <img src="logo.png" alt="Logo BA GPS" className="logo" />

          <span>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</span>
        </div>
      </Header>
      <Button
          type="primary"
          style={{ position: 'absolute', right: '10px', top: '75px' }}
        ><a onClick={() => navigate(`/listLink`)}>Danh sách link</a></Button> 
      <Content className="CSL_main-container">
              
         <h2>Quản trị Shortlink</h2>
        <div className="CSL_shortlink-form">
          <h3>CÔNG CỤ TẠO SHORTLINK</h3>

          <Form
            name="shortlink-form"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="longUrl"
              rules={[{ required: true, message: 'Vui lòng nhập URL gốc!' }]}
            >
              <Input placeholder="Nhập URL gốc" />
            </Form.Item>

            <Form.Item
              name="customLink"
              label="Tùy chỉnh liên kết của bạn:"
              className="CSL_custom-link"
            >
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="domain"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng chọn domain!' }]}
                >
                  <Select defaultValue="Chọn Domain" style={{ width: '50%' }}>
                    <Option value="BAExpress">BAExpress</Option>
                    <Option value="Staxi">Staxi</Option>
                  </Select>
                </Form.Item>
                <span style={{ color: '#000', margin: '0 10px', fontSize: '20px' }}>/</span>
                <Form.Item
                  name="alias"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng nhập tên tùy chỉnh!' }]}
                >
                  <Input placeholder="Tên đường dẫn - Alias" style={{ width: '50%' }} />
                </Form.Item>
              </Space.Compact>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="CSL_button-create">
                Tạo mới
              </Button>
            </Form.Item>

            <Form.Item label="Kết quả:" className="CSL_form-result">
              <div className="CSL_result">
                <div className="CSL_qr-code">
                  <img src={qrLink} alt="QR Code" />
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <div>
                <Button className="CSL_copy-btn" htmlType="button">Sao chép</Button>
              </div>
              <div>
                <Button className="CSL_link-btn" htmlType="button">Mở Link</Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Content>

      <Footer className="footer">
        <div className="footer-content">
          <span>14 Nguyễn Cảnh Dị, Định Công, Hoàng Mai, Hà Nội</span>
          <span>📞 0983 535 666</span>
          <a href="https://admin.baexpress.io" target="_blank">https://admin.baexpress.io</a>
        </div>
      </Footer>
    </Layout>
  );
};

export default CreateShortLink;