import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import * as AuthenticationService from "../../services/AuthenticationService";
import "../ShortURL/style.css";

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = React.useRef(null);


    useEffect(() => {
        const storedAttempts = localStorage.getItem("login_attempts");
        if (storedAttempts) {
                const parsed = JSON.parse(storedAttempts);
                const now = Date.now();
                if (parsed.expiry && now < parsed.expiry) {
                    setAttempts(parsed.value);
                    if (parsed.value >= 3) {    
                    setShowCaptcha(true);
                    }   
                } else {
                    localStorage.removeItem("login_attempts");
                    setAttempts(0);
                    setShowCaptcha(false);
                }
        }
    }, []); 
    
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
            setAttempts(response.attempts);
            console.log('submit timessssss', attempts)
            if (response) {
                message.success(response.message);
                localStorage.setItem('token', response.token);
                localStorage.removeItem('login_attempts')
                navigate('/ShortUrl');
                setShowCaptcha(false);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            }
        } catch (error) {
            let err = "Đăng nhập thất bại!";
            setAttempts(error.response?.data?.attempts)
            console.log('submit', attempts)
            const expiryTime = Date.now() + 60 * 60 * 1000;
            localStorage.setItem("login_attempts", JSON.stringify({ value: error.response?.data?.attempts, expiry: expiryTime }));
            if (error.response?.data?.errorMessage) {
                err = error.response?.data?.errorMessage;
                if (error.response?.data?.requiresCaptcha) {
                    setShowCaptcha(true);
                    setCaptchaToken(null);
                    if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                    }
                }
            }
            console.log('ERR', error)
            message.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2 className="login-title">Đăng Nhập</h2>
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
                        label="Tên đăng nhập:"
                        name="UserName"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên tài khoản!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="Password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' }
                        ]}
                    >
                        <Input.Password autoComplete="current-password"/>
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
                        className="checkbox"
                    >
                        <Checkbox>Ghi nhớ tôi</Checkbox>
                        {/* <p>
                            Không có tài khoản?{' '}
                            <span className="register-link" onClick={handleNavigateRegister}>
                                Đăng ký
                            </span>
                        </p> */}
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