import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import * as AuthenticationService from "../../services/AuthenticationService";

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = React.useRef(null);

    const handleNavigateRegister = () => {
        navigate('/Register');
    };
    const handleNavigateHome = () => {
        navigate('/');
    };

    const onFinish = async (data) => {
        if (showCaptcha && !captchaToken) {
            message.error("Please complete the CAPTCHA!");
            return;
        }
        setLoading(true);
        const loginData = {
            UserName: data.UserName,
            Password: data.Password,
            RecaptchaToken: captchaToken,
        };
        try {
            console.log("dataLogin", loginData);
            const response = await AuthenticationService.Login(loginData);
            if (response.message === "Login successfully!") {
                message.success(response.message);
                navigate('/ShortUrl');
                setAttempts(0);
                setShowCaptcha(false);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            }else{
                message.error(response.message);
            }   
        } catch (error) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 3) {
                setShowCaptcha(true);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            }
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('An error occurred. Please try again later.');
            }
            console.error('Error during login:', error);
        }
        setLoading(false);
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
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    style={{ maxWidth: '70%', width: '70%' }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    autoComplete="off"
                >
                    <Form.Item
                        label="UserName"
                        name="UserName"
                        rules={[
                            { required: true, message: 'Please input your Username!' },
                            { min: 6, message: 'Username must be at least 6 characters!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="Password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    {showCaptcha && (
                        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.REACT_APP_CAPTCHA_KEY}
                                onChange={(token) => setCaptchaToken(token)}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="remember"
                        valuePropName="checked"
                        wrapperCol={{ offset: 5, span: 19 }}
                    >
                        <Checkbox>Remember me</Checkbox>
                        <p>
                            Don't have an account?{' '}
                            <span className="register-link" onClick={handleNavigateRegister}>
                                Register
                            </span>
                        </p>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="submit-button"
                            loading={loading} // Hiển thị loading trên nút
                        >
                            Submit
                        </Button>
                        <Button
                            color="default"
                            variant="filled"
                            className="back-button"
                            onClick={handleNavigateHome}
                        >
                            Home
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;