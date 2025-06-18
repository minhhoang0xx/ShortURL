import { Layout, Table, Input, Button, Select, Space, message, DatePicker, Checkbox, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as ShortUrlService from '../../services/ShortUrlService';
import * as DownloadService from '../../services/DownloadService';
import UpdateModal from '../../components/UpdateModal';
import DeleteModal from '../../components/DeleteModal';
import CreateModal from '../../components/CreateModal';
import { CopyTwoTone, DeleteTwoTone, EditTwoTone} from '@ant-design/icons';
import '../../pages/ShortURL/style.css';
import * as DomainService from '../../services/DomainService';
import { jwtDecode } from 'jwt-decode';
import DeleteManyModal from '../../components/DeleteManyModal';
import LogModal from '../../components/LogModal';
import ScrollContainer from 'react-indiana-drag-scroll';
const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker
const dateFormat = 'DD/MM/YYYY';

const ListShortLink = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [showDeleteManyModal, setShowDeleteManyModal] = useState(false);
  const [logModal, setLogModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [domains, setDomains] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const handleTagClick = (tag) => {
    setSearchText(tag);
    filterData(data, tag); 
    setLogModal(false); 
    setSelectedRecord(null); 
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedRows.length === filteredData.length && filteredData.length > 0}
          onChange={(e) => handleCheckAll(e.target.checked)}
        />
      ),
      key: 'checkbox',
      width: '3%',
      className: 'checkbox-column',
      render: (_, record) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => handleRowCheckboxChange(e, record.key)}
        />
      ),
    },
    {
      title: 'STT',
      key: 'STT',
      className: 'STT-column',
      width: '3%',
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
      width: '7%',
    },
    {
      title: 'Tên đường dẫn',
      dataIndex: 'alias',
      key: 'alias',
      width: '12%',
      sorter: (a, b) => a.alias.localeCompare(b.alias),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
      onCell: (record) => {
        if ( record.checkOS) {
          return { className: 'cell-highlight' };
        }
        return {};  
      },
    },
    {
      title: 'Tag',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: tags => (
        <ScrollContainer
          className="scroll-container"
          horizontal
          vertical={false}
          style={{ maxWidth: 140, whiteSpace: 'nowrap' }}
        >
          {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </ScrollContainer>
      )
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
      width: '20%',
    },
    {
      title: 'URL rút gọn',

      dataIndex: 'shortLink',
      key: 'shortLink',
      ellipsis: true,
      width: '20%',
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
      width: '10%',
      sorter: (a, b) => dayjs(a.createAt).unix() - dayjs(b.createAt).unix(),
      sortDirections: ['ascend', 'descend'],
      onCell: (record) => {
        if ( record.checkOS) {
          return { className: 'cell-highlight' };
        }
        return {};
      },
    },
    {
      title: 'Thời Hạn',
      dataIndex: 'expiry',
      key: 'expiry',
      className: 'action-column',
      showSorterTooltip: false,
      render: (date) => (date ? dayjs(date).format(' DD/MM/YYYY') : 'Vô thời hạn'),
      width: '8%',
      sorter: (a, b) => {
        if (!a.expiry && !b.expiry) return 0;
        if (!a.expiry) return 1;
        if (!b.expiry) return -1;
        return dayjs(a.expiry).unix() - dayjs(b.expiry).unix();
      },
      sortDirections: ['ascend', 'descend'],
      onCell: (record) => {
        if ( record.checkOS) {
          return { className: 'cell-highlight' };
        }
        return {};
      },
    },
    ...(currentUser === 'ADMIN'
      ? [
        {
          title: 'Người cập nhật',
          dataIndex: 'createdByUser',
          key: 'createdByUser',
          width: '12%',
          sorter: (a, b) => a.createdByUser.localeCompare(b.createdByUser),
          sortDirections: ['ascend', 'descend'],
          showSorterTooltip: false,
          onCell: (record) => {
            if ( record.checkOS) {
              return { className: 'cell-highlight' };
            }
            return {};
          },
        },
      ]
      : []),
    {
      title: 'Truy cập',
      dataIndex: 'clickCount',
      className: 'action-column',
      showSorterTooltip: false,
      key: 'clickCount',
      width: '7%',
      render: (clickCount) => (clickCount || 0),
      sorter: (a, b) => (a.clickCount || 0) - (b.clickCount || 0),
      sortDirections: ['ascend', 'descend'],
      onCell: (record) => ({
        onClick: () => showLogModal(record),
        style: { cursor: 'pointer', fontStyle: 'underline', color: '#1890ff' },
        className:  record.checkOS ? 'cell-highlight' : '',
      }),
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
      onCell: (record) => {
        if ( record.checkOS) {
          return { className: 'cell-highlight' };
        }
        return {};
      },
    },

    {
      title: 'Chọn',
      key: 'action',
      width: '7%',
      className: 'action-column',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => copyToClipboard(record)}>
            <CopyTwoTone twoToneColor="#818582" />
          </a>
          <a onClick={() => showModalUpdate(record)}>
            <EditTwoTone twoToneColor="#2d6ed6" />
          </a>
          <a onClick={() => showDeleteConfirm(record)}>
            <DeleteTwoTone twoToneColor="#ed0505" />
          </a>

        </Space>
      ),
    },
  ];
  const handleCheckAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredData.map((record) => record.key));
    } else {
      setSelectedRows([]);
    }
  };
  const handleRowCheckboxChange = (e, key) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [...prev, key]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== key));
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
      if (!token) {
        message.error('Không tìm thấy token, vui lòng đăng nhập lại!');
        navigate('/Login');
        return;
      }
      const decodedToken = jwtDecode(token);
      const user = decodedToken["unique_name"];
      setCurrentUser(user)
      let urls;
      if (user === "ADMIN") {
        urls = await ShortUrlService.getAllLink({
          page: pagination.current,
          pageSize: pagination.pageSize,
        });

        if (!urls) {
          message.warning(urls.data?.errorMessage);
          return;
        }
        const userList = urls.$values || urls;
        const uniqueUsers = [
          ...new Set(
            userList
              .map((url) => url.createdByUser)
              .filter((user) => user && user !== 'unknown')
          ),
        ];
        setUsers(uniqueUsers);
      } else {
        urls = await ShortUrlService.getAllByUser(user, {
          page: pagination.current,
          pageSize: pagination.pageSize,
        });
        if (!urls) {
          message.warning(urls.data?.errorMessage);
          return;
        }
      }
      const urlfetch = urls.$values || urls;
      const formattedData = urlfetch.map((url) => ({ ...url, key: url.id }));
      setData(formattedData);
      setFilteredData(formattedData);
      setPagination((prev) => ({ ...prev, total: formattedData.length }));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error(error.response?.data?.errorMessage || 'Lấy dữ liệu thất bại!');
    } finally {
      setLoading(false);
    }
  };
  const fetchDomains = async () => {
    try {
      const response = await DomainService.getAll();
      setDomains(response.map((domain) => domain.name) || [])
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      message.error('Lấy danh sách dự án thất bại!');
    } finally {
      setLoading(false);
    }
  };
  const filterData = (sourceData, tagOverride = null) => {
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
        (item) => item.status === (selectedStatus === 'active' ? true : false)
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
    const searchValue = tagOverride || searchText;
    if (searchValue && searchValue.trim()) {
      const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => term);
      result = result.filter(
        (item) =>
          Array.isArray(item.tags) &&
          searchTerms.every(term =>
            item.tags.some(tag => 
              tag && 
              tag.toLowerCase().includes(term)
            )
          )
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
  const showModalUpdate = (record) => {
    setSelectedRecord(record);
    setUpdateModal(true);
  };
  const handleCancelUpdate = () => {
    setUpdateModal(false);
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
      setSelectedRows((prev) => prev.filter((id) => id !== recordToDelete.id));
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
  const showDeleteManyConfirm = () => {
    setShowDeleteManyModal(true);
  };
  const cancelShowDeleteMany = () => {
    setShowDeleteManyModal(false);
  };
  const handleDeleteMany = async () => {
    if (selectedRows.length === 0) {
      message.warning('Vui lòng chọn ít nhất một mục để xóa!');
      return;
    }
    setLoading(true);
    try {
      const response = await ShortUrlService.deleteManyShortLinks(selectedRows);
      setData((prevData) => prevData.filter((link) => !selectedRows.includes(link.key)));
      setFilteredData((prevData) => prevData.filter((link) => !selectedRows.includes(link.key)));
      setSelectedRows([]);
      setShowDeleteManyModal(false);
      message.success('Xóa các URL thành công!');
    } catch (error) {
      message.error('Xóa các URL thất bại!');
      await fetchData();
    } finally {
      setLoading(false);
    }
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
  const showLogModal = (record) => {
    setSelectedRecord(record);
    setLogModal(true);
  };
  const handleCancelLog = () => {
    setLogModal(false);
    setSelectedRecord(null);
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
    setSelectedRows([]);
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
            {currentUser === 'ADMIN' && (
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
            )}

            <Input
              placeholder="Tìm kiếm theo Tag"
              value={searchText}
              size="middle"
              className='LSL_search-bar-input'
              onPressEnter={handleSearch}
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
            {selectedRows.length !== 0 && (<Button type="primary" onClick={showDeleteManyConfirm}>Xóa dữ liệu</Button>)}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          bordered
          rowClassName={(record) =>
            // record.status === false ? 'row-disabled' : record.checkOS === true ? 'row-highlight' : ''
            record.checkOS === true ? 'row-highlight' : ''
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
        visible={updateModal}
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
      <DeleteManyModal
        visible={showDeleteManyModal}
        onConfirm={handleDeleteMany}
        onCancel={cancelShowDeleteMany}
        count={selectedRows.length}
        loading={loading}
      />
      <LogModal
        loading={loading}
        visible={logModal}
        onCancel={handleCancelLog}
        record={selectedRecord}
        onTagClick={handleTagClick}
      />
    </Layout>
  );
};

export default ListShortLink;