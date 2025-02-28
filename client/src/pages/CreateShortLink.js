import React, { useState } from 'react';
import { Layout, Form, Input, Button, Select, Space, message } from 'antd';
import './style.css';
import { useNavigate } from 'react-router-dom';
import * as ShortUrlService from '../services/ShortUrlService';


const { Header, Content, Footer } = Layout;
const { Option } = Select;


const CreateShortLink = () => {
  const [qrLink, setQrLink] = useState(" ");
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const updateResultUrl = () => {
    const domain = form.getFieldValue('domain');
    const alias = form.getFieldValue('alias') || '';
    if (domain) {
      const combinedUrl = alias ? `${domain}/${alias}` : domain;
      setShortUrl(combinedUrl);
      // Cập nhật QR code 
      if (combinedUrl) {
        setQrLink(`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(combinedUrl)}`);
      }
    }
  };
  const handleFormValuesChange = (changedValues) => {
    if ('domain' in changedValues || 'alias' in changedValues) {
      updateResultUrl();
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
      await ShortUrlService.createShortLink(data)
      console.log('hop lop');
      message.success('Link create successfully!');
      updateResultUrl();
      form.resetFields();
    } catch (error) {
      console.error('err', error.response);
      message.error('Failed to create.');
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
                  <Select defaultValue="Chọn Domain" style={{ width: '50%' }}>
                    <Option value="https://baexpress.io">BAExpress</Option>
                    <Option value="https://staxi.vn">Staxi</Option>
                  </Select>
                </Form.Item>
                <span style={{ color: '#000', margin: '0 10px', fontSize: '20px' }}>/</span>
                <Form.Item
                  name="alias"
                  noStyle
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
                  {/* <img src={qrLink} alt="QR Code" /> */}
                  <img src="data:image/png;base64,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" alt = "QR Code"/>
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <div>
                <Button className="CSL_copy-btn" htmlType="button" onClick={copyToClipboard}  disabled={!shortUrl}>Sao chép</Button>
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