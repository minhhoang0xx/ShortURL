import { Layout, Table, Input, Button, Select, Space, Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import * as ShortURLService from '../services/ShortUrlService';
import UpdateModal from '../components/UpdateModal'; 

const { Header, Content, Footer } = Layout;
const { Option } = Select;
const ListShortLink = () =>{
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
    const columns = [
        {
          title: 'STT',
          dataIndex:'STT',
          key: 'STT',
          width: 40,
        },
        {
          title: 'Dự án',
          dataIndex: 'project',
          key: 'project',
          width: 60,
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
          render: (HyperLink) => <a>{HyperLink}</a>,
          width: 650
        },
        {
          title: 'Shortlink',
          dataIndex: 'shortlink',
          key: 'shortlink',
          ellipsis: true,
          width: 320,
          render: (HyperLink) => <a>{HyperLink}</a>,
        },
        {
          title: 'Ngày tạo',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : 'N/A',
          width: 90
        },
        {
          title: 'Người tạo',
          dataIndex: 'createdBy',
          key: 'createdBy',
          width: 80
        },
        {
          title: 'Chức Năng',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
                <a onClick={() => showModal(record)}>Update</a>
                <a onClick={() => handleDelete(record.id)}>Delete</a>
            </Space>
        ),
        },
      ];
    
      useEffect(() => {
        const fetchData = async () => {
            try {
                const urls = await ShortURLService.getAllLink();
                const urlfetch = urls.$values;
                console.log("Data từ API:", urls);
                setData(urlfetch.map(url => ({ ...url, key: url.id }))); 
            } catch (error) {
                console.error("Failed to fetch cars:", error);
            } 
        };
        fetchData(); // goi luon
    }, []); // chi chay 1 lan
      const handleDelete= () => {

      }

      const showModal = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
      };
    
      const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
      };
    
      const handleUpdate = (values) => {
        console.log('Updated values:', values, selectedRecord.id);
        
      };
    
      // const ok = Array.from({ length: 100 }, (_, index) => ({
      //   key: index + 1,
      //   STT: index +1 ,
      //   project: 'Staxi',
      //   alias: 'StaxiP1',
      //   originalUrl: 'https://www.figma.com/design/xcIvdw8COOA5v1ML1c09t1/Untitled?node-id=27-174&t=HtbY1rEikcUdFy9g-0',
      //   shortlink: 'https://bagg.vn/StaxiP1',
      //   createdAt: '14:23 12/02/2025',
      //   createdBy: 'uyendnt',
      // }));
return(
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
            <Select defaultValue="Chọn dự án" style={{ width: 150 }}>
            <Option value="BAExpress">BAExpress</Option>
              <Option value="staxi">Staxi</Option>
              
            </Select>
            <Input.Search
              placeholder="Tìm kiếm theo đường dẫn"
              enterButton="Tìm kiếm"
              size="middle"
              onSearch={(value) => console.log(value)}
              style={{ width: 300 }}
            />
            <Button type="primary"> <a onClick={() => navigate(`/`)}>Tạo mới</a></Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data}
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
        onCancel={handleCancel}
        onUpdate={handleUpdate}
        initialValues={selectedRecord}
      />
    </Layout>
)

}
export default ListShortLink