import React, { useState } from 'react'
import { Tabs, Typography, Button } from 'antd'

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LeftOutlined
} from '@ant-design/icons'
import { NERSection } from './NERSection'
import { TopicModelSection } from './TopicModelSection'
const { Title, Paragraph } = Typography

export const DocumentView = ({
  document,
  setSelectedDocumentIndex,
  currentDocumentIndex,
  lastDocumentIndex
}) => {
  const [selectedTab, setSelectedTab] = useState('NER')

  const onChange = (key) => {
    setSelectedTab(key)
  }

  const onBackClick = () => {
    setSelectedDocumentIndex(null)
  }

  const onNextDocumentClick = () => {
    if (currentDocumentIndex + 1 <= lastDocumentIndex) {
      setSelectedDocumentIndex(currentDocumentIndex + 1)
    }
  }

  const onPrevDocumentClick = () => {
    if (currentDocumentIndex - 1 >= 0) {
      setSelectedDocumentIndex(currentDocumentIndex - 1)
    }
  }

  const items = [
    {
      key: 'NER',
      label: 'Named Entity Recognition',
      children: <NERSection text={document.body} />
    },
    {
      key: 'TM',
      label: 'Topic Model & Summarization',
      children: <TopicModelSection document={document} />
    }
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          direction: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Button
          icon={<LeftOutlined />}
          type='text'
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            margin: '12px 20px'
          }}
          onClick={onBackClick}
        >
          Back
        </Button>

        <div
          style={{
            display: 'flex',
            direction: 'row'
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            type='text'
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              margin: '12px 20px'
            }}
            onClick={onPrevDocumentClick}
            disabled={currentDocumentIndex === 0}
          >
            Previous Section
          </Button>
          <Button
            type='text'
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              margin: '12px 20px'
            }}
            onClick={onNextDocumentClick}
            disabled={currentDocumentIndex === lastDocumentIndex}
          >
            Next Section
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>
      <div
        style={{
          margin: 32
        }}
      >
        <div className='document-preview'>
          <Typography>
            <Title
              style={{
                fontSize: '32px',
                textAlign: 'start'
              }}
            >
              {document.header}
            </Title>
            <Paragraph
              style={{
                textAlign: 'start',
                maxHeight: '400px',
                backgroundColor: 'rgba(224, 224, 224, 0.25)',
                padding: 24,
                borderRadius: 12,
                overflow: 'scroll'
              }}
            >
              {document.body}
            </Paragraph>
          </Typography>
        </div>
        <div
          className='document-analysis'
          style={{
            marginTop: 24,
            minHeight: '400px'
          }}
        >
          <Tabs activeKey={selectedTab} items={items} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
