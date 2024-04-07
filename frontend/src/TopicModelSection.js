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

      // used as comparison
      const oldRes = await axios.post('/api/summarise', {
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
            {/* <Tooltip title={dominantTopic['Probability']}>
              <Tag
                bordered={false}
                color={topicColors[dominantTopic['Dominant Topic']]}
              >
                {dominantTopic['Dominant Topic']}
              </Tag>
            </Tooltip> */}
            <Tag bordered={false} color={topicColors[dominantTopic]}>
              {dominantTopic}
            </Tag>
          </div>
          {/* <div
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
                marginTop: 24,
                marginBottom: 24
              }}
            >
              Topics:
            </h5>
            <Flex gap='4px 0' wrap='wrap'>
              {topicDistribution.map((topic, index) => {
                return (
                  <Tooltip title={Object.values(topic)[0]} key={index}>
                    <Tag
                      bordered={false}
                      color={topicColors[Object.keys(topic)[0]]}
                    >
                      {Object.keys(topic)[0]}
                    </Tag>
                  </Tooltip>
                )
              })}
            </Flex>
          </div> */}
          {/* <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8
            }}
          >
            <InfoCircleOutlined style={{ color: '#d3d3d3', fontSize: 12 }} />
            <span
              style={{
                fontSize: 12,
                opacity: 0.5
              }}
            >
              Hover tags to see probability distribution
            </span>
          </div> */}
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
