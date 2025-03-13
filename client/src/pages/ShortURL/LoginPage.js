import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate()
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)
    const handleNavigateRegister = () => {
        navigate('/Register');
    }
    const handleNavigateHome = () => {
        navigate('/');
    }

    const onFinish = async (data) => {
        setLoading(true)
        try {

        } catch (error) {
            // check server co tra ve loi khong
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
                <h2 className="login-title">LOGIN</h2>
                <Form
                    name="SignIn"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: '70%', width: '70%' }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    loading = {loading}
                    autoComplete="off"
                >
                    <Form.Item
                        label="UserName"
                        name="UserName"
                        rules={[{ required: true, message: 'Please input your Username!' },
                            { min: 6, message: 'Username must be at least 6 characters!' }
                        ]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="Password"
                        rules={[{ required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item
                        name="remember"
                        valuePropName="checked"
                        wrapperCol={{ offset: 4, span: 20 }}
                    >
                        <Checkbox>Remember me</Checkbox>
                        <p >
                            Don't have an account? <span className="register-link" onClick={handleNavigateRegister}>Register</span>
                        </p>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                        <Button type="primary" htmlType="submit" className="submit-button">
                            Submit
                        </Button>
                        <Button color="default" variant="filled" className="back-button" onClick={handleNavigateHome}>
                            Home
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};
export default LoginPage;