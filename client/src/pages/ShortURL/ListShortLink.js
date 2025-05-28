import { Layout, Table, Input, Button, Select, Space, message, Spin, QRCode, DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as ShortUrlService from '../../services/ShortUrlService';
import * as DownloadService from '../../services/DownloadService';
import UpdateModal from '../../components/UpdateModal';
import DeleteModal from '../../components/DeleteModal';
import CreateModal from '../../components/CreateModal';
import { CopyFilled, CopyOutlined, CopyTwoTone, DeleteTwoTone, EditFilled, EditTwoTone, PlusOutlined, PlusSquareFilled, PlusSquareOutlined } from '@ant-design/icons';
import '../../pages/ShortURL/style.css';
import * as DomainService from '../../services/DomainService';
import { jwtDecode } from 'jwt-decode';
const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker
const dateFormat = 'DD/MM/YYYY';

const ListShortLink = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [domains, setDomains] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [users, setUsers] = useState([]);
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
          className={record.status === false ? 'shortlink-disabled' : ''}
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
      render: (date, record) => (
        <span className={record.checkOS ? 'highlight-date' : ''}>
          {date ? dayjs(date).format('HH:mm DD/MM/YYYY') : 'null'}
        </span>
      ),
      width: '12%',
      sorter: (a, b) => dayjs(a.createAt).unix() - dayjs(b.createAt).unix(),
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
      onCell: (record) => {
        if (record.status === true && record.checkOS) {
          return { className: 'cell-highlight' };
        }
        return {};
      },
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
      title: 'Chọn',
      key: 'action',
      width: '8.2%',
      className: 'action-column',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => copyToClipboard(record)}>
            <CopyTwoTone twoToneColor="#818582" />
          </a>
          <a onClick={() => showModal(record)}>
            <EditTwoTone twoToneColor="#2d6ed6" />
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
      const urlfetch = urls.$values || urls;
      console.log('Data từ API:', urls);
      const formattedData = urlfetch.map((url) => ({ ...url, key: url.id }));
      setData(formattedData);
      setFilteredData(formattedData);
      setPagination((prev) => ({ ...prev, total: formattedData.length }));
      // filterData(formattedData, selectedProject, searchText);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Lấy dữ liệu thất bại!');
    } finally {
      setLoading(false);
    }
  };
  const fetchDomains = async () => {
    try {
      const response = await DomainService.getAll();
      setDomains(response.$values.map((domain) => domain.name) || [])
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      message.error('Lấy danh sách dự án thất bại!');
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await ShortUrlService.getAllLink();
      const user = response.$values
      const uniqueUsers = [
        ...new Set(
          user
            .map((url) => url.createdByUser)
            .filter((user) => user && user !== 'unknown')
        ),
      ];
      setUsers(uniqueUsers);
      console.log('user fetch', uniqueUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Lấy danh sách người dùng thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const filterData = (sourceData) => {
    let result = [...sourceData];
    if (selectedProject && selectedProject !== 'all') {
      result = result.filter(
        (item) =>
          item.projectName &&
          item.projectName.toLowerCase() === selectedProject.toLowerCase()
      );
    }
    if (selectedStatus && selectedStatus !== 'all') {
      result = result.filter(
        (item) => item.status === (selectedStatus === 'active'? true: false)
      );
    }
    if (selectedUser && selectedUser !== 'all') {
      result = result.filter(
        (item) =>
          item.createdByUser &&
          item.createdByUser.toLowerCase() === selectedUser.toLowerCase()
      );
    }

  if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    const start = dayjs(dateRange[0]).startOf('day');
    const end = dayjs(dateRange[1]).endOf('day');
    result = result.filter(
      (item) =>
        item.createAt &&
        dayjs(item.createAt).isValid() &&
        dayjs(item.createAt).isAfter(start) &&
        dayjs(item.createAt).isBefore(end)
    );
  }
    if (searchText) {
      result = result.filter(
        (item) =>
          item.alias && item.alias.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredData(result);
    setPagination((prev) => ({ ...prev, current: 1, total: result.length }));
    if (result.length === 0) {
      message.warning('Không tìm thấy kết quả!');
    }
  };


  useEffect(() => {
    fetchData();
    fetchDomains();
    fetchUsers();

  }, []);

  useEffect(() => {
    const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    if (!token) {
      navigate('/Login');
    }
  }, [navigate]);

  const handleSearch = () => {
    filterData(data);
  };

  const showModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCancelUpdate = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleUpdate = () => {
    fetchData();
  };

  const showDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await ShortUrlService.deleteShortLink(recordToDelete.id);
      setData((prevData) => prevData.filter((link) => link.id !== recordToDelete.id));
      setFilteredData((prevData) => prevData.filter((link) => link.id !== recordToDelete.id));
      message.success('Xóa thành công!');
      setDeleteModal(false);
      setRecordToDelete(null);
      fetchData();
    } catch (error) {
      const err = error.response?.data?.errorMessage || 'Xóa thất bại!';
      message.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal(false);
    setRecordToDelete(null);
  };



  const showCreateModal = () => {
    setCreateModal(true);
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
  const handleReset = () => {
    setSelectedProject('all');
    setSelectedStatus('all');
    setSelectedUser('all');
    setDateRange([null, null]);
    setSearchText('');
    setFilteredData(data);
    setPagination((prev) => ({ ...prev, current: 1, total: data.length }));
  };
  return (
    <Layout>
      <Content className="LSL_main-container">
        <div className="LSL_search-bar">
          <Space>
          {/* <Button type="primary" className="LSL_search-bar-Excel" onClick={handleReset}>
              <a >Làm mới</a>
            </Button> */}
            <RangePicker
              className='LSL_search-bar-time'
              format={dateFormat}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              placeholder={['Từ ngày', 'Đến ngày']} 
            />
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              className='LSL_search-bar-domain'
            >
              <Option value="all">Dự án</Option>
              {domains.map((domain) => (
                <Option key={domain} value={domain}>
                  {domain}
                </Option>
              ))}
            </Select>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className='LSL_search-bar-status'
            >
              <Option value="all">Trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="expired">Quá Hạn</Option>
            </Select>
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              className="LSL_search-bar-user"
            >
              <Option value="all">Người cập nhật</Option>
              {users.map((user) => (
                <Option key={user} value={user}>
                  {user}
                </Option>
              ))}
            </Select>

            <Input
              placeholder="Tìm kiếm theo đường dẫn"
              value={searchText}
              size="middle"
              className='LSL_search-bar-input'
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button type="primary" className="LSL_search-bar-Search" onClick={handleSearch} >
              <a >Tìm kiếm</a>
            </Button>
            <Button type="primary" className="LSL_search-bar-Create" onClick={showCreateModal}>
              <a >Tạo mới</a>

            </Button>
            <Button type="primary" className="LSL_search-bar-Excel" onClick={handleExportExcel}>
              <a >Xuất Excel</a>
            </Button>
           
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          bordered
          rowClassName={(record) => 
            record.status === false ? 'row-disabled' : record.checkOS === true ? 'row-highlight' : ''
          }
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