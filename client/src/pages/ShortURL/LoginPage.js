import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import * as AuthenticationService from "../../services/AuthenticationService";
import "../ShortURL/style.css";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

const LoginPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [rememberedUsers, setRememberedUsers] = useState([]);
    const recaptchaRef = React.useRef(null);

    useEffect(() => {
        // Kiểm tra số lần thử đăng nhập
        try {
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
        } catch (error) {
            console.error("Error parsing login_attempts:", error);
            localStorage.removeItem("login_attempts");
        }

        // Lấy danh sách tài khoản đã ghi nhớ
        try {
            const storedUsers = localStorage.getItem("rememberedUsers");
            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                if (Array.isArray(parsedUsers)) {
                    setRememberedUsers(parsedUsers);
                    if (parsedUsers.length > 0) {
                        form.setFieldsValue({
                            UserName: parsedUsers[0].UserName,
                            Password: parsedUsers[0].Password,
                            remember: true,
                        });
                    }
                } else {
                    localStorage.removeItem("rememberedUsers");
                }
            }
        } catch (error) {
            console.error("Error parsing rememberedUsers:", error);
            localStorage.removeItem("rememberedUsers");
        }
    }, [form]);

    const handleNavigateRegister = () => {
        navigate("/Register");
    };

    const handleNavigateHome = () => {
        navigate("/");
    };

    const handleUserNameChange = (e) => {
        const userName = e.target.value;
        const user = rememberedUsers.find((u) => u.UserName === userName);
        if (user) {
            form.setFieldsValue({
                Password: user.Password,
                remember: true,
            });
        } else {
            form.setFieldsValue({
                remember: false,
            });
        }
    };

    const onFinish = async (data) => {
        setLoading(true);
        const loginData = {
            UserName: data.UserName,
            Password: data.Password,
            RecaptchaToken: captchaToken,
        };
        try {
            const response = await AuthenticationService.Login(loginData);
            setAttempts(response.attempts);
            if (response) {
                message.success(response.message);
                localStorage.setItem("token", response.token);
                localStorage.removeItem("login_attempts");

                if (data.remember) {
                    const newUser = { UserName: data.UserName, Password: data.Password };
                    const updatedUsers = rememberedUsers.filter(
                        (u) => u.UserName !== data.UserName
                    );
                    updatedUsers.unshift(newUser);
                    setRememberedUsers(updatedUsers);
                    localStorage.setItem("rememberedUsers", JSON.stringify(updatedUsers));
                } else {
                    const updatedUsers = rememberedUsers.filter(
                        (u) => u.UserName !== data.UserName
                    );
                    setRememberedUsers(updatedUsers);
                    localStorage.setItem("rememberedUsers", JSON.stringify(updatedUsers));
                }

                navigate("/ShortUrl");
                setShowCaptcha(false);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            }
        } catch (error) {
            let err = "Đăng nhập thất bại!";
            setAttempts(error.response?.data?.attempts || 0);

            const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem(
                "login_attempts",
                JSON.stringify({ value: error.response?.data?.attempts || 0, expiry: expiryTime })
            );
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
            message.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };
    return (
        <div className="login-page-container">
            <div className="login-form-container">
                <div className="login-form-container-logo">
                    <img src="/logo.png" alt="Logo BA GPS" />
                </div>
                <h2 className="login-title">Đăng nhập hệ thống</h2>
                <Form
                    name="SignIn"
                    initialValues={{ remember: false }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    autoComplete="off"
                    className="login-form"
                    onPressEnter={onFinish}
                >
                    <div className="form-label">Tài khoản</div>
                    <Form.Item
                        name="UserName"
                        rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}
                    >
                        <Input
                            placeholder="Nhập tên đăng nhập"
                            prefix={<UserOutlined />}
                            onChange={handleUserNameChange}
                        />
                    </Form.Item>

                    <div className="form-label">Mật khẩu</div>
                    <Form.Item
                        name="Password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu"
                            prefix={<LockOutlined />}
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    {showCaptcha && (
                        <Form.Item>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.REACT_APP_CAPTCHA_KEY}
                                onChange={(token) => setCaptchaToken(token)}
                            />
                        </Form.Item>
                    )}

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ghi nhớ tôi</Checkbox>
                    </Form.Item>

                    <Form.Item className="submit">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="submit-button"
                            loading={loading}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <div className="login-background"></div>
        </div>
    );
};

export default LoginPage;