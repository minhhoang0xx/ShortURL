import React from "react";
import Header from "../HeaderFooterComponents/header";
import Footer from "../HeaderFooterComponents/footer";

    const DefaultComponent = ({children}) =>{
    return (
        <div> 
            <Header/>
            {children}
            <Footer/>
        </div>
        )
}
 export default DefaultComponent