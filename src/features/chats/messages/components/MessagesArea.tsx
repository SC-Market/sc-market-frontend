import { Box, Stack, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useCurrentChat } from "../../hooks/CurrentChat"
import React, { RefObject, useEffect } from "react"
import type { Message } from "../../domain/types"
import { MessageEntry2 } from "./MessageEntry2"

export function MessagesArea(props: {
  messages: Message[]
  messageBoxRef: RefObject<HTMLDivElement | null>
  maxHeight?: number
  inputAreaHeight?: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { messageBoxRef, inputAreaHeight } = props
  const [chat] = useCurrentChat()

  useEffect(() => {
    const currentRef = messageBoxRef.current
    if (currentRef) {
      currentRef.scrollTop = currentRef.scrollHeight
    }
  }, [messageBoxRef, chat, props.messages])

  const { messages } = props
  return (
    <React.Fragment>
      <Box
        ref={messageBoxRef}
        sx={{
          flexGrow: 1,
          width: "100%",
          padding: { xs: 1.5, sm: 2 },
          paddingBottom: { xs: 2, sm: 2 },
          borderColor: theme.palette.outline.main,
          boxSizing: "border-box",
          borderWidth: 0,
          borderStyle: "solid",
          overflow: "auto",
          maxHeight: props.maxHeight,
          WebkitOverflowScrolling: "touch",
          minHeight: 0,
          flex: 1,
          marginBottom:
            isMobile && inputAreaHeight ? `${inputAreaHeight}px` : 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack spacing={theme.layoutSpacing.compact}>
          {messages.map((message: Message) => (
            <MessageEntry2 message={message} key={`${message.timestamp}-${message.author}-${message.content.substring(0, 20)}`} />
          ))}
        </Stack>
        <div ref={props.messageBoxRef} />
      </Box>
    </React.Fragment>
  )
}
