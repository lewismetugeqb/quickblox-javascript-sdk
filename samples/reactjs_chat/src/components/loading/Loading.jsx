import React, { Component } from 'react';
/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
const Loading = (props) => {
    return (
         <div class="loading__wrapper">
            <div class="loading_inner">
                <img class="loading__logo" src={ QBLogo } alt="QB_logo" />
                <p class="loading__description">Loading...</p>
            </div>
        </div>
    );
}
export default Loading;