import React, { useState } from 'react';
import { Layout, Form, Input, Button, Select, Space } from 'antd';
import message from 'antd/es/message';
import './style.css';
import { useNavigate } from 'react-router-dom';
import * as ShortUrlService from '../services/ShortUrlService';


const { Header, Content, Footer } = Layout;
const { Option } = Select;


const CreateShortLink = () => {
  const [qrLink, setQrLink] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();


  const handleFormValuesChange = (changedValues) => {
    if ('domain' in changedValues || 'alias' in changedValues) {
      const domain = form.getFieldValue('domain');
      const alias = form.getFieldValue('alias') || '';
      if (domain) {
        const combinedUrl = alias ? `${domain}/${alias}` : domain;
        setShortUrl(combinedUrl);
      }
    }
  };

  const onFinish = async (data) => {
    console.log('Received values:', data);
    try {
      if (data.domain == "https://staxi.vn") {
        data.projectName = "STaxi";
      }
      if (data.domain == "https://baexpress.io") {
        data.projectName = "BAExpress";
      }
      const response = await ShortUrlService.createShortLink(data)
      if (response && response.shortLink) {
        console.log("API Response:", response);
        message.success(`Link created successfully!`);
        setShortUrl(response.shortLink);
        setQrLink(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(response.shortLink)}`);
        console.log("QR Link:", qrLink);
        form.resetFields();
      } else {
        throw new Error("Failed to create link");
      }
    } catch (error) {
      console.error("API Error:", error);
      let err = "Failed to create link.";
      if (error.response?.data?.message) {
        err = error.response.data.message;
      } else if (error.message) {
        err = error.message;
      }
      message.error(err);
    }
    // const originalUrl = data.originalUrl; // Lấy URL người dùng nhập vào
    // if (originalUrl) {
    //   setQrLink(`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(originalUrl)}`);
    // }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
        .then(() => {
          message.success('Link đã được sao chép!');
        })
        .catch(() => {
          message.error('Không thể sao chép link!');
        });
    }
  };

  const openLink = () => {
    if (shortUrl) {
      window.open(shortUrl, '_blank');
    }
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
      ><a onClick={() => navigate(`/listLink`)}>Danh sách</a></Button>
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
            form={form}
            onValuesChange={handleFormValuesChange}
          >
            <Form.Item
              name="originalUrl"
              rules={[{ required: true, message: 'Vui lòng nhập URL gốc!' }]}
            >
              <Input placeholder="Nhập URL gốc" />
            </Form.Item>

            <Form.Item
              label="Tùy chỉnh liên kết của bạn:"
              className="CSL_custom-link"
            >
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="domain"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng chọn domain!' }]}
                >
                  <Select placeholder="Chọn Domain" style={{ width: '50%' }}>
                    <Option value="https://baexpress.io">BAExpress</Option>
                    <Option value="https://staxi.vn">Staxi</Option>
                  </Select>
                </Form.Item>
                <span style={{ color: '#000', margin: '0 10px', fontSize: '20px' }}>/</span>
                <Form.Item
                  name="alias"
                  noStyle
                  rules={[
                    { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' },
                    { 
                      pattern: /^[a-zA-Z0-9]+$/, 
                      message: 'Alias chỉ được chứa chữ cái (a-z, A-Z) và số (0-9)!' 
                    }
                  ]}
                >
                  <Input placeholder="Tên đường dẫn - Alias(Không bắt buộc)" style={{ width: '50%' }} />
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
                <div className="CSL_short-url">
                  {shortUrl}
                </div>
                <div className="CSL_qr-code">
                  {qrLink && <img src={qrLink} alt="QR Code" />}
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <div>
                <Button className="CSL_copy-btn" htmlType="button" onClick={copyToClipboard} disabled={!shortUrl}>Sao chép</Button>
              </div>
              <div>
                <Button className="CSL_link-btn" htmlType="button" onClick={openLink}>Mở Link</Button>
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