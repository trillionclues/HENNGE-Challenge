import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

interface RecipientsDisplayProps {
  recipients: string[]
}

export default function RecipientsDisplay({
  recipients,
}: RecipientsDisplayProps) {
  const [isTooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const [visibleRecipients, setVisibleRecipients] = useState<string>('')
  const [trimmedCount, setTrimmedCount] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0
    const updatedVisibleRecipients: string[] = []
    let currentWidth = 0
    let isFirstRecipientClipped = false

    recipients.forEach((recipient, index) => {
      const recipientWidth = measureTextWidth(recipient)

      if (index === 0) {
        if (recipientWidth > containerWidth) {
          updatedVisibleRecipients.push(clippedText(recipient, containerWidth))
          isFirstRecipientClipped = true
        } else {
          updatedVisibleRecipients.push(recipient)
          currentWidth += recipientWidth
        }
      } else if (currentWidth + recipientWidth <= containerWidth) {
        updatedVisibleRecipients.push(recipient)
        currentWidth += recipientWidth
      } else {
        setTrimmedCount(
          calculateTrimmedCount(
            recipients,
            updatedVisibleRecipients,
            isFirstRecipientClipped,
          ),
        )
        return
      }
    })

    const visibleText = isFirstRecipientClipped
      ? updatedVisibleRecipients[0]
      : updatedVisibleRecipients.join(', ')

    setVisibleRecipients(trimmedCount > 0 ? `${visibleText}, ...` : visibleText)
  }, [recipients, containerRef.current?.offsetWidth])

  // This calculates the text width measurement using canvas
  const measureTextWidth = (() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return () => 0
    context.font = '16px Arial'
    return (text: string): number => context.measureText(text).width
  })()

  //   While this trims the text to fit within the container width
  const clippedText = (text: string, maxWidth: number): string => {
    const ellipsis = '...'
    let width = measureTextWidth(ellipsis)
    let clippedText = ''

    for (let i = 0; i < text.length; i++) {
      width += measureTextWidth(text[i])
      if (width > maxWidth) break
      clippedText += text[i]
    }

    return `${clippedText}${ellipsis}`
  }

  const calculateTrimmedCount = (
    recipients: string[],
    updatedVisibleRecipients: string[],
    isFirstRecipientClipped: boolean,
  ): number => {
    return (
      recipients.length -
      (isFirstRecipientClipped ? 0 : 1) -
      updatedVisibleRecipients.length
    )
  }

  return (
    <Container ref={containerRef}>
      <FirstRecipient>{visibleRecipients || 'No recipients'}</FirstRecipient>
      {trimmedCount > 0 && (
        <RecipientsBadge
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          +{trimmedCount}
        </RecipientsBadge>
      )}
      {isTooltipVisible && <Tooltip>{recipients.join(', ')}</Tooltip>}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const FirstRecipient = styled.span`
  flex-shrink: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const RecipientsBadge = styled.div`
  background-color: #999;
  color: white;
  padding: 0 8px;
  border-radius: 12px;
  margin-left: 8px;
  cursor: pointer;
`

const Tooltip = styled.div`
  position: fixed;
  top: 8px;
  right: 8px;
  background-color: #666;
  color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  z-index: 10;
`
