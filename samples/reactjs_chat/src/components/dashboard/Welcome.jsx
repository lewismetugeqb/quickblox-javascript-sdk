import React from 'react';

const Welcome = () => {
    return (
        <div className="content j-content">
            <div className="content__title j-content__title j-welcome">Welcome to QuickBlox chat sample!</div>
            <div className="notifications j-notifications hidden"></div>
            <div className="content__inner j-content__inner">
                <div className="welcome__message">
                    <p>Please select you opponent to start chatting.</p>
                </div>
            </div>
        </div>
    );
}
export default Welcome;