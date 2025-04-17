import React from "react";
import "../ShortURL/style.css";
const NotFound = () =>{
    return (
        <div className="notFound-container">
            <div className="notFound-image">
                <img src="/LandingPageBAExpress/Not-found.png"></img>
            </div>
            <div className="notFound-title">
                <p>Rất tiếc đã có lỗi xảy ra.<br/> Xin vui lòng thử lại!</p>
            </div>
        </div>
        )
}
 export default NotFound