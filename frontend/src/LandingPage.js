import React from 'react'
import { BookFlippingAnimation } from './BookFlippingAnimation'
import './App.css'

const LandingPage = ({ setAppState }) => {
  return (
    <div className='landingPage'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          textAlign: 'left',
          color: 'white',
          padding: '0 5vw'
        }}
      >
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: '900',
            margin: '0.5rem 0',
            lineHeight: '1.2'
          }}
        >
          Legal Case Judgment Analyzer
        </h1>
        <p
          style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            margin: '1rem 0',
            maxWidth: '800px',
            lineHeight: '1.4'
          }}
        >
          Streamline legal analysis with machine learning: <br />
          <b style={{ textDecoration: 'underline' }}>
            Entity Recognition, Topic Modeling, and Summarization
          </b>
          <br />
          in one application
        </p>
        <button
          style={{
            fontSize: '1rem',
            padding: '20px 50px',
            borderRadius: '40px',
            border: 'none',
            cursor: 'pointer',
            background: 'white',
            color: '#2F80ED',
            marginTop: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            transition: 'background-color 0.3s, transform 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#032b70' // Change button color on hover
            e.target.style.color = 'white' // Change text color on hover
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'white' // Revert button color on mouse out
            e.target.style.color = '#032b70' // Revert text color on mouse out
          }}
          onClick={() => {
            setAppState('main')
          }}
        >
          Get Started
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          textAlign: 'left',
          color: 'white'
        }}
      >
        <BookFlippingAnimation height={400} width={400} />
      </div>
    </div>
  )
}
export default LandingPage
