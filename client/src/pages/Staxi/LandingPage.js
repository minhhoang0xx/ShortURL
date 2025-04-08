import React, { useState, useRef, useEffect } from "react";
import "../Staxi/styleStaxi.css"
import ReCAPTCHA from "react-google-recaptcha";
import * as FormRequestService from "../../services/FormRequestService";
import { message } from "antd";


const LandingPageStaxi = () => {
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
        phoneNumber:"",
        address: "",
        company: "",
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
        if (showCaptcha && !captchaToken) {
            message.error("Vui lòng hoàn thành CAPTCHA!");
            return;
        }

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
                    address:"",
                    company: "",
                });
                setAttempts(response.attempts);
                // setShowCaptcha(false);
                setCaptchaToken(null);
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                }
            } else {
                throw new Error("Tạo thất bại!");
            }
        } catch (error) {
            console.error("API Error:", error);
            let errorMessage = "Gửi thông tin thất bại";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                if (error.response.data.requiresCaptcha) {
                    setShowCaptcha(true);
                    setCaptchaToken(null);
                    if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="landing-page">
            {/* <!-- start header --> */}
            <header className="S_header">
                <div className="S_header_container">
                    <div className="S_header_logo">
                        <img className="S_header_logo-img" src="LandingPageStaxi/logo.png" alt="Logo" height="40" />
                    </div>
                    <input type="checkbox" id="S_menu-toggle" />
                    <label htmlFor="S_menu-toggle" className="S_header_menu-icon">
                        <span className="S_header_menu-icon-line"></span>
                    </label>
                    <nav className="S_header_nav">
                        <ul className="S_header_nav-list">
                            <li><a href="#section-2">Lợi ích</a></li>
                            <li><a href="#section-4">Tính năng</a></li>
                            <li><a href="#section-5">Khách hàng</a></li>
                            <li><a href="#section-6">Sản phẩm cho taxi</a></li>
                            <li><a href="#footer">Tư vấn</a></li>
                            <li><a href="/ShortUrl">Short URL</a></li>
                        </ul>
                    </nav>
                    <div className="S_header_contact">
                        <img src="LandingPageStaxi/call.svg" alt="Icon" className="S_header_contact-icon" />
                        <span>1900 6415</span>
                    </div>

                </div>
            </header>
            {/* <!-- end header --> */}

            {/* <!-- start main --> */}
            <main className="S_main">
                <section className="S_section-1">
                    <h2>GIẢI PHÁP ĐIỀU HÀNH TAXI CÔNG NGHỆ</h2>
                    <p><strong>STAXI</strong> là giải pháp quản trị vận tải xe taxi thông minh trong cuộc cách mạng công nghiệp 4.0,
                        giúp tối ưu hóa
                        quản lý taxi từ xa, giảm chi phí, tăng doanh thu, cải tiến quy trình làm việc, nâng cao trải nghiệm khách hàng
                        và đảm bảo an toàn giao thông.</p>
                </section>
                <section className="S_section-2" id="section-2">
                    <div className="S_section-2_container">
                        <iframe className="S_section-2_video"
                            src="https://www.youtube.com/embed/eLMO8TY2MrE?autoplay=1&mute=1&loop=1"
                            title="[STAXI] GIẢI PHÁP QUẢN TRỊ VẬN TẢI XE TAXI THÔNG MINH STAXI" frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>
                </section>
                <section className="S_section-3">
                    <h3>
                        <span className="S_orange">VÌ SAO</span>
                        <span className="S_blue"> LỰA CHỌN</span>
                        <span className="S_orange"> STAXI</span>
                    </h3>
                    <p>Hơn cả một giải pháp,<strong> STAXI</strong> sẽ cải tiến công nghệ, giải quyết các bài toán về vận hành, nâng
                        cao trải nghiệm khách hàng, tăng trưởng doanh thu bền vững và góp phần bảo vệ lợi ích lâu dài cho doanh nghiệp.
                    </p>
                    <div className="S_section-3-content">
                        <div className="S_section-3-content-item">
                            <img src="LandingPageStaxi/section3-1.jpg" alt="Section 3-1" />
                            <h4>DOANH NGHIỆP</h4>
                            <div className="S_section-3-content-item_detail">
                                <span>✔️ Bắt kịp xu hướng taxi công nghệ </span> <br />
                                <span>✔️ Nâng cao hiệu quả điều xe, sử dụng xe hợp lý</span> <br />
                                <span>✔️ Quản lý và giám sát hoạt động chi tiết từng xe</span> <br />
                                <span>✔️ Phát hiện và xử lý vi phạm, gian lận</span> <br />
                                <span>✔️ Tối ưu chi phí quản lý vận hành doanh nghiệp</span> <br />
                                <span>✔️ Gia tăng gắn kết và hỗ trợ tài xế</span> <br />
                                <span>✔️ Tạo dựng niềm tin với hành khách</span>
                            </div>

                        </div>
                        <div className="S_section-3-content-item">
                            <img src="LandingPageStaxi/section3-2.jpg" alt="Section 3-2" />
                            <h4>TÀI XẾ</h4>
                            <div className="S_section-3-content-item_detail">
                                <span>✔️ Chủ động nhận cuốc xe </span> <br />
                                <span>✔️ Tối ưu quãng đường với tiện ích GPS</span> <br />
                                <span>✔️ Gia tăng doanh số và thu nhập</span> <br />
                                <span>✔️ Nâng cao tinh thần trách nhiệm với công việc</span> <br />
                                <span>✔️ Cảnh báo các lỗi vi phạm luật giao thông</span> <br />
                                <span>✔️ Gửi thông báo hỗ trợ khi gặp rủi ro bất ngờ</span> <br />
                                <span>✔️ Theo dõi lịch bảo dưỡng sửa chữa</span>
                            </div>
                        </div>
                        <div className="S_section-3-content-item">
                            <img src="LandingPageStaxi/section3-3.png" alt="Section 3-3" />
                            <h4>KHÁCH HÀNG</h4>
                            <div className="S_section-3-content-item_detail">
                                <span>✔️ Đặt xe đơn giản, chủ động </span> <br />
                                <span>✔️ Minh bạch quãng đường, cước phí di chuyển </span> <br />
                                <span>✔️ Thanh toán Online tiện lợi </span> <br />
                                <span>✔️ Hưởng các chính sách khuyến mại của hãng </span> <br />
                                <span>✔️ Đánh giá chất lượng phục vụ của lái xe </span> <br />
                                <span>✔️ Dễ dàng tìm đồ thất lạc trên xe</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="S_section-4" id="section-4">
                    <h3>
                        <span className="S_orange">TÍNH NĂNG</span>
                        <span className="S_blue"> NỔI BẬT CỦA</span>
                        <span className="S_orange"> STAXI</span>
                    </h3>
                    <p> <strong>STAXI</strong> giúp cho việc vận hành của các doanh nghiệp taxi trở nên dễ dàng và chuyên nghiệp hơn
                        với một hệ thống đầy đủ các tính năng vượt trội.</p>

                    <div className="S_section-4-diagram">
                        <div className="S_center-image">
                            <img src="LandingPageStaxi/section4.jpg" alt="Phone showing STAXI app interface" />
                        </div>

                        <div className="S_inner-circle"></div>
                        <div className="S_outer-circle"></div>

                        <div className="S_section-4-wrapper">
                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">GIÁM SÁT ĐIỀU HÀNH XE<br />THEO THỜI GIAN THỰC</div>
                            </div>

                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">CHẤM ĐIỂM & THANG HẠNG<br />LÁI XE TỰ ĐỘNG</div>
                            </div>

                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">HỖ TRỢ BỘ PHẬN CHECKER<br />THU NGÂN, KẾ TOÁN</div>
                            </div>

                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">HỖ TRỢ CHUẨN BỊ<br />GIAO THÔNG VẬN TẢI</div>
                            </div>

                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">TÍCH HỢP THANH TOÁN<br />ĐIỆN TỬ</div>
                            </div>

                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">HỖ TRỢ BỘ PHẬN<br />GIÁM SÁT, THANH TRA</div>
                            </div>

                            <div className="S_section-4-item">
                                <div className="S_section-4-item-icon">
                                    <i>❖</i>
                                </div>
                                <div className="S_section-4-item-text">HỖ TRỢ BỘ PHẬN<br />ĐIỀU XE</div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="S_section-5" id="section-5">
                    <h3>
                        <span className="S_orange">KHÁCH HÀNG</span>
                        <span className="S_blue"> TIÊU BIỂU</span>
                    </h3>
                    <p> Hơn 150 hãng Taxi đã và đang tin tưởng sử dụng giải pháp công nghệ<strong> STAXI</strong> </p>
                    <div className="S_section-5-line">
                        <span className="S_orange">__________ </span>
                        <span className="S_blue"> ___ </span>
                        <span className="S_blue"> __</span>
                    </div>
                    <div className="S_section-5-logo">
                        <img src="LandingPageStaxi/section5-1.jpg" alt="Đất Cảng" />
                        <img src="LandingPageStaxi/section5-2.jpg" alt="Sao Quảng Ninh" />
                        <img src="LandingPageStaxi/section5-3.jpg" alt="Voi" />
                        <img src="LandingPageStaxi/section5-4.png" alt="G7taxi" />
                        <img src="LandingPageStaxi/section5-5.jpg" alt="123taxi" />
                        <img src="LandingPageStaxi/section5-6.jpg" alt="Vạn Xuân" />
                        <img src="LandingPageStaxi/section5-7.jpg" alt="BTN JSC" />
                    </div>
                    <div className="S_section-5-content">
                        <div className="S_section-5-content-container">
                            <div className="S_section-5-content-image">
                                <img src="LandingPageStaxi/section5-8.jpg" alt="G7 Taxi signing ceremony" />
                            </div>
                            <div className="S_section-5-content-container-wrapper">
                                <h3>
                                    <span className="S_orange">TAXI G7 </span>
                                    <span className="S_blue">CHUYỂN MÌNH THÀNH CÔNG</span>
                                </h3>
                                <p>
                                    Năm 2018, tại Hà Nội, thương hiệu taxi lớn nhất Hà Nội chính thức ra mắt thị trường. Lãnh đạo G7 taxi cho
                                    biết, mục tiêu chính là thị phần chứ không phải đối đầu với các đối thủ. Nhà quản lý cần phải tạo ra môi
                                    trường cạnh tranh lành mạnh trong "cuộc chiến" vận tải taxi, do đó "một cú chuyển mình công nghệ" ngoài
                                    mục đã chính thức diễn ra.
                                </p>
                                <blockquote>
                                    Khách hàng sử dụng smartphone trên Android, IOS có thể tải ứng dụng G7 taxi để đặt xe của G7 taxi. Ứng
                                    dụng đáp ứng được việc gọi xe nhanh chóng trong cả những khung giờ cao điểm, giờ đêm. Khách hàng không có
                                    smartphone, vẫy xe trên đường cũng có thể yêu cầu lái xe ước tính trước giá cước chuyến đi thông qua phần
                                    mềm của lái xe. Chính vì thế, đơn vị đã ký kết hợp tác chiến lược với Công ty Bình Anh (BA GPS) - một công
                                    ty chuyên sâu về công nghệ giao thông vận tải tại Việt Nam.
                                </blockquote>
                                <div className="S_section-5-content-signature">
                                    <p className="S_section-5-content-signature-name">Ông Nguyễn Anh Quân</p>
                                    <p className="S_section-5-content-signature-title">Tổng giám đốc G7 Taxi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="S_section-6" id="section-6">
                    <h3>
                        <span className="S_orange">SẢN PHẨM</span>
                        <span className="S_blue"> CHO VẬN TẢI TAXI</span>
                    </h3>
                    <p>BA GPS tự hào cung cấp cho quý khách hàng bộ sản phẩm toàn diện, chất lượng cao cho ngành vận tải taxi</p>
                    <div className="S_section-6-equipment-grid">
                        <div className="S_section-6-equipment-item">
                            <div className="S_section-6-equipment-title">
                                <h4>Thiết bị giám sát hành trình</h4>
                                <p>Thiết bị định vị 4G hợp chuẩn QCVN31:2014/BGTVT</p>
                            </div>
                            <div className="S_section-6-equipment-content">
                                <img src="LandingPageStaxi/section6-1.jpg" alt="Thiết bị giám sát hành trình" />
                            </div>
                        </div>
                        <div className="S_section-6-equipment-item">
                            <div className="S_section-6-equipment-content">
                                <img src="LandingPageStaxi/section6-2.jpg" alt="Đồng hồ tính cước Taxi" />
                            </div>
                            <div className="S_section-6-equipment-title">
                                <h4>Đồng hồ tính cước Taxi</h4>
                                <p>Đồng hồ tính cước đáp ứng quy chuẩn của Bộ GTVT</p>
                            </div>

                        </div>
                        <div className="S_section-6-equipment-item">
                            <div className="S_section-6-equipment-title">
                                <h4>Máy in hoá đơn cước Taxi</h4>
                                <p>Thiết bị kết nối đồng hồ taxi để in thông tin cước khách</p>
                            </div>
                            <div className="S_section-6-equipment-content">
                                <img src="LandingPageStaxi/section6-3.jpg" alt="Máy in hoá đơn cước Taxi" />

                            </div>
                        </div>

                        <div className="S_section-6-equipment-item">
                            <div className="S_section-6-equipment-content">
                                <img src="LandingPageStaxi/section6-4.jpg" alt="Đầu đọc thẻ lái xe" />
                            </div>
                            <div className="S_section-6-equipment-title">
                                <h4>Đầu đọc thẻ lái xe</h4>
                                <p>Thiết bị kết nối thiết bị định vị hợp chuẩn QCVN31:2014/BGTVT</p>
                            </div>
                        </div>
                    </div>

                </section>
            </main>
            {/* <!-- end main --> */}

            {/* <!-- start footer --> */}
            <footer className="S-footer">
                <div className="S_footer" id="footer">
                    <div className="S_footer-contact">
                        <h3>STAXI - MỘT SẢN PHẨM CỦA BA GPS</h3>
                        <h4>CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐIỆN TỬ BÌNH ANH</h4>
                        <span>Địa chỉ: Lô 14 phố Nguyễn Cảnh Dị, Q. Hoàng Mai, Hà Nội</span><br />
                        <span>Hotline: 1900 6415 - 1900 6464</span><br />
                        <span>Website: <a href="http://staxi.vn" target="_blank" rel="noreferrer"> http://staxi.vn</a></span><br />
                        <span>Số ĐKKD: 0102306702</span><br />
                        <a href="http://online.gov.vn/Home/WebDetails/71521?AspxAutoDetectCookieSupport=1" target="_blank" rel="noreferrer"> <img
                            src="LandingPageStaxi/footer.png" alt="" /></a>
                        <p>Copyright © 2020 BA GPS</p>
                    </div>
                    <div className="S_footer-opinion">
                        <h3>TƯ VẤN MIỄN PHÍ</h3>
                        <span>Giải pháp điều hành taxi công nghệ thông minh trong tầm tay! </span>
                        <form onSubmit={handleSubmit} className="S_footer-form" loading ="true">
                            <div className="S_footer-form-inline">
                                <input type="text" name ="fullName" placeholder="Họ và tên*" required value={formData.fullName} onChange={handleChange} />
                                <input type="text" name="phoneNumber" placeholder="Số điện thoại*" required  value={formData.phoneNumber} onChange={handleChange}/>
                                <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="S_footer-form-inline">
                                <input type="text" name="company" placeholder="Công ty*" value={formData.company} onChange={handleChange}/>
                                <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} />
                            </div>
                            {showCaptcha && (
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={process.env.REACT_APP_CAPTCHA_KEY}
                                            onChange={handleCaptchaChange}
                                        />
                                    )}
                            <button disabled={loading} type="submit">ĐĂNG KÝ NGAY</button>
                        </form>
                        <div className="S_footer-policies">
                            <ul>
                                <div>
                                    <li><a href="#modal-1">Chính sách vận chuyển</a></li>
                                    <li><a href="#modal-2">Chính sách bảo hành</a></li>
                                    <li><a href="#modal-3">Chính sách bảo mật</a></li>
                                </div>
                                <div>
                                    <li><a href="#modal-4">Chính sách đổi trả & hoàn tiền</a></li>
                                    <li><a href="#modal-5">Hình thức thanh toán</a></li>
                                    <li><a href="#modal-6">Điều khoản sử dụng</a></li>
                                </div>

                            </ul>
                        </div>

                    </div>
                </div>
                <div id="modal-1" className="S_footer_container-modal">
                    <div className="S_footer_container-modal-content">
                        <div className="S_footer_container-modal-header">
                            <h2>Chính sách vận chuyển và giao nhận</h2>
                            <a href="#close" className="close-btn">&times;</a>
                        </div>
                        <div className="S_footer_container-modal-body">
                            <p>Do sản phẩm của BAEXPRESS liên quan nhiều đến các dịch vụ kỹ thuật như tư vấn, triển khai
                                lắp đặt, đấu ghép hệ thống, lập trình hệ thống, bảo hành, bảo trì…nên các chi phí về
                                giao nhận vận chuyển đều được thoả thuận trước giữa BAEXPRESS và khách hàng. <br />
                                - Thông thường sau khi nhận được thông tin đặt hàng chúng tôi sẽ xử lý đơn hàng trong
                                vòng 24h và phản hồi lại thông tin cho khách hàng về việc thanh toán và giao nhận. Thời
                                gian giao hàng thường trong khoảng từ 3-5 ngày kể từ ngày chốt đơn hàng hoặc theo thỏa
                                thuận với khách khi đặt hàng. <br />
                                - Về phí vận chuyển, chúng tôi sử dụng dịch vụ vận chuyển ngoài nên cước phí vận chuyển
                                sẽ được tính theo phí của các đơn vị vận chuyển tùy vào vị trí và khối lượng của đơn
                                hàng, khi liên hệ lại xác nhận đơn hàng với khách sẽ báo mức phí cụ thể cho khách hàng. <br />
                                - Đối với Quý khách hàng ở tỉnh có nhu cầu mua số lượng lớn hoặc khách buôn sỉ nếu có
                                nhu cầu mua sản phẩm, chúng tôi sẽ nhờ dịch vụ giao nhận của các công ty vận chuyển và
                                phí sẽ được tính theo phí của các đơn vị cung cấp dịch vụ vận chuyển hoặc theo thoản
                                thuận hợp đồng giữa 2 bên. <br />
                                - Đối với hàng có trị giá lớn chúng tôi tiến hành đóng dấu, niêm phong, chụp ảnh lại
                                cách thức hàng hóa đã được đóng gói niêm phong và gửi cho người mua hàng để tiện kiểm
                                tra khi nhận hàng dễ dàng cho Quý khách hàng có thể kiểm tra và chứng minh rằng hàng
                                không bị thay đổi nội dung khi vận chuyển, đồng thời thông báo cho người mua thời gian
                                dự kiến hàng sẽ tới tay người mua hàng, như vậy người mua hàng sẽ yên tâm rằng hàng hoá
                                đã được giao và chuẩn bị, thu xếp nhận hàng sớm. <br />
                                - Quý khách vui lòng trực tiếp kiểm tra kỹ hàng hoá ngay khi nhận hàng từ người chuyển
                                phát hàng hoá, nếu có vấn đề liên quan tới việc chúng loại, chất lượng, số lượng hàng
                                hoá không đúng như trong đơn đặt hàng, niêm phong đã bị thay đổi, thì Quý khách hãy lập
                                biên bản ngay khi nhận hàng với đơn vị hoặc người chuyển phát và thông báo ngay cho
                                BAEXPRESS để cùng phối hợp đơn vị chuyển phát hàng hóa xử lý. <br />
                                - Trong mọi trường hợp như vậy, Quý khách không phải chịu bất kì trách nhiệm nào liên
                                quan tới việc hàng hoá bị thay đổi, thất lạc, không đảm bảo về chất lượng và đủ số lượng
                                trong quá trình vận chuyển hàng hoá tới địa điểm nhận hàng của Quý khách. <br />
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
                <div id="modal-2" className="S_footer_container-modal">
                    <div className="S_footer_container-modal-content">
                        <div className="S_footer_container-modal-header">
                            <h2>Chính sách bảo hành</h2>
                            <a href="#close" className="S_close-btn">&times;</a>
                        </div>
                        <div className="S_footer_container-modal-body">
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
                <div id="modal-3" className="S_footer_container-modal">
                    <div className="S_footer_container-modal-content">
                        <div className="S_footer_container-modal-header">
                            <h2>Chính sách bảo mật</h2>
                            <a href="#close" className="S_close-btn">&times;</a>
                        </div>
                        <div className="S_footer_container-modal-body">
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

                <div id="modal-4" className="S_footer_container-modal">
                    <div className="S_footer_container-modal-content">
                        <div className="S_footer_container-modal-header">
                            <h2>Chính sách đổi trả & hoàn tiền</h2>
                            <a href="#close" className="S_close-btn">&times;</a>
                        </div>
                        <div className="S_footer_container-modal-body">
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
                <div id="modal-5" className="S_footer_container-modal">
                    <div className="S_footer_container-modal-content">
                        <div className="S_footer_container-modal-header">
                            <h2>Hình thức thanh toán</h2>
                            <a href="#close" className="S_close-btn">&times;</a>
                        </div>
                        <div className="S_footer_container-modal-body">
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
                <div id="modal-6" className="S_footer_container-modal">
                    <div className="S_footer_container-modal-content">
                        <div className="S_footer_container-modal-header">
                            <h2>Điều khoản sử dụng</h2>
                            <a href="#close" className="S_close-btn">&times;</a>
                        </div>
                        <div className="S_footer_container-modal-body">
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
            </footer>
            {/* <!-- end footer --> */}
        </div>
    )
}
export default LandingPageStaxi