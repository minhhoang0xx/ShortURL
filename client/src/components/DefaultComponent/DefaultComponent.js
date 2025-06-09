import React from "react";
import HeaderBar from "../HeaderFooterComponents/header";
import Footer from "../HeaderFooterComponents/footer";

    const DefaultComponent = ({children}) =>{
    return (
        <div> 
            <HeaderBar/>
            {children}
            {/* <Footer/> */}
        </div>
        )
}
 export default DefaultComponent