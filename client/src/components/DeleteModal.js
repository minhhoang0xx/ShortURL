import React from 'react';
import { Modal } from 'antd';
import './style.css';

const DeleteModal = ({ visible, onCancel, onConfirm, record }) => {
  return (
    <Modal
      title="Xác nhận xóa dữ liệu"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Xác Nhận"
      cancelText="Hủy"
      className="custom-delete-modal" 
      okButtonProps={{ className: "confirm-button" }} 
      cancelButtonProps={{ className: "cancel-button" }} 
    >
      <h3>Bạn có chắc chắn muốn xóa ShortLink không?</h3>
      {record && (
        <>
          <p>{record.alias}</p>
        </>
      )}
    </Modal>
  );
};

export default DeleteModal;