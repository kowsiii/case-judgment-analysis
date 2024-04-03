import React from 'react'
import { Checkbox, Collapse } from 'antd'

export const EntitiesNERSelection = ({
  allOptionsList,
  checkedList,
  setCheckedList
}) => {
  const checkAll = allOptionsList.length === checkedList.length

  const onChange = (checkedValues) => {
    setCheckedList(checkedValues)
  }
  const onCheckAllChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCheckedList(e.target.checked ? allOptionsList : [])
  }

  return (
    <>
      <Collapse
        defaultActiveKey={['metadata']}
        bordered={false}
        items={[
          {
            key: 'metadata',
            label: (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <h3
                  style={{
                    margin: 4
                  }}
                >
                  Entity labels
                </h3>
                <Checkbox onChange={onCheckAllChange} checked={checkAll}>
                  Check all
                </Checkbox>
              </div>
            ),
            children: (
              <Checkbox.Group
                value={checkedList}
                style={{
                  width: '100%',
                  gap: '0.25em'
                }}
                onChange={onChange}
              >
                <Checkbox
                  value='COURT'
                  style={{
                    background: '#FFB6C1',
                    padding: '0.45em 0.6em',
                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>COURT</b>
                </Checkbox>

                <Checkbox
                  value='PETITIONER'
                  style={{
                    background: '#FFDAB9',
                    padding: '0.45em 0.6em',
                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>PETITIONER</b>
                </Checkbox>

                <Checkbox
                  value='RESPONDENT'
                  style={{
                    background: '#FFA07A',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>RESPONDENT</b>
                </Checkbox>

                <Checkbox
                  value='JUDGE'
                  style={{
                    background: '#FFC0CB',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>JUDGE</b>
                </Checkbox>

                <Checkbox
                  value='LAWYER'
                  style={{
                    background: '#FFDEAD',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>LAWYER</b>
                </Checkbox>

                <Checkbox
                  value='DATE'
                  style={{
                    background: '#F0E68C',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>DATE</b>
                </Checkbox>

                <Checkbox
                  value='ORGANIZATION'
                  style={{
                    background: '#FF69B4',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>ORGANIZATION</b>
                </Checkbox>

                <Checkbox
                  value='GPE'
                  style={{
                    background: '#20B2AA',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>GPE</b>
                </Checkbox>

                <Checkbox
                  value='STATUE'
                  style={{
                    background: '#87CEFA',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>STATUE</b>
                </Checkbox>

                <Checkbox
                  value='PRECEDENT'
                  style={{
                    background: '#ADD8E6',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>PRECEDENT</b>
                </Checkbox>

                <Checkbox
                  value='CASE_NUMBER'
                  style={{
                    background: '#B0E0E6',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>CASE_NUMBER</b>
                </Checkbox>

                <Checkbox
                  value='WITNESS'
                  style={{
                    background: '#87CEEB',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>WITNESS</b>
                </Checkbox>

                <Checkbox
                  value='OTHER_PERSON'
                  style={{
                    background: '#AFEEEE',
                    padding: '0.45em 0.6em',

                    lineHeight: 1,
                    borderRadius: '0.35em',
                    fontSize: 12,
                    alignItems: 'center'
                  }}
                >
                  <b>OTHER_PERSON</b>
                </Checkbox>
              </Checkbox.Group>
            )
          }
        ]}
      />
    </>
  )
}
