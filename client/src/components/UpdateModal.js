import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as ShortUrlService from '../services/ShortUrlService';
const { Option } = Select;
const UpdateShortlinkModal = ({ visible, onCancel, onUpdate, record }) => {
  const [form] = Form.useForm();
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const [qrLink, setQrLink] = useState("");

  useEffect(() => {
    resetForm();
    if (visible && record) {
      form.resetFields();
      form.setFieldsValue(record);
      setShortUrl(record.shortLink);
      setQrLink(record.qrCode)
      console.log("Form values after setting:", record);
    }
  }, [visible, record]);

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
      onUpdate();
      if (data.domain == "https://staxi.vn") {
        data.projectName = "STaxi";
      }
      if (data.domain == "https://baexpress.io") {
        data.projectName = "BAExpress";
      }
      if (data.domain == "https://localhost:7033/api/ShortUrl") {
        data.projectName = "BAExpress";
      }
      const linkShort = `${data.domain}/${data.alias}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(linkShort)}`;
      data.qrCode = qr;
      const response = await ShortUrlService.updateShortLink(record.id, data)
      
      if (response && response.shortLink) {
        console.log("API Response:", response);
        message.success(`Link updated successfully!`);
        setShortUrl(response.shortLink);
        setQrLink(qr)
        onUpdate();
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
  const resetForm = () => {
    setShortUrl("");
  }

  return (
    <Modal open={visible} onCancel={onCancel} footer={null}>
      <Content className="CSL_main-container">
        <h3>CẬP NHẬT SHORTLINK</h3>
        <Form
          name="shortlink-form"
          onFinish={onFinish}
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
                  <Option value="https://localhost:7033/api/ShortUrl">localhost</Option>
                </Select>
              </Form.Item>
              <span style={{ color: '#000', margin: '0 10px', fontSize: '20px' }}>/</span>
              <Form.Item
                name="alias"
                noStyle
                rules={[
                  { required: true, message: 'Vui lòng nhập ShortCode' },
                  { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' },
                  {
                    pattern: /^[a-zA-Z0-9]+$/,
                    message: 'Alias chỉ được chứa chữ cái (a-z, A-Z) và số (0-9)!'
                  }
                ]}
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
              <div className="CSL_short-url">
              {shortUrl}
              </div>
              <div className="CSL_qr-code">
              {qrLink && <img src={qrLink} alt="QR Code"/>}
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <div>
              <Button className="CSL_copy-btn" htmlType="button" onClick={copyToClipboard} disabled={!shortUrl}>Sao chép</Button>
            </div>
            <div>
              <Button className="CSL_link-btn" htmlType="button" onClick={openLink}><LinkOutlined />Mở Link</Button>
            </div>
          </Form.Item>
        </Form>
      </Content>
    </Modal>
  );
};

export default UpdateShortlinkModal;