import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as ShortUrlService from '../../services/ShortUrlService';
import "../ShortURL/style.css";

const RedirectPage = () => {
    const { alias } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const redirectToOriginalUrl = async () => {
            try {
                const response = await ShortUrlService.getLinkByAlias(alias);
                console.log("response", response)
                if (response) {
                    console.log("response", response)
                    window.location.href=response;
                } else {
                    navigate('*');
                }
            } catch (error) {
                console.error('Error redirecting:', error);
                navigate('*');
            }
        };
        redirectToOriginalUrl();
    }, [ alias, navigate]);

    return (
        <div>
            <h2>Đang chuyển hướng...</h2>
        </div>
    );
};

export default RedirectPage;
