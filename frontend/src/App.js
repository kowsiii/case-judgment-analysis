import React, { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')

  const summarizeDocument = () => {
    fetch('http://127.0.0.1:5000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ document: inputText })
    })
      .then((response) => response.json())
      .then((data) => {
        setOutputText(data.summary)
      })
      .catch((error) => console.error('Error:', error))
  }

  // const testGet = () => {
  //   fetch('http://127.0.0.1:5000/')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setOutputText(data.summary)
  //     })
  //     .catch((error) => console.error('Error:', error))
  // }

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Document Summarizer</h1>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Enter your document here...'
        />
        <button onClick={summarizeDocument}>Summarize</button>
        {/* <button onClick={() => testGet()}>Test get</button> */}
        <div>
          <h2>Summary:</h2>
          <p>{outputText}</p>
        </div>
      </header>
    </div>
  )
}

export default App
