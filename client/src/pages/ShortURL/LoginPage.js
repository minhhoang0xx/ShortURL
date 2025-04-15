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
            } else {
                message.error(response.message);
            }
        } catch (error) {
            let err = "Đăng nhập thất bại!";
            if (error.response?.data.requiresCaptcha) {
                setShowCaptcha(true);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            }
            if (error.response?.data.errorMessage) {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= 3) {
                    setShowCaptcha(true);
                    setCaptchaToken(null);
                    if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                    }
                }
                err = error.response?.data.errorMessage
                message.error(err);
            }else {
                message.error('Đã có lỗi xảy ra, vui lòng thử lại.');
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
                            { required: true, message: 'Vui lòng nhập tên tài khoản!' },
                            { min: 6, message: 'Tên tài khoản phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="Password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
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
                        <Checkbox>Ghi nhớ tôi</Checkbox>
                        <p>
                            Không có tài khoản?{' '}
                            <span className="register-link" onClick={handleNavigateRegister}>
                                Đăng ký
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
                            Đăng nhập
                        </Button>
                        <Button
                            color="default"
                            variant="filled"
                            className="back-button"
                            onClick={handleNavigateHome}
                        >
                            Trang chủ
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;