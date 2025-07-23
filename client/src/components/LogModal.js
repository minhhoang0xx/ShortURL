import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Col, DatePicker, message, Modal, Row, Table, Tag } from 'antd';
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
    const [scrollHeight, setScrollHeight] = useState(200);
    const [pagination, setPagination] = useState({  
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const columns = [
        {
            title: 'STT',
            key: 'STT',
            className: 'STT-column',
            width: '1%',
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
        },
        {
            title: 'Thiết bị',
            dataIndex: 'device',
            key: 'device',
            width: '4%',
        },
        {
            title: 'Hệ điều hành',
            dataIndex: 'os',
            key: 'os',
            width: '4%',
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
    useEffect(() => {
        const calculateScrollHeight = () => {
            const windowHeight = window.innerHeight;
            const offset = 370; 
            const tableHeight = windowHeight - offset;
    
            setScrollHeight(tableHeight > 200 ? tableHeight : 200); 
        };
    
        calculateScrollHeight();
        window.addEventListener('resize', calculateScrollHeight);
    
        return () => window.removeEventListener('resize', calculateScrollHeight);
    }, []);
    
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
                        className='tag-cate'
                        onClick={() => handleTagClick(tag)}
                        style={{ backgroundColor: '#DFDFDF', color: 'black' }}><TagOutlined /> {tag}</Tag>
                ))} </div>}
            open={visible}
            onCancel={onCancel}
            className="log_modal"
            width="80vw"
            footer={[
                <Button key="close" onClick={onCancel} className="log-modal-cancle">
                    Đóng
                </Button>]}
        >
            <Content className="log_main-container">
                <div className="log_main-container">
                    <div className="log_header">
                        {record && (
                            <Tag style={{ fontSize: 14, fontWeight: 'bold' }} color={record.status ? 'rgb(27 186 124)' : '#F03939'}>
                                {record.status ? 'Hoạt động' : 'Quá hạn'}
                            </Tag>
                        )}
                        <div style={{ paddingLeft: 16, width:400 }} >
                            <RangePicker
                                className="log_header-time"
                                format={dateFormat}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates)}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </div>
                        {record && (
                            <Row justify="space-between" style={{ width: '100%', paddingLeft: 24 }}>
                                <Col style={{ minWidth: 150, paddingRight: 16 }}>
                                    <div style={{ display: 'flex', marginBottom: 12 }}>
                                        <span>Dự án: </span>
                                        <span className="label">{record.projectName}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span>Ngày hết hạn:</span>
                                        <span className="label">
                                            {record.expiry ? dayjs(record.expiry).format('DD/MM/YYYY') : 'Vô thời hạn'}
                                        </span>
                                    </div>
                                </Col>
                                <Col style={{ minWidth: 150, paddingRight: 16 }}>
                                    <div style={{ display: 'flex', marginBottom: 12 }}>
                                        <span>Người cập nhật:</span>
                                        <span className="label">{record.createdByUser}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span>ShortURL:</span>
                                        <a
                                            href={record.shortLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="linkLog"
                                        >
                                            {record.shortLink}
                                        </a>
                                    </div>
                                </Col>
                                <Col style={{ minWidth: 150 }}>
                                    <div style={{ display: 'flex', marginBottom: 12 }}>
                                        <span>Lượt truy cập:</span>
                                        <span className="label">{record.clickCount}</span>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ y: scrollHeight  }}
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