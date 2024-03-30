import React, { useEffect, useMemo, useState } from 'react'
import './App.css'
import axios from 'axios'
import { CalendarOutlined, BookOutlined, BankOutlined } from '@ant-design/icons'
import { Menu, Select } from 'antd'
import { DocumentsSelection } from './DocumentsSelection'
import { Loading } from './Loading'

function App() {
  const [isLoadingApp, setIsLoadingApp] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedYearCourtType, setSelectedYearCourtType] = useState([])
  const [openedMenuKeys, setOpenedMenuKeys] = useState([])
  const [visibleOptions, setVisibleOptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [urlData, setUrlData] = useState([])
  const [documentsByUrl, setDocumentsByUrl] = useState({})

  useEffect(() => {
    getUniqueUrlIds()
  }, [])

  const transformUrlData = useMemo(() => {
    const yearKeys = Object.keys(urlData).sort().reverse()
    const transformedData = yearKeys.map((year) => ({
      key: year,
      label: year,
      icon: <CalendarOutlined />,
      children: Object.keys(urlData[year]).map((courtType) => ({
        key: `${year}_${courtType}`,
        label: courtType,
        icon: <BankOutlined />,
        children: urlData[year][courtType].map((url, index) => ({
          key: url.split('/').pop(),
          label: url.split('/').pop(),
          url: url,
          icon: <BookOutlined />
        }))
      }))
    }))

    return transformedData
  }, [urlData])

  const searchOptions = Object.keys(urlData).flatMap((year) =>
    Object.keys(urlData[year]).flatMap((courtType) =>
      urlData[year][courtType].flatMap((url) => ({
        value: url,
        label: url.split('/').pop().replace(/_/g, ' ')
      }))
    )
  )

  const onOpenChange = (keys) => {
    const latestKey = keys.find((key) => !openedMenuKeys.includes(key))
    const wasClosed = openedMenuKeys.find((key) => !keys.includes(key))

    if (latestKey) {
      setOpenedMenuKeys((prevKeys) => [...prevKeys, latestKey])
    } else if (wasClosed) {
      setOpenedMenuKeys((prevKeys) =>
        prevKeys.filter((key) => key !== wasClosed)
      )
    }
  }

  // get unique url_ids list from backend
  const getUniqueUrlIds = async () => {
    try {
      const res = await axios.get('/api/unique-url-ids')
      if (res.status !== 200) {
        return console.error('Failed to fetch unique url ids')
      }
      setUrlData(res.data)
    } catch (e) {
      return console.error(
        'Internal server error: Failed to fetch unique url ids',
        e
      )
    } finally {
      setIsLoadingApp(false)
    }
  }

  const getDocuments = async (url) => {
    try {
      setIsLoading(true)
      const res = await axios.get('/api/documents-by-url', {
        params: {
          url: url
        }
      })

      // Prepare to fetch topic models for each document
      const fetchTopicPromises = Object.values(res.data).map(
        async (document) => {
          console.log('fetchTopicPromises')
          try {
            const topicRes = await axios.post(
              '/api/document-topic-distribution',
              {
                header: document.header,
                body: document.body
              }
            )

            if (topicRes.status === 200) {
              const topicsCopy = [...topicRes.data.topics]
              topicsCopy.sort((a, b) => {
                const aValue = Object.values(a)[0]
                const bValue = Object.values(b)[0]
                return bValue - aValue
              })

              // Append the topics and dominant topic to the document object
              document.topics = topicsCopy
              document.dominantTopic = topicRes.data.dominant_topic
            }
          } catch (e) {
            console.error(
              'Failed to fetch topic distribution for a document',
              e
            )
            // Optionally handle the error more gracefully
          }
        }
      )

      await Promise.all(fetchTopicPromises)

      setDocumentsByUrl(res.data)
      console.log('res.data with topics', res.data)
    } catch (e) {
      return console.error(
        'Internal server error: Failed to fetch documents',
        e
      )
    } finally {
      setIsLoading(false)
    }
  }

  const onClick = (e) => {
    const selectedUrl = e.item.props.url
    getDocuments(selectedUrl)
    setSelectedYearCourtType([e.key])
  }

  useEffect(() => {
    const filterAndLimitOptions = (input) => {
      return searchOptions
        .filter((option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 20) // Limit to 20 options
    }
    if (searchTerm !== '') setVisibleOptions(filterAndLimitOptions(searchTerm))
  }, [searchTerm])

  const selectDocument = (value, option) => {
    const [year, courtType] = option.label.split(' ')
    const openedKeys = []
    openedKeys.push(`${year}_${courtType}`)
    openedKeys.push(year)
    setOpenedMenuKeys(openedKeys)
    setSelectedYearCourtType([option.value.split('/').pop()])
    getDocuments(value)
  }

  if (isLoadingApp)
    return (
      <div className='App'>
        <div
          style={{
            margin: 'auto'
          }}
        >
          <Loading />
        </div>
      </div>
    )
  return (
    <div className='App'>
      <div
        style={{
          textAlign: 'left',
          position: 'fixed',
          overflowY: 'scroll',
          height: '100vh'
        }}
      >
        <div
          style={{
            padding: 18,
            borderRight: '1px solid rgba(5, 5, 5, 0.06)'
          }}
        >
          <Select
            showSearch
            size='large'
            style={{
              width: '100%'
            }}
            placeholder='Search Document'
            filterOption={false}
            optionFilterProp='children'
            onSearch={setSearchTerm}
            options={visibleOptions}
            onSelect={(value, option) => {
              selectDocument(value, option)
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1
          }}
        >
          <Menu
            onSelect={onClick}
            onOpenChange={onOpenChange}
            style={{
              minWidth: 256,
              width: 256,
              overflow: 'scroll'
            }}
            selectedKeys={selectedYearCourtType}
            openKeys={openedMenuKeys}
            mode='inline'
            items={transformUrlData}
          />
        </div>
      </div>
      <div
        className='app-body'
        style={{
          marginLeft: '256px',
          height: '100%',
          width: '100%'
        }}
      >
        {isLoading ? (
          <Loading />
        ) : Object.keys(documentsByUrl).length > 0 ? (
          <DocumentsSelection documents={documentsByUrl} />
        ) : (
          <div style={{ color: '#d3d3d3', marginTop: 64 }}>
            Select a document to get started!
          </div>
        )}
      </div>
    </div>
  )
}

export default App
