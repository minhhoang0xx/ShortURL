import {  Button, Checkbox, DatePicker, Form, Input, Modal, Select, Space, message } from "antd";
import { CopyOutlined, LinkOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Content } from "antd/es/layout/layout";
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as ShortUrlService from '../services/ShortUrlService';
import * as DomainService from '../services/DomainService';
import * as TagService from '../services/TagService';
import { jwtDecode } from "jwt-decode";



const CreateModal = ({ visible, onCancel, onCreate }) => {
  const [qrLink, setQrLink] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const dateFormat = 'DD/MM/YYYY';


  useEffect(() => {
    if (visible) {
      fetchDomains();
      fetchTags();
    }
  }, [visible]);
  const fetchDomains = async () => {
    const response = await DomainService.getAll();
    setDomains(response);
  };
  const fetchTags = async () => {
    try {
      const response = await TagService.getAllTags();
      const formatted = response.map(tag => ({
        value: tag.name,
        label: tag.name
      }));
      setTagOptions(formatted);
    } catch (error) {
      console.error("Lỗi khi tải tag:", error);
    }
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
    setLoading(true)
    try {
      const selectedDomain = domains.find(domain => domain.link === data.domain);
      data.projectName = selectedDomain.name
      data.checkOS = isChecked ? true : false;
      data.expiry = data.expiry ? dayjs(data.expiry).format('YYYY-MM-DD') : null;
      const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
      const decodedToken = jwtDecode(token);
      const userName = decodedToken["name"];
      data.createdByUser = userName;
      const linkShort = `${data.domain}/${data.alias}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(linkShort)}`;
      data.qrCode = qr;
      data.status = true;
      data.status = data.expiry && new Date(data.expiry) < new Date() ? false : true;
      const response = await ShortUrlService.createShortLink(data)
      if (response && response.shortLink) {
        message.success(`Tạo thành công!`);
        setShortUrl(linkShort);
        setQrLink(qr);
        setIsExpired(data.expiry && new Date(data.expiry) < new Date());
        onCreate()
      }
    } catch (error) {
      console.error("API Error:", error);
      let err = "Tạo không thành công!";
      if (error.response?.data?.errorMessage) {
        err = error.response.data.errorMessage;
        message.error(err)
      } else {
        message.error(err);
      }
    }
    setLoading(false)
  };
  const copyToClipboard = () => {
    if (shortUrl && !isExpired) {
      navigator.clipboard.writeText(shortUrl)
        .then(() => {
          message.success('Link đã được sao chép!');
        })
        .catch(() => {
          message.error('Không thể sao chép link!');
        });
    }
  };
  const doDownload = (url, fileName) => {
    setLoading(true)
    try {
      const a = document.createElement('a');
      a.download = fileName;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      message.error("Tải QR Code thất bại.")
    } finally {
      setLoading(false)
    }

  }
  const downloadCanvasQRCode = () => {
    const img = document.getElementById('qr-image');
    if (!img) {
      message.error('Không tìm thấy ảnh QR.');
      return;
    }
    setLoading(true);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = img.src;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      const url = canvas.toDataURL('image/png');
      const fileName = `${shortUrl}.png`;
      doDownload(url, fileName);
    };

    image.onerror = () => {
      console.error('Không tải được ảnh QR từ nguồn.');
      setLoading(false);
    };
  };

  const openLink = () => {
    if (shortUrl) {
      window.open(shortUrl, '_blank');
    }
  };
  const resetForm = () => {
    form.resetFields();
    setShortUrl("");
    setQrLink("");
    setIsChecked(false);
    setIsChecked(false);
  }
  const handleCancel = () => {
    resetForm();
    onCancel();
  }
  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      loading={loading}
       width="38vw"
      footer={null}>
      <Content className="CSL_main-container">
        <h3>CÔNG CỤ TẠO SHORTLINK</h3>

        <Form
          name="shortlink-form"
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%' }}
          form={form}
          onValuesChange={handleFormValuesChange}
          onPressEnter={onFinish}
        >
          <div className="shortlink-form_Original">
            <Form.Item
              name="originalUrl"
              label={<span>URL gốc <span style={{ color: 'red' }}>*</span></span>}
              rules={[
                { required: true, message: 'Vui lòng nhập URL gốc!' },
                { pattern: /^[^\s]+$/, message: 'Không được chứa khoảng trắng!' }
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập URL gốc" />
            </Form.Item>
            <Button onClick={resetForm} icon={<SyncOutlined />} />
          </div>

          <Form.Item
            label="Tùy chỉnh liên kết của bạn:"
            className="CSL_custom-link"
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="domain"
                label={<span>Domain <span style={{ color: 'red' }}>*</span></span>}
                className="CSL_custom-link-domain"
                rules={[{ required: true, message: 'Chọn domain!' }]}
              >

                <Select placeholder="Chọn dự án" >
                  {domains.map((domain) => (
                    <Select.Option key={domain.id} value={domain.link}>
                      {domain.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label=" ">
                <span style={{ color: '#000', margin: '0 10px', fontSize: '20px' }}>/</span>
              </Form.Item>
              <Form.Item
                name="alias"
                label={<span>Tên đường dẫn-Alias <span style={{ color: 'red' }}>*</span></span>}
                className="CSL_custom-link-alias"
                rules={[
                  { required: true, message: 'Vui lòng nhập Alias!' },
                  { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' },
                  {
                    pattern: /^[a-zA-Z0-9]+$/,
                    message: 'Alias phải chứa chữ cái (a-z, A-Z) và số (0-9).'
                  },
                  {
                    max: 50,
                    message: 'Alias không được vượt quá 50 ký tự!'
                  }
                ]}
              >
                <Input placeholder="Tên đường dẫn - Alias" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            name="tags"
            label={<span>Tag: <span style={{ color: 'red' }}>*</span></span>}
            className='CSL_form-tag'
            rules={[
              { required: true, message: 'Vui lòng nhập Tag' },
            ]}>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập mới hoặc chọn tags"
              options={tagOptions}
            />
          </Form.Item>
          <Form.Item
            name="expiry"
            className="CSL_custom-time"
            label="Hạn sử dụng liên kết:"
          >
            <DatePicker placeholder="DD-MM-YYYY" className="datePicker" format={dateFormat}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item name="checkOS" className="checkOs">
            <Checkbox checked={isChecked} onClick={handleCheckOSChange} />
            <label> Tạo link tải APP</label>
            {/* <Switch checked={isChecked} onClick={handleCheckOSChange} checkedChildren="" unCheckedChildren=""/>
            <label> Tạo link tải APP</label> */}
          </Form.Item>
          {isChecked && (
            <Form.Item
              name="iosLink"
              label={<span>Link tới App Store <span style={{ color: 'red' }}>*</span></span>}
              rules={[{ required: true, message: "Vui lòng nhập URL App Store!" },
              { pattern: /^[^\s]+$/, message: 'Không được chứa khoảng trắng!' }
              ]}
            >
              <Input placeholder="Nhập URL App Store" />
            </Form.Item>
          )}
          {isChecked && (
            <Form.Item
              name="androidLink"
              label={<span>Link tới Google Play <span style={{ color: 'red' }}>*</span></span>}
              rules={[{ required: true, message: "Vui lòng nhập URL Google Play!" },
              { pattern: /^[^\s]+$/, message: 'Không được chứa khoảng trắng!' }
              ]}
            >
              <Input placeholder="Nhập URL Google Play" />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={loading} className="CSL_button-create">
              <PlusOutlined />  Tạo mới
            </Button>
          </Form.Item>

          <Form.Item label="Kết quả:" className="CSL_form-result">
            <div className="CSL_result">
              <div className="CSL_short-url">
                {shortUrl} {isExpired && <span style={{ color: 'red' }}>(Quá Hạn)</span>}
              </div>
              <div className="CSL_qr-code">
                {qrLink && (
                  <>
                    <img src={qrLink} disabled={loading} alt="QR Code" id="qr-image" style={{ maxWidth: 200 }} />
                    {/* <QRCode value={shortUrl} icon="/logo.png"/> */}
                    {/* <Button type="primary" disabled={loading} onClick={downloadCanvasQRCode}>Tải xuống</Button> */}
                  </>
                )}
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <div className="CSL_group-button">
              <div className="CSL_group-button1">
                <Button className="CSL_copy-btn" htmlType="button" onClick={copyToClipboard} disabled={!shortUrl}><CopyOutlined />Sao chép</Button>
              </div>
              <div className="CSL_group-button2">
                <Button className="CSL_link-btn" htmlType="button" onClick={openLink} disabled={!shortUrl}><LinkOutlined />Mở Link</Button>
              </div>
            </div>

          </Form.Item>
        </Form>
      </Content>
    </Modal>
  )
}
export default CreateModal;