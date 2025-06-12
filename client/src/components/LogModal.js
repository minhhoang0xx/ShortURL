import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, message, Modal, Table, Tag } from 'antd';
import * as ShortUrlService from '../services/ShortUrlService';
import './style.css';
import { Content } from 'antd/es/layout/layout';
import { useNavigate } from 'react-router-dom';
import { TagOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker
const dateFormat = 'DD/MM/YYYY';
const LogModal = ({ visible, onCancel, record, onTagClick }) => {
    const navigate = useNavigate();
    const [filteredData, setFilteredData] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const columns = [
        {
            title: 'STT',
            key: 'STT',
            className: 'STT-column',
            width: '2%',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Thời gian truy cập',
            dataIndex: 'clickedAt',
            key: 'clickedAt',
            width: '6%',
            className: 'action-column',
            render: (date) => (date ? dayjs(date).format('HH:mm:ss DD/MM/YYYY') : 'null'),
        },
        {
            title: 'Trình duyệt',
            dataIndex: 'browser',
            key: 'browser',
            width: '4%',
            className: 'action-column',
        },
        {
            title: 'Thiết bị',
            dataIndex: 'device',
            key: 'device',
            width: '4%',
            className: 'action-column',
        },
        {
            title: 'Hệ điều hành',
            dataIndex: 'os',
            key: 'os',
            width: '5%',
            className: 'action-column',
        },
        // {
        //     title: 'Nguồn truy cập',
        //     dataIndex: 'source',
        //     key: 'source',
        //     width: '15%',
        // },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            width: '5%',    
        },
    ]
    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
            if (!token) {
                message.error('Không tìm thấy token, vui lòng đăng nhập lại!');
                navigate('/Login');
                return;
            }
            const log = await ShortUrlService.getLogs(record.alias, record.domain);
            const formattedData = log.map((log) => ({ ...log, key: log.id }));
            setOriginalData(formattedData);
            let dataToDisplay = [...formattedData];
            console.log('data of log', log)
            // Kiểm tra dateRange có phải là mảng có giá trị 
            if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
                const startDate = dayjs(dateRange[0]).startOf('day');
                const endDate = dayjs(dateRange[1]).endOf('day');
                dataToDisplay = formattedData.filter((item) => {
                    // Kiểm tra clickedAt
                    const clickedAt = item.clickedAt ? dayjs(item.clickedAt) : null;
                    if (!clickedAt || !clickedAt.isValid()) {
                        return false;
                    }
                    return (clickedAt.isAfter(startDate) || clickedAt.isSame(startDate)) &&
                        (clickedAt.isBefore(endDate) || clickedAt.isSame(endDate));
                });
            }
            setFilteredData(dataToDisplay);
            setPagination((prev) => ({ ...prev, total: dataToDisplay.length }));
        } catch (error) {
            console.error('Failed to fetch data:', error);
            message.error(error.response?.data?.errorMessage || 'Lấy dữ liệu thất bại!');
        } finally {
            setLoading(false);
        }
    };
    const handleTableChange = (newPagination) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };
    const handleTagClick = (tag) => {
        onTagClick(tag);
        onCancel(); 
      };


    return (
        <Modal
            title={<div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {record?.tags?.map((tag, index) => (
                    <Tag key={index} 
                    onClick={() => handleTagClick(tag)}
                    style={{ backgroundColor: '#DFDFDF', color: 'black' }}><TagOutlined/> {tag}</Tag>
                ))} </div>}
            open={visible}
            onCancel={onCancel}
            className="log_modal"
            width="90vw"
            footer={[
                <Button key="close" onClick={onCancel} className="log-modal-cancle">
                    Đóng
                </Button>]}
        >
            <Content className="log_main-container">
                <div className="log_main-container">
                    <div className="log_header">
                        <RangePicker
                            className="log_header-time"
                            format={dateFormat}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            placeholder={['Từ ngày', 'Đến ngày']}
                        />
                        {record && (
                            <div className="log_info-flex">
                                <div className="log_info-row">
                                    <div className="log_info-pair">
                                        <span className="label">Dự án:</span>
                                        <span>{record.projectName}</span>
                                    </div>
                                    <div className="log_info-pair">
                                        <span className="label">Ngày hết hạn:</span>
                                        <span>{record.expiry ? dayjs(record.expiry).format('DD/MM/YYYY') : 'Vô thời hạn'}</span>
                                    </div>
                                    <div className="log_info-pair">
                                        <span className="label">Người cập nhật:</span>
                                        <span>{record.createdByUser}</span>
                                    </div>
                                    <div className="log_info-pair">
                                        <span className="label">Lượt truy cập:</span>
                                        <span>{record.clickCount}</span>
                                    </div>
                                </div>

                                <div className="log_info-row">
                                    <div className="log_info-pair">
                                        <span className="label">ShortURL:</span>
                                        <a href={record.shortLink} target="_blank" rel="noopener noreferrer">{record.shortLink}</a>
                                    </div>
                                    <div className="log_info-pair">
                                        <span className="label">URL gốc:</span>
                                        <a className="linkLog" href={record.originalUrl} target="_blank" rel="noopener noreferrer" title={record.originalUrl}>{record.originalUrl} </a>
                                    </div>
                                </div>
                            </div>
                        )}
                        {record && (
                            <Tag color={record.status ? '#1ebd7b' : '#F03939'}>
                                {record.status ? 'Hoạt động' : 'Quá hạn'}
                            </Tag>)}
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ y: 90 * 15 }}
                    pagination={{
                        ...pagination,
                        showTotal: (total) => `Tổng số: ${total}`,
                    }}
                    onChange={handleTableChange}
                    loading={loading}
                    className="LSL_shortlink-table"
                />
            </Content>

        </Modal>
    );
};

export default LogModal;