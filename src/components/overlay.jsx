import React from 'react';

const Overlay = ({ exited = false }) => {
  return (
    <div className="overlay"
         style={{
           position: 'absolute',
           top: 0,
           left: 0,
           width: '100%',
           height: '100%',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           opacity: exited ? 1 : 0,
           transition: 'opacity 2s ease-in',
           pointerEvents: exited ? 'auto' : 'none',
           zIndex: 10,
         }}>
      <div style={{
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        maxWidth: '600px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 20, 60, 0.7)',
        boxShadow: '0 0 20px rgba(40, 120, 255, 0.5)',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#4a9fff' }}>
          Welcome to My Portfolio
        </h1>
        <div style={{ width: '80%', height: '2px', background: 'linear-gradient(to right, transparent, #4a9fff, transparent)', margin: '1rem auto' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>      
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Derek Dailey</h2>
            <p style={{ fontSize: '1rem', color: '#cceeff', marginBottom: '0.5rem' }}>
              Computer Science Student at ASU
            </p>
            <p style={{ fontSize: '0.9rem', color: '#cceeff', marginBottom: '0.8rem' }}>
              <a href="mailto:derekdailey301@gmail.com" 
                 style={{ color: '#7aafff', textDecoration: 'none' }}
                 onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                 onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
                derekdailey301@gmail.com
              </a>
            </p>
            <p>
              I'm passionate about web development and creating interactive experiences.
              Welcome to my digital space!
            </p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(20, 40, 80, 0.4)', 
          padding: '15px', 
          borderRadius: '8px',
          margin: '1.5rem 0',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#4a9fff', marginBottom: '10px', fontSize: '1.4rem' }}>Featured Project</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>J. Miller Custom Cues</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                An e-commerce platform for custom billiard cues featuring product customization, 
                inventory management, and secure payment processing.
              </p>
              <p style={{ 
                fontSize: '0.85rem',
                color: '#ffcc66',
                fontStyle: 'italic' 
              }}>
                Coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;