import React, { useState } from 'react'
import { Tabs, Typography, Button, Popover, Tag, Flex } from 'antd'

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LeftOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import { NERSection } from './NERSection'
import { TopicModelSection } from './TopicModelSection'
import { EntitiesNERSelection } from './EntitiesNERSelection'
const { Title, Paragraph } = Typography

const allOptionsList = [
  'COURT',
  'PETITIONER',
  'RESPONDENT',
  'JUDGE',
  'LAWYER',
  'DATE',
  'ORGANIZATION',
  'GPE',
  'STATUE',
  'PRECEDENT',
  'CASE_NUMBER',
  'WITNESS',
  'OTHER_PERSON'
]

export const DocumentView = ({
  document,
  setSelectedDocumentIndex,
  currentDocumentIndex,
  lastDocumentIndex,
  selectedTopics
}) => {
  const [selectedTab, setSelectedTab] = useState('NER')

  // ner entities
  const [checkedList, setCheckedList] = useState(allOptionsList)

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
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <EntitiesNERSelection
            allOptionsList={allOptionsList}
            checkedList={checkedList}
            setCheckedList={setCheckedList}
          />
          <NERSection text={document.body} entitiesList={checkedList} />
        </div>
      )
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
            direction: 'row',
            alignItems: 'center'
          }}
        >
          {selectedTopics.length > 0 && (
            <Popover
              placement='leftBottom'
              title={'Filtered Topics'}
              content={
                <Flex
                  gap='4px 0'
                  wrap='wrap'
                  style={{
                    maxWidth: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    margin: '12px 20px'
                  }}
                >
                  {selectedTopics.map((topic, index) => {
                    return (
                      <Tag key={index} bordered={false} color={topic.value}>
                        {topic.label}
                      </Tag>
                    )
                  })}
                </Flex>
              }
            >
              <Button>
                <UnorderedListOutlined />
                Now Browsing
              </Button>
            </Popover>
          )}
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
