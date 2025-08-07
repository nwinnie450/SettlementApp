import React from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px' }}>
      {/* Simple Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          margin: '0 auto 12px', 
          borderRadius: '50%', 
          backgroundColor: '#14b8a6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h2v4H7V6zm2 6H7v2h2v-2zm2-6h2v2h-2V6zm2 4h-2v2h2v-2zm2-4h2v2h-2V6zm0 4h2v2h-2v-2z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1f2937', marginBottom: '12px' }}>GroupSettle</h1>
        <p style={{ fontSize: '20px', color: '#6b7280', fontWeight: '300' }}>Less stress when sharing expenses</p>
      </div>

      {/* Simple Feature List */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#ccfbf1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '16px'
          }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#14b8a6' }}></div>
          </div>
          <p style={{ color: '#374151', fontSize: '16px' }}>Track balances</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#ccfbf1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '16px'
          }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#14b8a6' }}></div>
          </div>
          <p style={{ color: '#374151', fontSize: '16px' }}>Settle up</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#ccfbf1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '16px'
          }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#14b8a6' }}></div>
          </div>
          <p style={{ color: '#374151', fontSize: '16px' }}>Stay friends</p>
        </div>
      </div>

      {/* CTA */}
      <div>
        <button
          onClick={() => navigate('/create-group')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '500',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
        >
          Get started
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          onMouseOver={(e) => e.target.style.color = '#374151'}
          onMouseOut={(e) => e.target.style.color = '#6b7280'}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;