import React, { Component } from 'react';

const AttachmentPreview = (props) => {
    return (
         <div class="attachment_preview__wrap m-loading" id="<%= id %>">
            <img class="attachment_preview__item" src="<%= src %>" />
        </div>
    );
}
export default AttachmentPreview;