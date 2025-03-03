import { Layout, Table, Input, Button, Select, Space, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import * as ShortURLService from '../services/ShortUrlService';
import UpdateModal from '../components/UpdateModal';
import DeleteModal from '../components/DeleteModal';

const { Header, Content, Footer } = Layout;
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
      width: 600
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
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 90
    },
    {
      title: 'Chức Năng',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showModal(record)}>Update</a>
          <a onClick={() => showDeleteConfirm(record)}>Delete</a>
        </Space>
      ),
    },
  ];
  //---------------------------------------------------------------

  //-----------------DATA------------------------------------------
  const fetchData = async () => {
    try {
      const urls = await ShortURLService.getAllLink();
      const urlfetch = urls.$values;
      console.log("Data từ API:", urls);
      const formattedData = urlfetch.map((url, index) => ({ ...url, key: url.id, STT: index + 1 }));
      setData(formattedData);
      filterData(formattedData, selectedProject, searchText);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    }
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
  useEffect(() => { // cai nay de cho fetch chi chay 1 lan
    fetchData();
  }, []);
  useEffect(() => { // loc lai data sau khi search hoac filter
    filterData(data, selectedProject, searchText);
  }, [selectedProject, searchText, data]);

  const showModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };
  //---------------------------------------------------------------

  //------------START UPDATE---------------------------------------
  const handleCancelUpdate = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleUpdate = async (id, data) => {
    console.log('data123', data)
    try {
      if (data.domain == "https://staxi.vn") {
        data.projectName = "STaxi";
      }
      if (data.domain == "https://baexpress.io") {
        data.projectName = "BAExpress";
      }
      const updated = {
        ...data,
      };
      console.log('updated', updated);
      await ShortURLService.updateShortLink(id, updated);
      message.success("Success", 2);
      fetchData();
    } catch (error) {
      message.error("FailFail");
    };
  }
  //-------------END UPDATE----------------------------------------

  //-------------START DELETE--------------------------------------
  const showDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await ShortURLService.deleteShortLink(recordToDelete.id);
      setData(prevData => prevData.filter(link => link.id !== recordToDelete.id));
      message.success("Xóa thành công!");
      setDeleteModal(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Failed to delete link:", error);
      message.error("Xóa thất bại!");
    }
  };
  const handleCancelDelete = () => {
    setDeleteModal(false);
    setRecordToDelete(null);
  };
  const handleProjectChange = (value) => {
    setSelectedProject(value);
  };
  //--------------------END DELETE----------------------------------
  //====SEARCH=====
  const handleSearch = (value) => {
    setSearchText(value);
  };
  //====EXPORT=====
  const handleExportExcel = async () => {
    try {
      const response = await ShortURLService.download();
      if (!response.ok) {
        throw new Error("Failed to export Excel");
      }
      const blob = await response.blob(); // chuyển dữ liệu về blob
      const url = window.URL.createObjectURL(blob);// create tam mot duong`dan~
      const a = document.createElement("a"); // bat dau download
      a.href = url;
      a.download = "ShortUrls.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove(); // xoa sau khi tai xong 
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Xuất Excel thất bại!");
    }
  }
  return (
    <Layout>
      <Header className="header">
        <div className="header-content">
          <img src="logo.png" alt="Logo BA GPS" className="logo" />

          <span>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</span>
        </div>
      </Header>

      <Content className="LSL_main-container">
        <div className="LSL_search-bar">
          <Space>
            <Select defaultValue="all" onChange={handleProjectChange} style={{ width: 120 }}>
              <Option value="all">Tất cả dự án</Option>
              <Option value="BAExpress">BAExpress</Option>
              <Option value="staxi">Staxi</Option>
            </Select>
            <Input.Search
              placeholder="Tìm kiếm theo đường dẫn"
              enterButton="Tìm kiếm"
              size="middle"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary"> <a onClick={() => navigate(`/`)}>Tạo mới</a></Button>
            <Button type="primary" className="LSL_search-bar-Excel"> <a onClick={handleExportExcel}>Xuất Excel</a></Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          bordered
          pagination={true}
          className="LSL_shortlink-table"
        />
      </Content>

      <Footer className="footer">
        <div className="footer-content">
          <span>14 Nguyễn Cảnh Dị, Định Công, Hoàng Mai, Hà Nội</span>
          <span>📞 0983 535 666</span>
          <a href="https://admin.baexpress.io" target="_blank">https://admin.baexpress.io</a>
        </div>
      </Footer>
      <UpdateModal
        visible={isModalOpen}
        onCancel={handleCancelUpdate}
        onUpdate={handleUpdate}
        initialValues={selectedRecord}
      />
      <DeleteModal
        visible={deleteModal}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        record={recordToDelete}
      />
    </Layout>
  )

}
export default ListShortLink