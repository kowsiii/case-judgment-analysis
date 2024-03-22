import React, { useState } from 'react'
import './EvaluationMetrics.css' // Ensure this is still imported for styling

const MetricDescription = ({ text }) => {
  return <p className='metric-description'>{text}</p>
}

const MetricAccordion = ({ title, score, descriptions }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        className={`accordion ${isOpen ? 'active' : ''} title`}
        onClick={toggleAccordion}
      >
        {title}
      </button>
      <div className={`panel ${isOpen ? 'open' : ''}`}>
        <table className='metrics-table'>
          <tbody>
            <tr>
              <td>
                F1 Score:
                <MetricDescription text={descriptions.f1_score} />
              </td>
              <td>{score.f1_score.toFixed(3)}</td>
            </tr>
            <tr>
              <td>
                Precision:
                <MetricDescription text={descriptions.precision} />
              </td>
              <td>{score.precision.toFixed(3)}</td>
            </tr>
            <tr>
              <td>
                Recall:
                <MetricDescription text={descriptions.recall} />
              </td>
              <td>{score.recall.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

const descriptions = {
  rouge_1: {
    f1_score: 'The harmonic mean of precision and recall for unigrams.',
    precision:
      'The percentage of unigrams in the generated summary that are also in the reference summary.',
    recall:
      'The percentage of unigrams in the reference summary that are also in the generated summary.'
  },
  rouge_2: {
    f1_score: 'The harmonic mean of precision and recall for bigrams.',
    precision:
      'The percentage of bigrams in the generated summary that are also in the reference summary.',
    recall:
      'The percentage of bigrams in the reference summary that are also in the generated summary.'
  },
  rouge_l: {
    f1_score:
      'The harmonic mean of precision and recall for the longest common subsequence.',
    precision:
      'The percentage of the longest common subsequence in the generated summary that is also in the reference summary.',
    recall:
      'The percentage of the longest common subsequence in the reference summary that is also in the generated summary.'
  }
}

const EvaluationMetrics = ({ evaluation }) => {
  // State to manage dropdown visibility
  const [isOpen, setIsOpen] = useState(false)

  // Toggle function
  const toggleDropdown = () => setIsOpen(!isOpen)

  return (
    <div className='evaluation-container'>
      <div
        onClick={toggleDropdown}
        className='dropdown-header eval-header-text'
        aria-expanded={isOpen}
      >
        Evaluation Summary
      </div>

      <div className={`dropdown-content ${isOpen ? 'open' : ''}`}>
        {isOpen && (
          <div class='metrics-section'>
            {Object.entries(evaluation).map(([key, value]) => (
              <MetricAccordion
                key={key}
                title={`ROUGE-${key.split('_')[1]}`}
                score={value}
                descriptions={descriptions[key]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EvaluationMetrics
