import { useEffect, useState } from 'react'
import axios from 'axios'
import { Divider, Tag } from 'antd'
import { Loading } from './Loading'
import topicColors from './assets/topicColors.json'

export const TopicModelSection = ({ document }) => {
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [dominantTopic, setDominantTopic] = useState(null)
  const [summary, setSummary] = useState(null)

  const loadTopicModel = async () => {
    try {
      setIsLoadingTopics(true)
      const res = await axios.post('/api/predicted-topic', {
        header: document.header,
        body: document.body
      })
      if (res.status !== 200) {
        return console.error('Failed to fetch predicted topic')
      }

      setDominantTopic(res.data.predicted_topic)

      // Deprecated: LDA Model - topic distributions and dominant topic
      // const res = await axios.post('/api/document-topic-distribution', {
      //   header: document.header,
      //   body: document.body
      // })
      // if (res.status !== 200) {
      //   return console.error('Failed to fetch topic distribution')
      // }
      // const topicsCopy = [...res.data.topics]
      // topicsCopy.sort((a, b) => {
      //   const aValue = Object.values(a)[0]
      //   const bValue = Object.values(b)[0]
      //   return bValue - aValue
      // })
      // setTopicDistribution(topicsCopy)
      // setDominantTopic(res.data.dominant_topic)
      
    } catch (e) {
      return console.error(
        'Internal server error: Failed to fetch predicted topic',
        e
      )
    } finally {
      setIsLoadingTopics(false)
    }
  }

  const summariseText = async () => {
    try {
      setIsLoadingSummary(true)

      const res = await axios.post('/api/enhanced-summarise', {
        text: document.body
      })

      if (res.status !== 200) {
        return console.error('Failed to fetch summary')
      }
      setSummary(res.data.summary)
    } catch (e) {
      return console.error('Internal server error: Failed to fetch summary', e)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  useEffect(() => {
    loadTopicModel()
    summariseText()
  }, [document])

  return (
    <>
      {isLoadingTopics || !dominantTopic ? (
        <Loading />
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8
            }}
          >
            <h5
              style={{
                marginTop: 12,
                marginBottom: 12
              }}
            >
              Predicted Topic:
            </h5>
            <Tag bordered={false} color={topicColors[dominantTopic]}>
              {dominantTopic}
            </Tag>
          </div>
          <Divider />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}
      >
        <h5
          style={{
            marginTop: 12,
            marginBottom: 12
          }}
        >
          Summary
        </h5>

        {isLoadingSummary || !summary ? (
          <Loading />
        ) : (
          <p
            style={{
              textAlign: 'start',
              fontSize: 14
            }}
          >
            {summary}
          </p>
        )}
      </div>
    </>
  )
}
