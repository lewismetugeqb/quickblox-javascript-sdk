import React, { Component } from 'react';

const LostConnection = (props) => {
    return (
         <div>
            <div class="titile">Waiting for network.</div>
            <div class="spinner">
                <img src="img/loader2.gif" alt="wating" />
            </div>
        </div>
    );
}
export default LostConnection;