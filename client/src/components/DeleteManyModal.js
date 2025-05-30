import React from 'react';
import { Modal } from 'antd';
import './style.css';

const DeleteManyModal = ({ visible, onCancel, onConfirm, count, record, loading }) => {
  return (
    <Modal
      title="Xác nhận"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Xác Nhận"
      cancelText="Hủy"
      className="custom-delete-modal"
      confirmLoading={loading} 
      okButtonProps={{ className: "confirm-button" }} 
      cancelButtonProps={{ className: "cancel-button" }} 
    >
      <h3>Số shortLink mà chọn chọn để xóa:  </h3>
      <h1>{count}</h1>
    </Modal>
  );
};

export default DeleteManyModal;