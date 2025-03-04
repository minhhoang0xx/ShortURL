import React from "react";
import Header from "../header.js";
import Footer from "../footer.js";

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
