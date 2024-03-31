import React, { useEffect, useMemo, useState } from 'react'
import './App.css'
import axios from 'axios'
import {
  CalendarOutlined,
  BookOutlined,
  BankOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FileSearchOutlined
} from '@ant-design/icons'
import { Menu, Select, Button } from 'antd'
import { DocumentsSelection } from './DocumentsSelection'
import { Loading } from './Loading'
import LandingPage from './LandingPage'
import { BookFlippingAnimation } from './BookFlippingAnimation'

function App() {
  const [appState, setAppState] = useState('landingPage') // landingPage or main
  const [isLoadingApp, setIsLoadingApp] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedYearCourtType, setSelectedYearCourtType] = useState([])
  const [openedMenuKeys, setOpenedMenuKeys] = useState([])
  const [visibleOptions, setVisibleOptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [urlData, setUrlData] = useState([])
  const [documentsByUrl, setDocumentsByUrl] = useState({})
  const [documentMetadata, setDocumentMetadata] = useState({})
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  useEffect(() => {
    if (appState === 'main') getUniqueUrlIds()
  }, [appState])

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
          key: url.split('/').pop().replace(/_/g, ' '),
          label: url.split('/').pop().replace(/_/g, ' '),
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
      setIsLoadingApp(false)
    } catch (e) {
      return console.error(
        'Internal server error: Failed to fetch unique url ids',
        e
      )
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

      const fetchDocumentMetadata = async () => {
        try {
          const metadataRes = await axios.get('/api/metadata-by-url', {
            params: {
              url: url
            }
          })
          if (metadataRes.status !== 200) {
            return console.error('Failed to fetch document metadata')
          }

          const regex = /\[([^\]]+)\]/g

          const matches = []
          let match
          while ((match = regex.exec(metadataRes?.data?.catchwords)) !== null) {
            matches.push(match[1].trim())
          }
          setDocumentMetadata({
            ...metadataRes.data,
            catchwords: matches
          })
        } catch (e) {
          return console.error(
            'Internal server error: Failed to fetch document metadata'
          )
        }
      }

      await fetchDocumentMetadata()
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

  if (appState === 'landingPage') {
    return <LandingPage setAppState={setAppState} />
  }

  if (isLoadingApp && appState === 'main')
    return (
      <div
        className='App'
        style={{
          background: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
          height: '100vh',
          width: '100vw'
        }}
      >
        <div
          style={{
            margin: 'auto'
          }}
        >
          <BookFlippingAnimation height={100} width={150} />
          <div className='pulse-text'>Initialising the app...</div>
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
            borderRight: '1px solid rgba(5, 5, 5, 0.06)'
          }}
        >
          <div
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              display: 'flex',
              justifyContent: collapsed ? 'center' : 'flex-end',
              width: '80%',
              margin: 'auto'
            }}
          >
            <Button ghost type='primary' onClick={toggleCollapsed}>
              {collapsed ? (
                <MenuUnfoldOutlined
                  style={{
                    fontSize: 16
                  }}
                />
              ) : (
                <MenuFoldOutlined
                  style={{
                    fontSize: 16
                  }}
                />
              )}
            </Button>
          </div>
          {collapsed ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 12,
                paddingBottom: 12
              }}
            >
              <FileSearchOutlined />
            </div>
          ) : (
            <Select
              showSearch
              size='large'
              style={{
                width: '80%',
                display: 'flex',
                margin: 'auto',
                justifyContent: 'center'
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
          )}
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
              width: collapsed ? 'auto' : 256,
              overflow: 'scroll'
            }}
            selectedKeys={selectedYearCourtType}
            openKeys={openedMenuKeys}
            mode='inline'
            items={transformUrlData}
            inlineCollapsed={collapsed}
          />
        </div>
      </div>
      <div
        className='app-body'
        style={{
          marginLeft: collapsed ? '80px' : '256px',
          height: '100%',
          width: '100%',
          transition: '0.5s ease-out'
        }}
      >
        {isLoading ? (
          <Loading />
        ) : Object.keys(documentsByUrl).length > 0 ? (
          <DocumentsSelection
            documents={documentsByUrl}
            metadata={documentMetadata}
          />
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
