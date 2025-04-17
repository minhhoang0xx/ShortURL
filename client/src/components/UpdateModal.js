import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select, message, Radio, Switch } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as ShortUrlService from '../services/ShortUrlService';
import * as DomainService from '../services/DomainService';
import { jwtDecode } from 'jwt-decode';

const UpdateShortlinkModal = ({ visible, onCancel, onUpdate, record }) => {
  const [form] = Form.useForm();
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const [qrLink, setQrLink] = useState("");
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {

    if (visible && record) {
      resetForm();
      form.setFieldsValue(record);
      fetchDomains();
      setShortUrl(record.shortLink);
      setQrLink(record.qrCode)
      setIsChecked(record.checkOS)
      console.log("Form values after setting:", record);
    }
  }, [visible, record]);
  const fetchDomains = async () => {
    const response = await DomainService.getAll();
    setDomains(response.$values);
    console.log("doamin", response)
  };

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
  const handleCheckOSChange = (e) => {
    const check = !isChecked;
    setIsChecked(check);
    if (!check) {
      form.setFieldsValue({ iosLink: "", androidLink: "" });
    }
  };
  const onFinish = async (data) => {
    console.log('Received values:', data);
    setLoading(true)
    try {
      onUpdate();
      const selectedDomain = domains.find(domain => domain.link === data.domain);
      data.projectName = selectedDomain.name
      data.checkOS = isChecked ? true : false;
      const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
      const decodedToken = jwtDecode(token);
      const userName = decodedToken["name"];
      data.createdByUser = userName;
      console.log("selectedDomain", selectedDomain)
      const linkShort = `${data.domain}/${data.alias}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(linkShort)}`;
      data.qrCode = qr;
      const response = await ShortUrlService.updateShortLink(record.id, data)
      
      if (response && response.shortLink) {
        console.log("API Response:", response);
        message.success(`Cập nhật thành công!`);
        setShortUrl(response.shortLink);
        setQrLink(qr)
        onUpdate();
      } 
    } catch (error) {
      console.error("API Error:", error);
      let err = "Cập nhật thất bại";
      if (error.response?.data?.errorMessage) {
        err = error.response.data.errorMessage
        message.error(err)
      } else {
        message.error(err)
      }
    }
    setLoading(false);
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
    setQrLink("")
    setIsChecked(false)
    form.resetFields();
  }

  return (
    <Modal open={visible} onCancel={onCancel} loading={loading} footer={null}>
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
            rules={[{ required: true, message: 'Vui lòng nhập URL gốc!' },
              { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' }
            ]}
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
                rules={[{ required: true, message: 'Vui lòng chọn Dự án!' }]}
              >
                <Select placeholder="Chọn Dự án" style={{ width: '50%' }}>
                {domains.map((domain) => (
                    <Select.Option key={domain.id} value={domain.link}>
                      {domain.name}
                    </Select.Option>
                ))}
                </Select>
              </Form.Item>
              <span style={{ color: '#000', margin: '0 10px', fontSize: '20px' }}>/</span>
              <Form.Item
                name="alias"
                noStyle
                rules={[
                  { required: true, message: 'Vui lòng nhập Alias' },
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
          <Form.Item name="checkOS">
            <Switch checked={isChecked} onClick={handleCheckOSChange} checkedChildren="CheckOS" unCheckedChildren="UnCheck"/>
          </Form.Item>
          {isChecked && (
            <Form.Item
              name="iosLink"
              rules={[{ required: true, message: "Vui lòng nhập URL App Store!" },
                { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' }
              ]}
            >
              <Input placeholder="Nhập URL App Store" />
            </Form.Item>
          )}
          {isChecked && (
            <Form.Item
              name="androidLink"
              rules={[{ required: true, message: "Vui lòng nhập URL Google Play!" },
                { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' }
              ]}
            >
              <Input placeholder="Nhập URL Google Play" />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={loading} className="CSL_button-create">
              Cập nhật
            </Button>
          </Form.Item>

          <Form.Item label="Kết quả:" className="CSL_form-result">
            <div className="CSL_result">
              <div className="CSL_short-url">
              {shortUrl}
              </div>
              <div className="CSL_qr-code">
              {qrLink && <img src={qrLink} disabled={loading} alt="QR Code"/>}
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <div>
              <Button className="CSL_copy-btn" htmlType="button" onClick={copyToClipboard} disabled={!shortUrl}>Sao chép</Button>
            </div>
            <div>
              <Button className="CSL_link-btn" htmlType="button" onClick={openLink} disabled={!shortUrl}><LinkOutlined />Mở Link</Button>
            </div>
          </Form.Item>
        </Form>
      </Content>
    </Modal>
  );
};

export default UpdateShortlinkModal;