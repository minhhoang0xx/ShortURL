import { Layout, Table, Input, Button, Select, Space, message, Spin, QRCode } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as ShortUrlService from '../../services/ShortUrlService';
import * as DownloadService from '../../services/DownloadService';
import UpdateModal from '../../components/UpdateModal';
import DeleteModal from '../../components/DeleteModal';
import CreateModal from '../../components/CreateModal';
import { CopyFilled, CopyOutlined, CopyTwoTone, DeleteTwoTone, EditFilled, EditTwoTone } from '@ant-design/icons';
import '../../pages/ShortURL/style.css';
import * as DomainService from '../../services/DomainService';
import { jwtDecode } from 'jwt-decode';
const { Content } = Layout;
const { Option } = Select;

const ListShortLink = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [deleteModal, setDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
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
      width: '3.76%',
      render: (_, __, index) => {
        const pageSize = pagination.pageSize;
        const currentPage = pagination.current;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: '6.9%',
    },
    {
      title: 'Tên đường dẫn',
      dataIndex: 'alias',
      key: 'alias',
      width: '11.3%',
      sorter: (a, b) => a.alias.localeCompare(b.alias),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'URL gốc',
      dataIndex: 'originalUrl',
      key: 'originalUrl',
      ellipsis: true,
      render: (HyperLink) => (
        <a href={HyperLink} target="_blank" rel="noreferrer">
          {HyperLink}
        </a>
      ),
      width: '30.56%',
    },
    {
      title: 'URL rút gọn',
      
      dataIndex: 'shortLink',
      key: 'shortLink',
      ellipsis: true,
      width: '18.28%',
      render: (HyperLink, record) => (
        <a href={HyperLink} target="_blank" rel="noreferrer"
          onClick={(e) => {
            if (record.status === false) {
              e.preventDefault();
              message.error('Shortlink đã hết hạn, không thể mở!');
            }
          }}
        >
          {HyperLink}
        </a>
        ),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'createAt',
      key: 'createAt',
      showSorterTooltip: false,
      className: 'action-column',
      render: (date) => (date ? dayjs(date).format('HH:mm DD/MM/YYYY') : 'null'),
      width: '12%',
      sorter: (a, b) => dayjs(a.createAt).unix() - dayjs(b.createAt).unix(), 
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiry',
      key: 'expiry',
      className: 'action-column',
      showSorterTooltip: false,
      render: (date) => (date ? dayjs(date).format(' DD/MM/YYYY') : 'Vô thời hạn'),
      width: '12%',
      sorter: (a, b) => {
        if (!a.expiry && !b.expiry) return 0;
        if (!a.expiry) return 1; 
        if (!b.expiry) return -1;
        return dayjs(a.expiry).unix() - dayjs(b.expiry).unix();
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Người chỉnh sửa',
      dataIndex: 'createdByUser',
      key: 'createdByUser',
      width: '12%',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      className: 'action-column',
      showSorterTooltip: false,
      key: 'status',
      width: '8%',
      render: (status) => (
        <span className={status ? 'status-active' : 'status-expired'}>
          {status ? 'Hoạt động' : 'Quá Hạn'}
        </span>
      ),
      sorter: (a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Chức Năng',
      key: 'action',
      width: '8.2%',
      className: 'action-column',
      render: (_, record) => (
        <Space size="middle">
           <a onClick={() => copyToClipboard(record)}>
            <CopyTwoTone twoToneColor="#818582"  />
          </a>
          <a onClick={() => showModal(record)}>
            <EditTwoTone twoToneColor="#2d6ed6"/>
          </a>
          <a onClick={() => showDeleteConfirm(record)}>
            <DeleteTwoTone twoToneColor="#ed0505" />
          </a>
         
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const urls = await ShortUrlService.getAllLink();
      const urlfetch = urls.$values;
      console.log('Data từ API:', urls);
      const formattedData = urlfetch.map((url) => ({ ...url, key: url.id}));
      setData(formattedData);
      setPagination((prev) => ({ ...prev, total: formattedData.length }));
      filterData(formattedData, selectedProject, searchText);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const filterData = (sourceData, project, search) => {
    let result = [...sourceData];
    if (project && project !== 'all') {
      result = result.filter(
        (item) =>
          item.projectName && item.projectName.toLowerCase() === project.toLowerCase()
      );
    }
    if (search) {
      result = result.filter(
        (item) => item.alias && item.alias.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredData(result);
    setPagination((prev) => ({ ...prev, current: 1, total: result.length }));
  };

  const fetchDomains = async () => {
    const response = await DomainService.getAll();
    setDomains(response.$values.map((domain) => domain.name));
  };

  useEffect(() => {
    fetchData();
    fetchDomains();
  }, []);

  useEffect(() => {
    filterData(data, selectedProject, searchText);
    console.log('pagination',pagination)
  }, [selectedProject, searchText, data]);

  useEffect(() => {
    const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    if (!token) {
      navigate('/Login');
    }
  }, [navigate]);

  const showModal = (record) => {
    setSelectedRecord(record);
    setLoading(true);
    setIsModalOpen(true);
    setLoading(false);
  };

  const handleCancelUpdate = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleUpdate = () => {
    fetchData();
  };

  const showDeleteConfirm = (record) => {
    setLoading(true);
    setRecordToDelete(record);
    setDeleteModal(true);
    setLoading(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await ShortUrlService.deleteShortLink(recordToDelete.id);
      setData((prevData) => prevData.filter((link) => link.id !== recordToDelete.id));
      message.success('Xóa thành công!');
      setDeleteModal(false);
      setRecordToDelete(null);
      fetchData();
    } catch (error) {
      let err = 'Xóa thất bại!';
      if (error.response?.data.errorMessage) {
        err = error.response.data.errorMessage;
        message.error(err);
      } else {
        message.error(err);
      }
    }
    setLoading(false);
  };

  const handleCancelDelete = () => {
    setDeleteModal(false);
    setRecordToDelete(null);
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
  };

  const showCreateModal = () => {
    setLoading(true);
    setCreateModal(true);
    setLoading(false);
  };

  const handleCreate = () => {
    fetchData();
  };

  const handleCancelCreate = () => {
    setCreateModal(false);
  };
    const copyToClipboard = (record) => {
      if (record.status === false) {
        message.error('Shortlink đã hết hạn, không thể sao chép!');
        return;
      }
    if (record) {
      navigator.clipboard.writeText(record.shortLink)
        .then(() => {
          message.success('Link đã được sao chép!');
        })
        .catch(() => {
          message.error('Không thể sao chép link!');
        });
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
        if (filteredData.length === 0) {
            message.warning('Không có dữ liệu để xuất!');
            setLoading(false);
            return;
        }
        console.log('dowload', filteredData);
        const response = await DownloadService.download(filteredData);

        const blob = response.data;
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `ShortURL_${dayjs().format('YYYY_M_D_HH_mm_ss')}.xlsx`; 
        if (contentDisposition && contentDisposition.includes('attachment; filename=')) {
            fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Xuất file thất bại:', error);
        message.error(`Xuất Excel thất bại!`);
    }
    setLoading(false);
};

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  return (
    <Layout>
      <Content className="LSL_main-container">
        <div className="LSL_search-bar">
          <Space>
            <Select
              defaultValue="all"
              onChange={handleProjectChange}
              style={{ width: 120 }}
            >
              <Option value="all">Tất cả dự án</Option>
              {domains.map((domain) => (
                <Option key={domain} value={domain}>
                  {domain}
                </Option>
              ))}
            </Select>
            <Input.Search
              placeholder="Tìm kiếm theo đường dẫn"
              enterButton="Tìm kiếm"
              size="middle"
              onSearch={handleSearch}
              // onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" className="LSL_search-bar-Create"onClick={showCreateModal}>
              <a >Tạo mới</a>
            </Button>
            <Button type="primary" className="LSL_search-bar-Excel"onClick={handleExportExcel}>
              <a >Xuất Excel</a>
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          bordered
          rowClassName={(record) => (record.status === false ? 'row-disabled' : '')}
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng số: ${total}`, 
          }}
          onChange={handleTableChange}
          loading={loading}
          className="LSL_shortlink-table"
        />
      </Content>

      <UpdateModal
        loading={loading}
        visible={isModalOpen}
        onCancel={handleCancelUpdate}
        onUpdate={handleUpdate}
        record={selectedRecord}
      />
      <DeleteModal
        loading={loading}
        visible={deleteModal}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        record={recordToDelete}
      />
      <CreateModal
        loading={loading}
        visible={createModal}
        onCancel={handleCancelCreate}
        onCreate={handleCreate}
      />
    </Layout>
  );
};

export default ListShortLink;