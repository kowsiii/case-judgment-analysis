import React, { useEffect, useState } from 'react'
import { Card, Tag, Tooltip, Select, Collapse } from 'antd'
import { DocumentView } from './DocumentView'

const topicColors = {
  'Legal Agreement and Court Proceedings': 'magenta',
  "Audit Rights and Plaintiffs' Issues": 'red',
  'Court Decisions and Appeal Cases': 'volcano',
  'Enforcement Process and Court Decisions': 'orange',
  'Appeals and Legal Applications': 'gold',
  'Legal Proceedings and Sentencing': 'lime',
  "Plaintiffs' Claims and Court Proceedings": 'green',
  'Rights of Defendants and Plaintiffs': 'cyan',
  'Defendant Claims and Vessel Issues': 'blue',
  'Court Offences and Sentencing Issues': 'geekblue'
}

function DocumentCard({ document, index, onSelect }) {
  const bodyPreview =
    document.body.length > 400
      ? document.body.substring(0, 400) + '...'
      : document.body
  const { Meta } = Card
  return (
    <Card
      hoverable
      style={{
        margin: '12px 24px'
      }}
      onClick={() => onSelect(index)}
    >
      <Meta
        style={{
          textAlign: 'start'
        }}
        title={document.header}
        description={bodyPreview}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 14
        }}
      >
        <Tooltip title={document.dominantTopic['Probability']}>
          <Tag
            bordered={false}
            color={topicColors[document.dominantTopic['Dominant Topic']]}
          >
            {document.dominantTopic['Dominant Topic']}
          </Tag>
        </Tooltip>
      </div>
    </Card>
  )
}

export const DocumentsSelection = ({ documents, metadata }) => {
  const [filteredDocuments, setFilteredDocuments] = useState(documents)
  const [selectedTopics, setSelectedTopics] = useState([])

  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)

  const handleSelectDocument = (index) => {
    setSelectedDocumentIndex(index)
  }

  const collapseItems = [
    {
      key: 'metadata',
      label: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 4
          }}
        >
          <h3
            style={{
              margin: 4
            }}
          >
            Case Title:
          </h3>
          <p
            style={{
              margin: 4,
              fontSize: 16
            }}
          >
            {metadata?.caseTitle}
          </p>
        </div>
      ),
      children: (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 4
            }}
          >
            <h4
              style={{
                margin: '4px 8px'
              }}
            >
              Case ID:
            </h4>
            <p
              style={{
                margin: 4
              }}
            >
              {metadata?.caseId}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 4
            }}
          >
            <h4
              style={{
                margin: '4px 8px'
              }}
            >
              URL:
            </h4>
            <a href={metadata?.url} target='_blank' rel='noreferrer'>
              <p
                style={{
                  margin: 4
                }}
              >
                {metadata?.url}
              </p>
            </a>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 4
            }}
          >
            <h4
              style={{
                margin: '4px 8px'
              }}
            >
              Catchwords:
            </h4>
            <p
              style={{
                margin: 4,
                textAlign: 'start'
              }}
            >
              {metadata?.catchwords.map((catchword) => (
                <Tag color='#108ee9'>{catchword}</Tag>
              ))}
            </p>
          </div>
        </>
      )
    }
  ]

  console.log('metadata', metadata)

  useEffect(() => {
    if (selectedDocumentIndex !== null) {
      setSelectedDocument(filteredDocuments[selectedDocumentIndex])
    } else {
      setSelectedDocument(null)
    }
  }, [selectedDocumentIndex])

  const options = Object.keys(topicColors).map((topic) => {
    return {
      value: topicColors[topic],
      label: topic
    }
  })

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props
    const onPreventMouseDown = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    return (
      <Tag
        color={value}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginInlineEnd: 4,
          margin: 3
        }}
      >
        {label}
      </Tag>
    )
  }

  const handleChange = (selectedItems) => {
    setSelectedTopics(selectedItems)
  }

  // Effect to filter documents based on selected topics
  useEffect(() => {
    if (selectedTopics.length > 0) {
      const selectedTopicLabels = selectedTopics.map((item) => item.label)
      const filtered = Object.values(documents).filter((document) =>
        selectedTopicLabels.includes(document.dominantTopic['Dominant Topic'])
      )
      setFilteredDocuments(filtered)
    } else {
      setFilteredDocuments(documents)
    }
  }, [selectedTopics, documents])

  if (selectedDocument)
    return (
      <DocumentView
        document={selectedDocument}
        setSelectedDocumentIndex={setSelectedDocumentIndex}
        currentDocumentIndex={selectedDocumentIndex}
        lastDocumentIndex={Object.keys(filteredDocuments).length - 1}
        selectedTopics={selectedTopics}
      />
    )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'scroll',
        justifyContent: 'flex-start'
      }}
    >
      <Collapse
        defaultActiveKey={['metadata']}
        bordered={false}
        items={collapseItems}
        style={{
          alignItems: 'center',
          margin: '24px 24px'
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 32px',
          gap: 24
        }}
      >
        <h4
          style={{
            textAlign: 'start',
            flex: 1,
            display: 'flex',
            width: '100%',
            marginTop: 12,
            marginBottom: 12
          }}
        >
          Sections
        </h4>

        <Select
          defaultValue={selectedTopics}
          labelInValue
          allowClear
          mode='multiple'
          tagRender={tagRender}
          style={{
            width: '100%',
            textAlign: 'start'
          }}
          placeholder='Filter by Topics'
          options={options}
          onChange={handleChange}
        />
      </div>
      {Object.values(filteredDocuments).length > 0 ? (
        Object.values(filteredDocuments).map((document, index) => (
          <DocumentCard
            key={index}
            document={document}
            index={index}
            onSelect={handleSelectDocument}
          />
        ))
      ) : (
        <div
          style={{
            margin: 64,
            color: '#d3d3d3'
          }}
        >
          No sections found.
        </div>
      )}
    </div>
  )
}
