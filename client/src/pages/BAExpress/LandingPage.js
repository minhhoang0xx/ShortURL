import React, { useState, useRef, useEffect } from "react";
import "../BAExpress/styleBAE.css";
import ReCAPTCHA from "react-google-recaptcha";
import * as FormRequestService from "../../services/FormRequestService";
import { message } from "antd";

const LandingPageBAExpress = () => {
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem("attempts") || "0"));
    const [showCaptcha, setShowCaptcha] = useState(() => parseInt(localStorage.getItem("attempts") || "0") >= 3);
    const recaptchaRef = useRef(null);

    useEffect(() => {
        console.log('submit times', attempts)
        localStorage.setItem("attempts", attempts.toString());
        if (attempts >= 3) {
            setShowCaptcha(true);
        }
    }, [attempts]);

    const [formData, setFormData] = useState({
        projectName: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('submit', captchaToken)
        const dataToSubmit = {
            ...formData,
            projectName: "BAExpress",
            RecaptchaToken: captchaToken,
        };
        setLoading(true);
        try {
            console.log("data", dataToSubmit);
            const response = await FormRequestService.saveRequestBAE(dataToSubmit);
            console.log("Response:", response);

            if (response && response.message) {
                message.success(response.message);
                setFormData({
                    projectName: "",
                    fullName: "",
                    email: "",
                    phoneNumber: "",
                    message: "",
                });
                setAttempts(response.attempts);
                console.log('sumbit times', attempts)
                // setShowCaptcha(false);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            } 
        } catch (error) {
            let err = "Gửi form thất bại.";
            if (error.response?.data?.errorMessage) {
              err = error.response.data.errorMessage;
            } 
            if (error.response?.data?.requiresCaptcha) {
              setShowCaptcha(true);
              setCaptchaToken(null);
              if (recaptchaRef.current) {
                recaptchaRef.current.reset();
              }
            }
            message.error(err);
          } finally {
            setLoading(false);
          }
    };
    return (
        <div className="LandingPageBAExpress">
            {/* start header */}
            <header className="headerBAE">
                <div className="header_container">
                    <div className="header_logo">
                        <img className="header_logo-img" src="/LandingPageBAExpress/logoHeader.png" alt="Logo" height="40" />
                    </div>
                    <input type="checkbox" id="menu-toggle" />
                    <label htmlFor="menu-toggle" className="header_menu-icon">
                        <span className="header_menu-icon-line"></span>
                    </label>
                    <nav className="header_nav">
                        <ul className="header_nav-list">
                            <li><a href="#3">Lý do lựa chọn</a></li>
                            <li><a href="#4">Giải pháp toàn diện</a></li>
                            <li><a href="#5">Tính năng ưu việt</a></li>
                            <li><a href="#6">Đặt hàng ngay</a></li>
                            <li><a href="/ShortURL">ShortUrl</a></li>
                        </ul>
                    </nav>
                    <div className="header_contact">
                        <a href="tel:19006451" className="header_contact_tel" >
                            <img src="/LandingPageBAExpress/call.svg" alt="Phone Icon" className="header_contact-icon" />
                            <span>1900 6464</span>
                        </a>
                    </div>
                </div>
            </header>
            {/* end header */}

            {/* start main */}
            <main className="main">
                <section className="section-1">
                    <div className="section-1_container">
                        <p>Giải pháp thông minh - Hành trình tin cậy</p>
                        <h2>BAExpress</h2>
                        <h3>GIẢI PHÁP ĐIỀU HÀNH VẬN TẢI</h3>
                        <div className="section-1_container-detail">
                            <span>BAExpress là giải pháp điều hành nghiệp vụ giao hàng chuyên nghiệp được BA GPS phát triển độc quyền, giúp hoàn thiện quy trình quản lý trong khâu vận hành giao hàng của mỗi doanh nghiệp.</span>
                        </div>
                        <div className="section-1_container-button">
                            <button type="button" className="btn btn-outline-secondary">TÌM HIỂU NGAY</button>
                        </div>
                    </div>
                </section>
                <section className="section-2">
                    <h2><span className="green">TIẾT KIỆM</span> <span className="blue">CHI PHÍ</span> <br /> <span className="green">NÂNG
                        CAO</span> <span className="blue">CHẤT LƯỢNG DỊCH VỤ</span></h2>
                    <div className="divider-span"></div>
                    <div className="section-2_container">
                        <div className="section-2_container-card">
                            <img src="/LandingPageBAExpress/section2.1.png" alt="Stopwatch" />
                            <div className="section-2_container-card-content">
                                <h2>300%</h2>
                                <div className="section-2_container-card-content-divider"></div>
                                <p>Tăng hiệu quả thời gian điều phối xe gấp 3 lần so với cách điều thủ công</p>
                            </div>
                        </div>
                        <div className="section-2_container-card">
                            <img src="/LandingPageBAExpress/section2.2.png" alt="Money" />
                            <div className="section-2_container-card-content">
                                <h2>20%</h2>
                                <div className="section-2_container-card-content-divider"></div>
                                <p>Tiết kiệm 20% chi phí giao hàng dựa trên hiệu quả lấp đầy thùng xe & tối ưu lộ trình</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="3" className="section-3">
                    <h2>
                        <span className="blue">LÝ DO</span>
                        <span className="green"> BẠN NÊN SỬ DỤNG</span><br />
                        <span className="blue">GIẢI
                            PHÁP ĐIỀU HÀNH VẬN TẢI</span>
                    </h2>
                    <div className="divider-span"></div>
                    <div className="section-3_container">
                        <div className="section-3_container-item">
                            <img src="/LandingPageBAExpress/section3.1.png" alt="Biểu đồ tăng trưởng hiển thị hiệu quả tức thì" />
                            <h3 className="section-3_container-title">Hiệu quả tức thì</h3>
                            <ul className="section-3_container-list">
                                <li>Tối đa tải trọng</li>
                                <li>Lập đầy sức chứa</li>
                                <li>Tối ưu lộ trình</li>
                                <li>Cải thiện năng suất</li>
                                <li>Gia tăng dịch vụ</li>
                            </ul>
                        </div>

                        <div className="section-3_container-item">
                            <img src="/LandingPageBAExpress/section3.2.png" alt="Icon hiển thị giao diện dễ dàng sử dụng" />
                            <h3 className="section-3_container-title">Dễ dàng sử dụng</h3>
                            <ul className="section-3_container-list">
                                <li>Hiển thị trực quan</li>
                                <li>Thao tác đơn giản</li>
                                <li>Giao diện thân thiện</li>
                                <li>Cảnh báo tức thì</li>
                            </ul>
                        </div>

                        <div className="section-3_container-item">
                            <img src="/LandingPageBAExpress/section3.3.png" alt="Icon thể hiện đồng bộ dữ liệu nhanh chóng" />
                            <h3 className="section-3_container-title">Đồng bộ nhanh chóng</h3>
                            <ul className="section-3_container-list">
                                <li>Đồng bộ dữ liệu</li>
                                <li>Cập nhật liên tục</li>
                                <li>Bảo mật thông tin</li>
                            </ul>
                        </div>
                    </div>
                </section>
                <section id="4" className="section-4">
                    <h2><span className="blue">GIẢI PHÁP VẬN TẢI</span> <span className="green">TOÀN DIỆN</span><br /></h2>
                    <div className="divider-span"></div>
                    <div className="section-4-title"><span>Giải pháp toàn diện cho ngành Logistics</span></div>
                    <div className="section-4_container">

                        <div className="section-4_container-img">
                            <img src="/LandingPageBAExpress/section4.png" alt="Giải Pháp Vận Tải Toàn Diện" />
                        </div>
                        <p className="section-4_container-p1">Quản lý <br /> đơn hàng</p>
                        <p className="section-4_container-p2">Kế hoạch</p>
                        <p className="section-4_container-p3">Quản lý <br /> đội xe</p>
                        <p className="section-4_container-p4">Điều phối <br /> & Giám sát</p>
                        <p className="section-4_container-p5">Quản lý <br />KPI</p>
                        <p className="section-4_container-p6">Báo cáo</p>
                        <h2 className="section-4_container-h2">ĐIỀU HÀNH <br />VẬN TẢI</h2>
                    </div>

                </section>
                <section id="5" className="section-5">
                    <h2><span className="blue">TÍNH NĂNG</span> <span className="green">ƯU VIỆT</span> <span className="blue">CỦA
                        BAEXPRESS</span></h2>
                    <div className="divider-span"></div>
                    <div className="section-5-items">
                        <div className="section-5_container">
                            <div className="section-5_container-img">
                                <div className="section-5_container-img-logo"> <img src="/LandingPageBAExpress/section5.1.png" alt="" /></div>
                                <div className="section-5_container-img-circle">
                                    <span className="section-5_container-img-circle-dot"></span>
                                </div>
                            </div>
                            <div className="section-5_container-content">
                                <h5 className="section-5_container-title">Quản lý đơn hàng</h5>
                                <div className="section-5_container-line">
                                    <span className="section-5_container-line-dot"></span>
                                </div>
                                <ul className="section-5_container-list">
                                    <li>Cập nhật trạng thái từng đơn hàng trong suốt hành trình giao hàng</li>
                                    <li>Cập nhật tức thời các sự cố xảy ra trong từng đơn hàng</li>
                                    <li>Đa dạng cách tạo đơn hàng: Tải file excel, tạo trên app, web và hệ thống ERP khác</li>
                                </ul>
                            </div>
                        </div>
                        <div className="section-5_container">
                            <div className="section-5_container-img">

                                <div className="section-5_container-img-logo"> <img src="/LandingPageBAExpress/section5.2.png" alt="" /></div>
                                <div className="section-5_container-img-circle"><span
                                    className="section-5_container-img-circle-dot"></span></div>
                            </div>
                            <div className="section-5_container-content">
                                <h5 className="section-5_container-title">Lập kế hoạch</h5>
                                <div className="section-5_container-line">
                                    <span className="section-5_container-line-dot"></span>
                                </div>
                                <ul className="section-5_container-list">
                                    <li>Lên kế hoạch điều phối đơn hàng và giao việc qua ứng dụng chỉ trong vài phút</li>
                                    <li>Hệ thống tối ưu tuyến đường giao hàng tự động</li>
                                    <li>Phân chia hàng hoá đảm bảo tỷ lệ lấp đầy thùng xe trên mỗi chuyến hàng</li>
                                </ul>
                            </div>
                        </div>
                        <div className="section-5_container">
                            <div className="section-5_container-img">
                                <div className="section-5_container-img-logo"> <img src="/LandingPageBAExpress/section5.3.png" alt="" /></div>
                                <div className="section-5_container-img-circle"><span
                                    className="section-5_container-img-circle-dot"></span></div>
                            </div>
                            <div className="section-5_container-content">
                                <h5 className="section-5_container-title">Điều phối & giám sát</h5>
                                <div className="section-5_container-line">
                                    <span className="section-5_container-line-dot"></span>
                                </div>
                                <ul className="section-5_container-list">
                                    <li>Giám sát tiến độ giao hàng thông qua lộ trình, hình ảnh, video clip và các thiết bị cảm
                                        biến gắn trên xe</li>
                                    <li>Cảnh báo: Lùi hẹn, hiệu quả sử dụng phương tiện, đơn hàng tiếp theo,... để có giải pháp
                                        kịp thời</li>
                                    <li>Đảm bảo đơn hàng được giao đúng giờ và hiệu quả nhất</li>
                                </ul>
                            </div>
                        </div>
                        <div className="section-5_container">
                            <div className="section-5_container-img">

                                <div className="section-5_container-img-logo"> <img src="/LandingPageBAExpress/section5.4.png" alt="" /></div>
                                <div className="section-5_container-img-circle"><span
                                    className="section-5_container-img-circle-dot"></span></div>
                            </div>
                            <div className="section-5_container-content">
                                <h5 className="section-5_container-title">Báo cáo</h5>
                                <div className="section-5_container-line">
                                    <span className="section-5_container-line-dot"></span>
                                </div>
                                <ul className="section-5_container-list">
                                    <li>Chỉ số km rỗng, giao hàng muộn, thời gian chờ</li>
                                    <li>Điểm đến, điểm trả, khối lượng, thời gian xếp hàng</li>
                                    <li>Quản trị phân tích: Biểu đồ, khách hàng, đơn hàng, doanh thu, chi phí,...</li>
                                    <li>Quản lý danh sách khách hàng</li>
                                </ul>
                            </div>
                        </div>
                        <div className="section-5_container">
                            <div className="section-5_container-img">

                                <div className="section-5_container-img-logo"> <img src="/LandingPageBAExpress/section5.5.png" alt="" /></div>
                                <div className="section-5_container-img-circle"><span
                                    className="section-5_container-img-circle-dot"></span></div>
                            </div>
                            <div className="section-5_container-content">
                                <h5 className="section-5_container-title">Quản lý KPI</h5>
                                <div className="section-5_container-line">
                                    <span className="section-5_container-line-dot"></span>
                                </div>
                                <ul className="section-5_container-list">
                                    <li>Chỉ số đánh giá hiệu quả giao hàng</li>
                                    <li>Chỉ số hài lòng của khách hàng trên mỗi đơn hàng</li>
                                    <li>Khen thưởng thành tích lái xe</li>
                                </ul>
                            </div>
                        </div>
                        <div className="section-5_container">
                            <div className="section-5_container-img">

                                <div className="section-5_container-img-logo"> <img src="/LandingPageBAExpress/section5.6.png" alt="" /></div>
                                <div className="section-5_container-img-circle"><span
                                    className="section-5_container-img-circle-dot"></span></div>
                            </div>
                            <div className="section-5_container-content">
                                <h5 className="section-5_container-title">Quản lý đội xe</h5>
                                <div className="section-5_container-line">
                                    <span className="section-5_container-line-dot"></span>
                                </div>
                                <ul className="section-5_container-list">
                                    <li>Quản lý danh sách lái xe, phụ xe, phương tiện</li>
                                    <li>Chấm công, tính lương lái xe, phụ xe theo tuyến</li>
                                </ul>
                            </div>
                        </div>


                    </div>
                </section>
                <section id="6" className="section-6">
                    <h2><span className="blue">TRẢI NGHIỆM GIẢI PHÁP</span></h2>
                    <div className="divider-span"></div>
                    <div className="section-6_container">
                        <div className="section-6_container-left">
                            <img src="/LandingPageBAExpress/section6.1.png" alt="" className="section-6_container-left-img" />
                            <div className="section-6_container-left-download">
                                <a href="https://apps.apple.com/vn/app/baexpress/id1560112617" target="_blank" rel="noreferrer">
                                    <img src="/LandingPageBAExpress/section6.2.png" alt="app-store" /></a>
                                <a href="https://play.google.com/store/apps/details?id=com.binhanh.driver.baexpress" target="_blank" rel="noreferrer">
                                    <img src="/LandingPageBAExpress/section6.3.png" alt="google-play" /></a>
                            </div>
                        </div>
                        <div className="section-6_container-right">
                            <div className="section-6_container-right-title">
                                <span>Đăng ký tư vấn & trải nghiệm ngay BAExpress
                                    để có được giải pháp toàn diện cho ngành Logistic
                                    trong lòng bàn tay!</span>
                            </div>
                            <div className="section-6_container-right-form">

                                <form onSubmit={handleSubmit} method="post" loading="true">
                                    <input type="text" name="fullName" placeholder="Họ và tên" required value={formData.fullName} onChange={handleChange} />
                                    <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
                                    <input type="tel" name="phoneNumber" placeholder="Số điện thoại" required value={formData.phoneNumber} onChange={handleChange} />
                                    <textarea name="message" placeholder="Để lại lời nhắn cho chúng tôi" value={formData.message} onChange={handleChange}></textarea>
                                    {showCaptcha && (
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={process.env.REACT_APP_CAPTCHA_KEY}
                                            onChange={handleCaptchaChange}
                                        />
                                    )}
                                    <button disabled={loading} type="submit">Đặt hàng ngay</button>
                                </form>
                            </div>

                        </div>
                    </div>

                </section>
                <section className="section-7">
                    <div className="section-7_container">
                        <div className="section-7_container-left">
                            <nav>
                                <ul>
                                    <div id="close"></div>
                                    <li> <a href="#CSvanchuyen" className="section-7_container-link">Chính sách vận chuyển</a></li>
                                    <li><a href="#CSbaomat" className="section-7_container-link">Chính sách bảo mật</a></li>
                                    <li><a href="#CSbaohanh" className="section-7_container-link">Chính sách bảo hành</a></li>

                                </ul>
                            </nav>
                        </div>
                        <div className="section-7_container-right">
                            <nav>
                                <ul>
                                    <div id="close"></div>
                                    <li><a href="#CSdoitra" className="section-7_container-link">Chính sách đổi trả & hoàn tiền</a></li>
                                    <li><a href="#HTthanhtoan" className="section-7_container-link">Hình thức thanh toán</a></li>
                                    <li><a href="#DKsudung" className="section-7_container-link">Điều khoản sử dụng</a></li>

                                </ul>
                            </nav>
                        </div>
                        {/*  <!-- Start-Modal --> */}
                        <div id="CSvanchuyen" className="section-7_container-modal">
                            <a href="#close" className="section-7_overlay"></a>
                            <div className="section-7_container-modal-content">

                                <div className="section-7_container-modal-header">
                                    <h2>Chính sách vận chuyển và giao nhận</h2>
                                    <a href="#close" className="close-btn">&times;</a>
                                </div>
                                <div className="section-7_container-modal-body">
                                    <p>Do sản phẩm của BAEXPRESS liên quan nhiều đến các dịch vụ kỹ thuật như tư vấn, triển khai
                                        lắp đặt, đấu ghép hệ thống, lập trình hệ thống, bảo hành, bảo trì…nên các chi phí về
                                        giao nhận vận chuyển đều được thoả thuận trước giữa BAEXPRESS và khách hàng.
                                        - Thông thường sau khi nhận được thông tin đặt hàng chúng tôi sẽ xử lý đơn hàng trong
                                        vòng 24h và phản hồi lại thông tin cho khách hàng về việc thanh toán và giao nhận. Thời
                                        gian giao hàng thường trong khoảng từ 3-5 ngày kể từ ngày chốt đơn hàng hoặc theo thỏa
                                        thuận với khách khi đặt hàng.
                                        - Về phí vận chuyển, chúng tôi sử dụng dịch vụ vận chuyển ngoài nên cước phí vận chuyển
                                        sẽ được tính theo phí của các đơn vị vận chuyển tùy vào vị trí và khối lượng của đơn
                                        hàng, khi liên hệ lại xác nhận đơn hàng với khách sẽ báo mức phí cụ thể cho khách hàng.
                                        - Đối với Quý khách hàng ở tỉnh có nhu cầu mua số lượng lớn hoặc khách buôn sỉ nếu có
                                        nhu cầu mua sản phẩm, chúng tôi sẽ nhờ dịch vụ giao nhận của các công ty vận chuyển và
                                        phí sẽ được tính theo phí của các đơn vị cung cấp dịch vụ vận chuyển hoặc theo thoản
                                        thuận hợp đồng giữa 2 bên.
                                        - Đối với hàng có trị giá lớn chúng tôi tiến hành đóng dấu, niêm phong, chụp ảnh lại
                                        cách thức hàng hóa đã được đóng gói niêm phong và gửi cho người mua hàng để tiện kiểm
                                        tra khi nhận hàng dễ dàng cho Quý khách hàng có thể kiểm tra và chứng minh rằng hàng
                                        không bị thay đổi nội dung khi vận chuyển, đồng thời thông báo cho người mua thời gian
                                        dự kiến hàng sẽ tới tay người mua hàng, như vậy người mua hàng sẽ yên tâm rằng hàng hoá
                                        đã được giao và chuẩn bị, thu xếp nhận hàng sớm.
                                        - Quý khách vui lòng trực tiếp kiểm tra kỹ hàng hoá ngay khi nhận hàng từ người chuyển
                                        phát hàng hoá, nếu có vấn đề liên quan tới việc chúng loại, chất lượng, số lượng hàng
                                        hoá không đúng như trong đơn đặt hàng, niêm phong đã bị thay đổi, thì Quý khách hãy lập
                                        biên bản ngay khi nhận hàng với đơn vị hoặc người chuyển phát và thông báo ngay cho
                                        BAEXPRESS để cùng phối hợp đơn vị chuyển phát hàng hóa xử lý.
                                        - Trong mọi trường hợp như vậy, Quý khách không phải chịu bất kì trách nhiệm nào liên
                                        quan tới việc hàng hoá bị thay đổi, thất lạc, không đảm bảo về chất lượng và đủ số lượng
                                        trong quá trình vận chuyển hàng hoá tới địa điểm nhận hàng của Quý khách.
                                        - Khi đặt hàng, Quý khách vui lòng điền đầy đủ và chính xác các thông tin cần thiết theo
                                        yêu cầu để tạo điều kiện thuận lợi cho chúng tôi trong việc cung cấp hàng hóa và nhận
                                        thanh toán nhanh chóng. BAEXPRESS có quyền kiểm tra các thông tin này và có quyền từ
                                        chối đăng kí tài khoản không xác định rõ danh tính cũng như hủy bỏ các đơn đặt hàng
                                        không rõ ràng, chúng tôi cũng không chịu trách nhiệm đối với những trường hợp giao hàng
                                        chậm trễ hay thất lạc v.v… vì các thông tin do Quý khách cung cấp không chính xác.
                                        Chính sách vận chuyển và giao nhận
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div id="CSbaomat" className="section-7_container-modal">
                        <a href="#close" className="section-7_overlay"></a>
                            <div className="section-7_container-modal-content">
                                <div className="section-7_container-modal-header">
                                    <h2>Chính sách bảo mật</h2>
                                    <a href="#close" className="close-btn">&times;</a>
                                </div>
                                <div className="section-7_container-modal-body">
                                    <strong>1. Mục đích và phạm vi sử dụng:</strong>
                                    <p>Chúng tôi có thể thu thập thông tin của bạn trên website https://www.baexpress.io như
                                        thông tin về số lần ghé thăm website, bao gồm số trang bạn xem, số links (liên kết) bạn
                                        click, những thông tin khác liên quan đến việc kết nối đến website
                                        https://www.baexpress.io và các thông tin mà trình duyệt Web (Browser) bạn sử dụng mỗi
                                        khi truy cập vào https://www.baexpress.io gồm: địa chỉ IP, loại trình duyệt sử dụng,
                                        ngôn ngữ sử dụng, thời gian và những địa chỉ mà trình duyệt truy xuất đến.
                                        Để truy cập và sử dụng một số dịch vụ của https://www.baexpress.io, bạn có thể sẽ được
                                        yêu cầu đăng ký với chúng tôi thông tin cá nhân như: Họ tên, SĐT, Email, Địa chỉ,..
                                        Mọi thông tin khai báo phải đảm bảo tính chính xác và hợp pháp. BAEXPRESS sẽ không chịu
                                        mọi trách nhiệm liên quan đế luật pháp của thông tin khai báo</p> <br />
                                    <strong>2. Phạm vi sử dụng thông tin</strong>
                                    <p>BAEXPRESS thu thập và sử dụng thông tin cá nhân bạn với mục đích phù hợp và hoàn toàn
                                        tuân thủ nội dung của “Chính sách bảo mật” này.
                                        Thông tin cá nhân của bạn sẽ được phục vụ cho một hoặc tất cả các mục đích sau đây: Hỗ
                                        trợ khách hàng, Cung cấp thông tin liên quan đến dịch vụ, Xử lý đơn hàng & cung cấp dịch
                                        vụ thông tin qua Website (theo yêu cầu của bạn), hỗ trợ quản lý tài khoản khách hàng;
                                        xác nhận và thực hiện các giao dịch tài chính liên quan đến các khoản thanh toán trực
                                        tuyến của bạn,..
                                        Khi cần thiết, chúng tôi có thể sử dụng những thông tin này để liên hệ trực tiếp với bạn
                                        dưới các hình thức như: gởi thư ngỏ, đơn đặt hàng, thư cảm ơn, sms, thông tin về kỹ
                                        thuật và bảo mật…</p> <br />
                                    <strong>3. Thời gian lưu trữ thông tin</strong>
                                    <p>Dữ liệu cá nhân của Thành viên sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc tự
                                        thành viên đăng nhập và thực hiện hủy bỏ. Còn lại trong mọi trường hợp thông tin cá nhân
                                        thành viên sẽ được bảo mật trên máy chủ của BAEXPRESS.</p> <br />
                                    <strong>4. Cam kết bảo mật thông tin cá nhân khách hàng</strong>
                                    <p>BAEXPRESS cam kết bảo mật tuyệt đối theo chính sách bảo vệ thông tin cá nhân. Việc thu
                                        thập và sử dụng thông tin của mỗi thành viên chỉ được thực hiện khi có sự đồng ý của
                                        khách hàng đó trừ những trường hợp pháp luật có quy định khác.
                                        Không sử dụng, không chuyển giao, cung cấp hay tiết lộ cho bên thứ 3 nào về thông tin cá
                                        nhân của thành viên khi không có sự cho phép đồng ý từ thành viên.
                                        Trong trường hợp máy chủ lưu trữ thông tin bị hacker tấn công dẫn đến mất mát dữ liệu cá
                                        nhân thành viên, BAEXPRESS sẽ có trách nhiệm thông báo vụ việc cho cơ quan chức năng
                                        điều tra xử lý kịp thời và thông báo cho thành viên được biết.</p>
                                </div>
                            </div>
                        </div>
                        <div id="CSbaohanh" className="section-7_container-modal">
                        <a href="#close" className="section-7_overlay"></a>
                            <div className="section-7_container-modal-content">
                                <div className="section-7_container-modal-header">
                                    <h2>Chính sách bảo hành</h2>
                                    <a href="#close" className="close-btn">&times;</a>
                                </div>
                                <div className="section-7_container-modal-body">
                                    <strong> Các điều kiện bảo hành thiết bị của BAEXPRESS gồm:</strong>
                                    <p>- Sản phẩm trong thời hạn còn bảo hành<br />
                                        - Lỗi về máy, pin và bị hư hỏng do các điều kiện tự nhiên, không có sự tác động của con
                                        người<br />
                                        - Sản phẩm được bảo hành theo quy định của nhà cung cấp<br />
                                        - Quý khách xuất trình phiếu bảo hành khi bảo hành.<br /></p>

                                    <strong>Trong những trường hợp sau, BAEXPRESS sẽ không chịu trách nhiệm bảo hành:</strong>
                                    <p>- Sản phẩm đã quá thời hạn ghi trên Phiếu bảo hành hoặc mất Phiếu bảo hành. <br />
                                        - Phiếu bảo hành không ghi rõ mã số sản phẩm và ngày mua hàng. <br />
                                        - Mã số sản phẩm và Phiếu bảo hành không trùng khớp nhau hoặc không xác định được vì bất
                                        kỳ lý do nào. <br />
                                        - Sản phẩm bị trầy xước do quá trình sử dụng lâu ngày. <br />
                                        - Sản phẩm bị bể móp, biến dạng do bị va đập. <br />
                                        - Khách hàng tự ý can thiệp vào máy của sản phẩm hoặc đem đến một nơi nào khác sửa chữa.
                                        <br />
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div id="CSdoitra" className="section-7_container-modal">
                        <a href="#close" className="section-7_overlay"></a>
                            <div className="section-7_container-modal-content">
                                <div className="section-7_container-modal-header">
                                    <h2>Chính sách đổi trả & hoàn tiền</h2>
                                    <a href="#close" className="close-btn">&times;</a>
                                </div>
                                <div className="section-7_container-modal-body">
                                    <strong>Các trường hợp khách hàng được đổi/ trả hàng:</strong>
                                    <p>- Sản phẩm mua không ưng ý: Quý khách có thể trả hàng khi không vừa ý trong vòng 1h kể từ
                                        khi nhận hàng, BAEXPRESS sẽ đổi sản phẩm cho khách. <br />
                                        - Sản phẩm mua bị lỗi–Quá hạn sử dụng: Quý khách vui lòng kiểm tra sản phẩm trước khi
                                        thanh toán. Trong trường hợp sản phẩm bị hư hại trong quá trình vận chuyển, quý khách
                                        vui lòng từ chối và gửi lại sản phẩm cho chúng tôi <br />
                                        - Sản phẩm không sử dụng được ngay khi được giao: Trước tiên, hãy dành thời gian đọc kỹ
                                        tem hướng dẫn sử dụng và chắc rằng sản phẩm phù hợp với nhu cầu của bạn. Vui lòng liên
                                        hệ ngay cho chúng tôi để được hỗ trợ hồi trả lại hàng <br />
                                        - Sản phẩm giao không đúng theo đơn đặt hàng: Hãy liên hệ với chúng tôi càng sớm càng
                                        tốt, hệ thống của chúng tôi sẽ kiểm tra nếu hàng của bạn bị gửi nhầm. Trong trường hợp
                                        đó, chúng tôi sẽ thay thế đúng mặt hàng bạn yêu cầu (khi có hàng). <br /></p>
                                    <strong>Điều kiện hoàn tiền 100%:</strong>
                                    <p>- Sản phẩm phát hiện bị lỗi của nhà sản xuất khi nhận hàng. <br />
                                        - Sản phẩm không giống với sản phẩm mà Quý khách đã đặt hàng trên website của chúng tôi.
                                    </p>
                                    <strong>Điều kiện đổi/ trả hàng và hoàn tiền:</strong>
                                    <p>- Thời gian: trong vòng 01 ngày kể từ khi nhận được hàng và Quý Khách hàng vui lòng liên
                                        hệ gọi ngay cho chúng tôi theo số điện thoại 1900 6464 để được xác nhận đổi trả hàng.
                                    </p>
                                    <strong>Quy định sản phẩm:</strong>
                                    <p>- Sản phẩm đổi/ trả phải còn nguyên đai nguyên kiện, đầy đủ hộp, giấy Hướng dẫn sử dụng
                                        và chưa qua sử dụng. <br />
                                        - Phiếu bảo hành (nếu có) và tem của công ty trên sản phẩm còn nguyên vẹn. <br />
                                        - Quý khách chịu chi phí vận chuyển, đóng gói, thu hộ tiền, chi phí liên lạc tối đa
                                        tương đương 20% giá trị đơn hàng. <br /></p>
                                </div>
                            </div>
                        </div>
                        <div id="HTthanhtoan" className="section-7_container-modal">
                        <a href="#close" className="section-7_overlay"></a>
                            <div className="section-7_container-modal-content">
                                <div className="section-7_container-modal-header">
                                    <h2>Hình thức thanh toán</h2>
                                    <a href="#close" className="close-btn">&times;</a>
                                </div>
                                <div className="section-7_container-modal-body">
                                    <strong>Đối tượng áp dụng:</strong>
                                    <p>- Khách hàng mua sản phẩm của BAEXPRESS <br />
                                        - Khách hàng đang sử dụng sản phẩm của BAEXPRESS và có nhu cầu đóng phí duy trì hàng năm
                                        <br />
                                    </p>
                                    <strong>Hình thức thanh toán:</strong>
                                    <p>Hiện tại, BAEXPRESS có 3 hình thức thanh toán để quý khách hàng có thể lựa chọn: <br />
                                        - Cách 1: Thanh toán tiền mặt trực tiếp địa chỉ của chúng tôi <br />
                                        - Cách 2: Thanh toán khi nhận hàng (COD), khách hàng xem hàng tại nhà, thanh toán tiền
                                        mặt cho nhân viên giao nhận hàng. <br />
                                        - Cách 3: Chuyển khoản trước. Quý khách chuyển khoản trước, sau đó chúng tôi tiến hành
                                        giao hàng theo thỏa thuận hoặc hợp đồng với Quý khách. Để đảm bảo giao dịch an toàn và
                                        thành công, quý khách xin lưu ý về nội dung chuyển khoản: Họ và tên + tên sản phẩm cũng
                                        như bảo mật 3 số ở mặt sau của thẻ là CVV và CVN nếu quý khách sử dụng thẻ ghi nợ quốc
                                        tế để ghi nợ. Sau khi giao dich thành công, chúng tôi sẽ lập tức liên hệ với bạn để xác
                                        nhận và tiến hành giao hàng theo thời gian đã thỏa thuận. <br /></p>
                                    <strong>Lưu ý:</strong>
                                    <p>- Nếu sau thời gian thỏa thuận mà chúng tôi không giao hàng hoặc không phản hồi lại, quý
                                        khách có thể gửi khiếu nại trực tiếp về địa chỉ trụ sở và yêu cầu bồi thường nếu chứng
                                        minh được sự chậm trễ làm ảnh hưởng đến kinh doanh của quý khách. <br />
                                        - Đối với khách hàng có nhu cầu mua số lượng lớn để kinh doanh hoặc buôn sỉ vui lòng
                                        liên hệ trực tiếp với chúng tôi để có chính sách giá cả hợp lý, việc thanh toán sẽ được
                                        thực hiện theo hợp đồng. <br /></p>
                                </div>
                            </div>
                        </div>
                        <div id="DKsudung" className="section-7_container-modal">
                        <a href="#close" className="section-7_overlay"></a>
                            <div className="section-7_container-modal-content">
                                <div className="section-7_container-modal-header">
                                    <h2>Điều khoản sử dụng</h2>
                                    <a href="#close" className="close-btn">&times;</a>
                                </div>
                                <div className="section-7_container-modal-body">
                                    <strong>1. Trách nhiệm của khách hàng khi sử dụng dịch vụ của BAEXPRESS</strong>
                                    <p>Khách hàng tuyệt đối không được sử dụng bất kỳ công cụ, phương pháp nào để can thiệp, xâm
                                        nhập bất hợp pháp vào hệ thống hay làm thay đổi cấu trúc dữ liệu tại
                                        https://www.baexpress.io. Khách hàng không được có những hành động khuyến khích hay việc
                                        can thiệp, xâm nhập dữ liệu của https://www.baexpress.io cũng như hệ thống máy chủ của
                                        chúng tôi. Ngoài ra, xin vui lòng thông báo cho quản trị website của
                                        https://www.baexpress.io ngay khi khách hàng phát hiện ra lỗi hệ thống theo hotline:
                                        1900 6464. <br />
                                        Khách hàng không được đưa ra những nhận xét, đánh giá có ý xúc phạm, quấy rối, làm phiền
                                        hoặc có bất cứ hành vi nào thiếu văn hóa đối với khách hàng khác. Không nêu ra những
                                        nhận xét có liên quan tới chính trị (như tuyên truyền, chống phá, xuyên tạc nhà nước…),
                                        kỳ thị tôn giáo, giới tính, sắc tộc... Tuyệt đối cấm mọi hành giả mạo, cố ý tạo sự nhầm
                                        lẫn mình là một khách hàng khác hoặc là thành viên của Ban Quản Trị BAEXPRESS.</p>
                                    <strong>2. Trách nhiệm và quyền lợi của BAEXPRESS</strong>
                                    <p>Trong trường hợp có những phát sinh ngoài ý muốn hoặc trách nhiệm của của chúng tôi,
                                        BAEXPRESS sẽ không chịu trách nhiệm về mọi tổn thất phát sinh. Ngoài ra, chúng tôi không
                                        cho phép các tổ chức, cá nhân khác quảng bá sản phẩm tại website
                                        https://www.baexpress.io mà chưa có sự xác nhận của https://www.baexpress.io. Các thỏa
                                        thuận và quy định trong Điều khoản sử dụng có thể thay đổi vào bất cứ lúc nào nhưng sẽ
                                        được chúng tôi thông báo cụ thể trên website https://www.baexpress.io.
                                        Ngoài ra, nếu có bất cứ câu hỏi nào về những thỏa thuận trên đây, vui lòng liên hệ
                                        hotline: 1900 6464.</p>

                                </div>
                            </div>
                        </div>
                        {/* <!-- End Modal --> */}
                    </div>
                </section>
            </main>
            {/* end main */}

            {/* start Footer */}
            <footer>
                <div className="footerBAE">
                    <h4>BA EXPRESS - MỘT SẢN PHẨM CỦA BA GPS</h4>
                    <h5>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</h5>
                    <p>Địa chỉ: Lô 14 phố Nguyễn Cảnh Dị, Q. Hoàng Mai, Hà Nội</p>
                    <p>☏ Hotline: 1900 6464</p>
                    <p>✉ Email: connect@baexpress.io</p>
                    <p>🌐 Website: <a href="https://baexpress.io">https://baexpress.io</a> <a href="https://bagps.vn">https://bagps.vn</a></p>
                    <p>✎ Số ĐKKD: 0102306702</p>
                </div>
            </footer>
            {/* end Footer */}
        </div>
    )
}
export default LandingPageBAExpress;













