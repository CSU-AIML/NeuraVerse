import React from 'react';
import styled from 'styled-components';

const FullScreenLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; // Highest z-index to ensure it's on top of everything
  backdrop-filter: blur(4px);

  .loader {
    width: 96px;
    height: 96px;
    position: relative;
  }

  .box1,
  .box2,
  .box3 {
    border: 12px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
    position: absolute;
    display: block;
  }

  .box1 {
    width: 96px;
    height: 40px;
    margin-top: 56px;
    margin-left: 0px;
    animation: abox1 2.5s 0.3s infinite ease-in-out;
  }

  .box2 {
    width: 40px;
    height: 40px;
    margin-top: 0px;
    margin-left: 0px;
    animation: abox2 2.5s 0.3s infinite ease-in-out;
  }

  .box3 {
    width: 40px;
    height: 40px;
    margin-top: 0px;
    margin-left: 56px;
    animation: abox3 2.5s 0.3s infinite ease-in-out;
  }

  .loading-text {
    color: white;
    font-size: 1rem;
    margin-top: 16px;
    opacity: 0.8;
  }

  @keyframes abox1 {
    0%, 12.5%, 25%, 37.5%, 50%, 62.5% {
      width: 96px;
      height: 40px;
      margin-top: 56px;
      margin-left: 0px;
    }
    75% {
      width: 40px;
      height: 96px;
      margin-top: 0px;
      margin-left: 0px;
    }
    87.5%, 100% {
      width: 40px;
      height: 40px;
      margin-top: 0px;
      margin-left: 0px;
    }
  }

  @keyframes abox2 {
    0%, 12.5%, 25%, 37.5% {
      width: 40px;
      height: 40px;
      margin-top: 0px;
      margin-left: 0px;
    }
    50% {
      width: 96px;
      height: 40px;
      margin-top: 0px;
      margin-left: 0px;
    }
    62.5%, 75%, 87.5%, 100% {
      width: 40px;
      height: 40px;
      margin-top: 0px;
      margin-left: 56px;
    }
  }

  @keyframes abox3 {
    0%, 12.5% {
      width: 40px;
      height: 40px;
      margin-top: 0px;
      margin-left: 56px;
    }
    25% {
      width: 40px;
      height: 96px;
      margin-top: 0px;
      margin-left: 56px;
    }
    37.5%, 50%, 62.5%, 75%, 87.5% {
      width: 40px;
      height: 40px;
      margin-top: 56px;
      margin-left: 56px;
    }
    100% {
      width: 96px;
      height: 40px;
      margin-top: 56px;
      margin-left: 0px;
    }
  }
`;

const Loader: React.FC = () => {
  return (
    <FullScreenLoader>
      <div className="flex flex-col items-center justify-center">
        <div className="loader">
          <div className="box1" />
          <div className="box2" />
          <div className="box3" />
        </div>
        <p className="loading-text">Loading Projects...</p>
      </div>
    </FullScreenLoader>
  );
};

export default Loader;