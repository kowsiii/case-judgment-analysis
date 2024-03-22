import React, { useState } from 'react'
import './App.css'
import EvaluationMetrics from './EvaluationMetrics'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [documentData, setDocumentData] = useState([])
  const [evaluationMetrics, setEvaluationMetrics] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
    if (!file) {
      console.log('No file selected')
      return
    }
  }

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first!')
      return
    }
    const formData = new FormData()
    formData.append('file', selectedFile, 'example_text.txt')

    setIsLoading(true)
    try {
      fetch('http://127.0.0.1:5000/summarize', {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          setDocumentData(data.summary)
          setEvaluationMetrics(data.evaluation)
        })
        .catch((error) => console.error('Error:', error))
        .finally(() => setIsLoading(false))
    } catch {
      alert('Internal server error!')
    }
  }

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Legal Document Summarizer</h1>
      </header>
      <div className='input-div'>
        <input
          disabled={isLoading}
          type='file'
          id='file-upload'
          onChange={handleFileChange}
        />
        <button disabled={isLoading} onClick={handleFileUpload}>
          Summarise Document
        </button>
      </div>

      {isLoading ? (
        <div className='loader-container'>
          <div className='spinner-container'>
            <div className='spinner'></div>
          </div>
          <p className='loading-text'>Summarizing document...</p>{' '}
        </div>
      ) : documentData.length > 0 ? (
        <>
          <EvaluationMetrics evaluation={evaluationMetrics} />
          <div className='content'>
            <div className='column full-document'>
              <div className='row'>
                <div className='half-screen'>
                  <h3>Original Text</h3>
                </div>
                <div className='half-screen'>
                  <h3>Summarised Text</h3>
                </div>
              </div>
              {documentData.map((item, index) => (
                <div key={`${index}-original`} className='row'>
                  <div key={index} className='half-screen'>
                    {item.original_text}
                  </div>

                  {item.summarised_text && (
                    <div
                      key={`${index}-summarized`}
                      className='summary half-screen'
                    >
                      {item.summarised_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default App
