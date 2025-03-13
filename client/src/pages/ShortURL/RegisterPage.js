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
                    <Form.Item label="UserName" name="UserName" rules={[{ required: true, message: 'Please input UserName!' },
                        { min: 6, message: 'UserName must be at least 6 characters!' }
                    ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                }
                            })
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="FullName" name="FullName" rules={[{ required: true, message: 'Please input UserName!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="PhoneNumber"
                        rules={[{ pattern: /^[0-9]{10}$/, message: 'Phone number is incorrect!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="Email"
                        rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button type="primary" htmlType="submit" className="submit-button">
                            Submit
                        </Button>
                        <Button color="default" variant="filled" className="back-button" onClick={handleNavigateLogin}>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}
export default RegisterPage;
