import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';

const UpdateShortlinkModal = ({ visible, onCancel, onUpdate, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.submit();
  };

  const onFinish = (values) => {
    onUpdate(values);
    onCancel();
  };

  return (
    <Modal
      title="Cập nhật Shortlink"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Lưu
        </Button>,
      ]}
    >
      <Form
        form={form}
        name="updateShortlink"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="project"
          label="Tên dự án"
          rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="alias"
          label="Đường dẫn"
          rules={[{ required: true, message: 'Vui lòng nhập tên đường dẫn!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="originalUrl"
          label="URL gốc"
          rules={[{ required: true, message: 'Vui lòng nhập URL gốc!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateShortlinkModal;