import React, { useEffect, useState } from 'react'

import axios from 'axios'
import DOMPurify from 'dompurify'
import { Loading } from './Loading'

export const NERSection = ({ text, entitiesList }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [visualizationHtml, setVisualizationHtml] = useState('')

  useEffect(() => {
    if (text.length > 0) {
      analyzeText()
    }
  }, [text, entitiesList])

  const analyzeText = async () => {
    try {
      setIsLoading(true)
      const response = await axios.post('/api/ner', { text, entitiesList })
      const sanitizedHtml = DOMPurify.sanitize(response.data)
      setVisualizationHtml(sanitizedHtml)
    } catch (error) {
      console.error('Error fetching NER data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <Loading />

  return (
    <div
      style={{
        textAlign: 'start'
      }}
      dangerouslySetInnerHTML={{ __html: visualizationHtml }}
    />
  )
}
