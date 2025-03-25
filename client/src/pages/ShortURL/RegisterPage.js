import { Button, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RegisterPage = () => {

    const location = useLocation();
    const navigate = useNavigate()
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)
    const handleNavigateLogin = () => {
        navigate('/Login');
    }


    const onFinish = async (data) => {
        setLoading(true)
        try {

        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message || 'An error occurred. Please try again later.');
            } else {
                message.error('An error occurred. Please try again later 2.');
            }
            console.error('Error during login:', error);
        }
        setLoading(false)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div className="login-container">
            <div className="login-form">
                <h2 className="login-title">REGISTER</h2>
                <Form
                    name="SignIn"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    style={{ maxWidth: '80%', width: '80%' }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    loading = {loading}
                    autoComplete="off"
                >
                    <Form.Item label="UserName" name="UserName" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' },
                        { min: 6, message: 'Tên tài khoản phải có ít nhất 6 ký tự!' }
                    ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                }
                            })
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="FullName" name="FullName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="PhoneNumber"
                        rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="Email"
                        rules={[{ type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button type="primary" htmlType="submit" className="submit-button">
                            Đăng ký
                        </Button>
                        <Button color="default" variant="filled" className="back-button" onClick={handleNavigateLogin}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}
export default RegisterPage;
