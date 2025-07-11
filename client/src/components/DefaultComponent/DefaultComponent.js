import React from "react";
import HeaderBar from "../HeaderFooterComponents/header";
import Footer from "../HeaderFooterComponents/footer";

const DefaultComponent = ({ children, isShowHeader = true, isShowFooter = true }) => {
    return (
        <div>
            {isShowHeader && <HeaderBar />}
            {children}
            {isShowFooter && <Footer />}
        </div>
    )
}
export default DefaultComponent