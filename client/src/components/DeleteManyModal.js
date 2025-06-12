import React from 'react';
import { Modal } from 'antd';
import './style.css';

const DeleteManyModal = ({ visible, onCancel, onConfirm, count, record, loading }) => {
  return (
    <Modal
      title="Xác nhận xóa ShortLink"
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
    
      <h3>Số ShortLink đã chọn:  </h3>
      <h1>{count}</h1>
      <h3>Bạn có chắc chắn muốn xóa không?</h3>
    </Modal>
  );
};

export default DeleteManyModal;