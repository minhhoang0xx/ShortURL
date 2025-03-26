import { Layout, Table, Input, Button, Select, Space, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import * as ShortUrlService from '../../services/ShortUrlService';
import * as DownloadService from '../../services/DownloadService';
import UpdateModal from '../../components/UpdateModal';
import DeleteModal from '../../components/DeleteModal';
import CreateModal from '../../components/CreateModal';
import { DeleteTwoTone, EditFilled } from '@ant-design/icons';
import "../../pages/ShortURL/style.css"
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
  //-------------------------COLUMN--------------------------------
  const columns = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 40,
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 100,
    },
    {
      title: 'Tên đường dẫn',
      dataIndex: 'alias',
      key: 'alias',
      width: 120,
    },
    {
      title: 'URL gốc',
      dataIndex: 'originalUrl',
      key: 'originalUrl',
      ellipsis: true,
      render: (HyperLink) => <a href={HyperLink} target="_blank" >{HyperLink}</a>,
      width: 560
    },
    {
      title: 'Shortlink',
      dataIndex: `shortLink`,
      key: 'shortLink',
      ellipsis: true,
      width: 280,
      render: (HyperLink) => <a href={HyperLink} target="_blank" >{HyperLink}</a>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date) => date ? dayjs(date).format('HH:mm DD/MM/YYYY') : 'N/A',
      width: 130
    },
    {
      title: 'Người chỉnh sửa',
      dataIndex: 'userName',
      key: 'userName',
      width: 130
    },
    {
      title: 'Chức Năng',
      key: 'action',
      width: 90,
      className: "action-column",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showModal(record)}><EditFilled /></a>
          <a onClick={() => showDeleteConfirm(record)}><DeleteTwoTone twoToneColor="#ed0505" /></a>
        </Space>
      ),
    },
  ];
  //---------------------------------------------------------------

  //-----------------DATA------------------------------------------
  const fetchData = async () => {
    setLoading(true)
    try {
      const urls = await ShortUrlService.getAllLink();
      const urlfetch = urls.$values;
      console.log("Data từ API:", urls);
      const formattedData = urlfetch.map((url, index) => ({ ...url, STT: index + 1 }));
      setData(formattedData);
      filterData(formattedData, selectedProject, searchText);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false)
  };

  const filterData = (sourceData, project, search) => {
    let result = [...sourceData];
    if (project && project !== 'all') {
      result = result.filter(item =>
        item.projectName && item.projectName.toLowerCase() === project.toLowerCase()
      )
    }
    if (search) {
      result = result.filter(item =>
        item.alias && item.alias.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFilteredData(result);
  };
  const fetchDomains = async () => {
    const response = await DomainService.getAll();
    setDomains(response.$values.map(domain => domain.name));
  }
  useEffect(() => { // cai nay de cho fetch chi chay 1 lan
    fetchData();
    fetchDomains();
  }, []);
  useEffect(() => { // loc lai data sau khi search hoac filter
    filterData(data, selectedProject, searchText);
  }, [selectedProject, searchText, data]);

  useEffect(() => {
    const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    if (!token) {
      navigate('/Login');
    }
  }, [navigate]);
  const showModal = (record) => {
    setSelectedRecord(record);
    setLoading(true)
    setIsModalOpen(true);
    setLoading(false)
  };
  //---------------------------------------------------------------

  //------------START UPDATE---------------------------------------
  const handleCancelUpdate = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleUpdate = () => {
    fetchData();
  }
  //-------------END UPDATE----------------------------------------

  //-------------START DELETE--------------------------------------
  const showDeleteConfirm = (record) => {
    setLoading(true)
    setRecordToDelete(record);
    setDeleteModal(true);
    setLoading(false)
  };
  const handleConfirmDelete = async () => {
    setLoading(true)
    try {
      await ShortUrlService.deleteShortLink(recordToDelete.id);
      setData(prevData => prevData.filter(link => link.id !== recordToDelete.id));
      message.success("Xóa thành công!");
      setDeleteModal(false);
      setRecordToDelete(null);
      fetchData()
    } catch (error) {
      console.error("Failed to delete link:", error);
      message.error("Xóa thất bại!");
    }
    setLoading(false)
  };
  const handleCancelDelete = () => {
    setDeleteModal(false);
    setRecordToDelete(null);
  };
  const handleProjectChange = (value) => {
    setSelectedProject(value);
  };
  //--------------------END DELETE----------------------------------
  //--------------------start Create--------------------------------
  const showCreateModal = () => {
    setLoading(true)
    setCreateModal(true);
    setLoading(false)
  }
  const handleCreate = () => {
    fetchData()
  }
  const handleCancelCreate = () => {
    setCreateModal(false);
  }
  //---------------------end Create---------------------------------

  //====SEARCH=====
  const handleSearch = (value) => {
    setSearchText(value);
  };
  //====EXPORT=====
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const blob = await DownloadService.download();
      console.log("excel", blob)
      const url = window.URL.createObjectURL(blob);// create tam mot duong`dan~
      const a = document.createElement("a"); // bat dau download
      a.href = url;
      a.download = `Excel.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Xuất Excel thất bại!");
    }
    setLoading(false);
  }

  return (
    <Layout>
      <Content className="LSL_main-container">
        <div className="LSL_search-bar">
          <Space>
            <Select defaultValue="all" onChange={handleProjectChange} style={{ width: 120 }}>
              <Option value="all">Tất cả dự án</Option>
              {domains.map((domain) => (
                <Option key={domain} value={domain}>{domain}</Option>
              ))}
            </Select>
            <Input.Search
              placeholder="Tìm kiếm theo đường dẫn"
              enterButton="Tìm kiếm"
              size="middle"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" className="LSL_search-bar-Create"> <a onClick={(showCreateModal)}>Tạo mới</a></Button>
            <Button type="primary" className="LSL_search-bar-Excel"> <a onClick={handleExportExcel}>Xuất Excel</a></Button>
            
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          bordered
          pagination={true}
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
  )

}
export default ListShortLink