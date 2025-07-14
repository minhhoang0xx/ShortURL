
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select, message, Checkbox, DatePicker, Tag } from 'antd';
import { Content } from 'antd/es/layout/layout';
import dayjs from 'dayjs';
import { CopyOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as ShortUrlService from '../services/ShortUrlService';
import * as DomainService from '../services/DomainService';
import * as TagService from '../services/TagService';
import { jwtDecode } from 'jwt-decode';
import ScrollContainer from 'react-indiana-drag-scroll';

const UpdateShortlinkModal = ({ visible, onCancel, onUpdate, record }) => {
  const [form] = Form.useForm();
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const [qrLink, setQrLink] = useState("");
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const dateFormat = 'DD/MM/YYYY';

  useEffect(() => {
    if (visible && record) {
      resetForm();
      const initialFormValues = {
        ...record,
        expiry: record.expiry ? dayjs(record.expiry, 'YYYY-MM-DDTHH:mm:ss') : null,
        tags: record.tags,
      };
      form.setFieldsValue(initialFormValues);
      setInitialValues(initialFormValues);
      fetchDomains();
      fetchTags();
      setShortUrl(record.shortLink);
      setQrLink(record.qrCode);
      setIsChecked(record.checkOS);
      setTagOptions(record.tag)
      setIsExpired(record.status === false || (record.expiry && new Date(record.expiry) < new Date()));
      setHasChanges(false);
    }
  }, [visible, record, form]);
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

  const handleFormValuesChange = (changedValues, allValues) => {
    if ('domain' in changedValues || 'alias' in changedValues) {
      const domain = form.getFieldValue('domain');
      const alias = form.getFieldValue('alias') || '';
      if (domain) {
        const combinedUrl = alias ? `${domain}/${alias}` : domain;
        setShortUrl(combinedUrl);
      }
    }
    // Kiểm tra xem có thay đổi so với giá trị ban đầu không
    const isChanged = Object.keys(allValues).some(key => {
      const currentValue = allValues[key];
      const initialValue = initialValues[key];
      if (key === 'expiry') {
        return currentValue?.format('YYYY-MM-DD') !== initialValue?.format('YYYY-MM-DD');
      }
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        return JSON.stringify(currentValue.sort()) !== JSON.stringify(initialValue.sort());
      }
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    });
    setHasChanges(isChanged);
  };

  const handleCheckOSChange = (e) => {
    const check = !isChecked;
    setIsChecked(check);
    if (!check) {
      form.setFieldsValue({ iosLink: "", androidLink: "" });
    }
    handleFormValuesChange({}, form.getFieldsValue());
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
      data.status = data.expiry && new Date(data.expiry) < new Date() ? false : true;
      data.tags = data.tags || [];
      const response = await ShortUrlService.updateShortLink(record.id, data)
      if (response && response.shortLink) {
        message.success(`Cập nhật thành công!`);
        setShortUrl(response.shortLink);
        setQrLink(qr)
        setIsExpired(data.expiry && new Date(data.expiry) < new Date());
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
          message.success('Shortlink đã được sao chép!');
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
    setShortUrl("");
    setQrLink("")
    setIsChecked(false)
    setIsExpired(false);
    form.resetFields();
    setHasChanges(false);
  }

  return (
    <Modal open={visible} onCancel={onCancel} loading={loading} width="38vw" footer={null}>
      <Content className="CSL_main-container">
        <h3>CẬP NHẬT SHORTLINK</h3>
        <Form
          name="shortlink-form"
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%' }}
          form={form}
          onValuesChange={handleFormValuesChange}
          onPressEnter={onFinish}
        >
          <Form.Item
            name="originalUrl"
            label={<span>URL gốc <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Vui lòng nhập URL gốc!' },
            { pattern: /^[^\s]+$/, message: 'Không được chứa khoảng trắng!' }
            ]}

          >
            <Input disabled={isExpired} placeholder="Nhập URL gốc" />
          </Form.Item>

          <Form.Item
            label="Tùy chỉnh liên kết của bạn:"
            className="CSL_custom-link"
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="domain"
                label={<span>Domain <span style={{ color: 'red' }}>*</span></span>}
                className="CSL_custom-link-domain"
                rules={[{ required: true, message: 'Chọn Dự án!' }]}
              >
                <Select disabled={isExpired} placeholder="Chọn dự án" >
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
                    message: 'Alias phải chứa chữ cái (a-z, A-Z) và số (0-9)!'
                  },
                  {
                    max: 50,
                    message: 'Alias không được vượt quá 50 ký tự!'
                  }
                ]}
              >
                <Input disabled={isExpired} placeholder="Tên đường dẫn - Alias" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Space.Compact style={{ width: '100%', gap: "2%" }}>
            <Form.Item
              name="tags"
              className='CSL_form-tag'>
              <Select
                mode="tags"
                placeholder="Nhập mới hoặc chọn tags"
                options={tagOptions}
                allowClear
                style={{ maxWidth: '100%' }}

              />
            </Form.Item>

            <Form.Item
              name="expiry"
              className="CSL_custom-time"
            // label="Hạn sử dụng liên kết:"
            >
              <DatePicker placeholder="Ngày hết hạn" className="datePicker" format={dateFormat}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Space.Compact>

          <Form.Item name="checkOS" className="checkOs">
            <Checkbox disabled={isExpired} checked={isChecked} onClick={handleCheckOSChange} />
            <label> Tạo link tải APP</label>
            {/* <Switch checked={isChecked} onClick={handleCheckOSChange} checkedChildren="CheckOS" unCheckedChildren="UnCheck"/> */}
          </Form.Item>
          {isChecked && (
            <Form.Item
              name="iosLink"
              rules={[{ required: true, message: "Vui lòng nhập URL App Store!" },
              { pattern: /^[^\s]+$/, message: 'Không được chứa khoảng trắng!' }
              ]}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 80 }}>App Store<span style={{ color: 'red' }}>*</span></div>
                <Input placeholder="Nhập URL App Store" style={{ flex: 1 }} />
              </div>
            </Form.Item>
          )}
          {isChecked && (
            <Form.Item
              name="androidLink"
              rules={[{ required: true, message: "Vui lòng nhập URL Google Play!" },
              { pattern: /^[^\s]+$/, message: 'Không được chứa khoảng trắng!' }
              ]}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 80 }}>Google Play<span style={{ color: 'red' }}>*</span></div>
                <Input placeholder="Nhập URL Google Play" style={{ flex: 1 }} />
              </div>
            </Form.Item>
          )}
          <Form.Item >
            <Button type="primary" htmlType="submit" disabled={loading || !hasChanges} className="CSL_button-create">
              <EditOutlined /> Cập nhật
            </Button>
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Kết quả:</span>
                <div className="CSL_short-url">
                  {shortUrl} {isExpired && <span style={{ color: 'red', marginLeft: 4, fontWeight: 'bold' }}>(Quá Hạn)</span>}
                </div>
              </div>
            }
            className="CSL_form-result">
            <div className="CSL_result">

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
                <Button className="CSL_copy-btn" htmlType="button" onClick={copyToClipboard} disabled={!shortUrl || isExpired}><CopyOutlined />Sao chép</Button>
              </div>
              <div className="CSL_group-button2">
                <Button className="CSL_link-btn" htmlType="button" onClick={openLink} disabled={!shortUrl || isExpired}><LinkOutlined />Mở Link</Button>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Content>
    </Modal>
  );
};

export default UpdateShortlinkModal;