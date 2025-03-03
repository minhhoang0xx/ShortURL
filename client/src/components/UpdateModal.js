import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select } from 'antd';
const { Option } = Select;
const UpdateShortlinkModal = ({ visible, onCancel, onUpdate, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const onFinish = (data) => {
    console.log('Form data:', data); 
    onUpdate(initialValues.id, data); 
    onCancel();
  };

  return (
    <Modal
      title="Cập nhật Shortlink"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        name="updateShortlink"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="originalUrl"
          label="URL gốc"
        >
          <Input readOnly/>
        </Form.Item>
        <Form.Item
          name="domain"
          label="Dự án"
          rules={[{ required: true, message: 'Vui lòng chọn domain!' }]}
        >
          <Select defaultValue="Chọn Domain" >
            <Option value="https://baexpress.io">BAExpress</Option>
            <Option value="https://staxi.vn">Staxi</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="alias"
          label="Đường dẫn"
          rules={[
            { pattern: /^[^\s]+$/, message: 'Alias không được chứa khoảng trắng!' },
            { 
              pattern: /^[a-zA-Z0-9]+$/, 
              message: 'Alias chỉ được chứa chữ cái (a-z, A-Z) và số (0-9)!' 
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateShortlinkModal;