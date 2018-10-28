import React from 'react';
/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
const Loading = (props) => {
    return (
         <div className="loading__wrapper">
            <div className="loading_inner">
                <img className="loading__logo" src={ QBLogo } alt="QB_logo" />
                <p className="loading__description">Loading...</p>
            </div>
        </div>
    );
}
export default Loading;