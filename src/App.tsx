import { Box, Button, HStack, Heading, Image, Text, VStack } from '@chakra-ui/react'
import { EmailIcon } from '@chakra-ui/icons'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pie, Line } from 'react-chartjs-2'
import Typewriter, { TypewriterClass, TypewriterState } from 'typewriter-effect'
import chatIotLogo from './assets/chat-iot-logo.png'
import qrImage from './assets/qr.png'
import { sendEvent } from './ga'
import 'chart.js/auto'

const CONTACT_US_LINK = 'mailto:info@omnia-network.com'

const ContactUsButton = () => {
  return (
    <Button
      leftIcon={<EmailIcon />}
      colorScheme='cyan'
      bg='cyan.500'
    >
      <a href={CONTACT_US_LINK}>Contact us</a>
    </Button>
  )
}

type Message = {
  content: string,
  additionalContent?: React.ReactNode,
  isUser: boolean,
  onTypingEnd?: () => void,
}

type MessagesProps = {
  messages: Message[],
}

const MessageElement: React.FC<Message> = ({ content, additionalContent, isUser, onTypingEnd }) => {
  const [showAdditionalContent, setShowAdditionalContent] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)

  const onInit = useCallback((typewriter: TypewriterClass) => {
    typewriter
      .typeString(content)
      .callFunction(() => {
        if (onTypingEnd) {
          if (additionalContent) {
            setTimeout(() => {
              setShowAdditionalContent(true)
            }, 200)
          }
          onTypingEnd()
        }
      })
      .start()
  }, [])

  useEffect(() => {
    if (messageRef?.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }, [messageRef?.current])

  if (isUser) {
    return (
      <HStack
        ref={messageRef}
        paddingBlock={4}
        paddingInline={{
          base: 2,
          md: 4,
        }}
        gap={{
          base: 2,
          md: 4,
        }}
        alignItems='flex-start'
      >
        <Box
          width={{
            base: 6,
            md: 8,
          }}
          height={{
            base: 6,
            md: 8,
          }}
          borderRadius='full'
          backgroundColor='orange.300'
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexShrink={0}
        >
          <Text
            color='black'
            fontSize={{
              base: 'xs',
              md: 'sm',
            }}
          >
            You
          </Text>
        </Box>
        <Text>{content}</Text>
      </HStack>
    )
  }

  return (
    <HStack
      ref={messageRef}
      paddingBlock={4}
      paddingInline={{
        base: 2,
        md: 4,
      }}
      gap={{
        base: 2,
        md: 4,
      }}
      alignItems='flex-start'
      backgroundColor='gray.700'
    >
      <Image
        width={{
          base: 6,
          md: 8,
        }}
        borderRadius='full'
        src={chatIotLogo}
        alt='Chat IoT logo'
      />
      <Box
        flexGrow={1}
      >
        <Typewriter
          onInit={onInit}
          options={{
            delay: 20,
            cursor: '',
            autoStart: true,
            loop: false,
          }}
        />
        {showAdditionalContent && (
          <Box
            marginBlock={2}
            marginInline={{
              base: 0,
              md: 'auto',
            }}
            maxWidth={{
              base: '100%',
              md: '70%',
            }}
            maxHeight={{
              base: 48,
              md: 72,
            }}
            textAlign='center'
          >
            {additionalContent}
          </Box>
        )}
      </Box>
    </HStack>
  )
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <Box
      width='100%'
    >
      {messages.map((message, index) => (
        <MessageElement
          key={index}
          {...message}
        />
      ))}
    </Box>
  )
}

const getTypedText = (state: TypewriterState) => {
  return state.elements.wrapper.innerHTML
}

const removeTypedText = (state: TypewriterState) => {
  state.elements.wrapper.innerHTML = ''
}

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [hideInput, setHideInput] = useState(false)
  const [searchParams,] = useSearchParams()
  const isLoop = useMemo(() => searchParams.get('loop') === 'true', [searchParams])
  const isQr = useMemo(() => searchParams.get('qr') === 'true', [searchParams])

  console.log(searchParams)

  const onInit = useCallback((typewriter: TypewriterClass) => {
    typewriter
      // user input
      .typeString('How long has the drilling machine been turned on without being operational?')
      .pauseFor(200)
      .callFunction((state) => {
        setIsLoading(true)

        const content = getTypedText(state)

        setMessages((prevMessages) => {
          if (prevMessages.findIndex((message) => message.content === content) !== -1) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              content,
              isUser: true,
            },
          ]
        })

        removeTypedText(state)

        sendEvent('user_message', {
          index: 1,
        })
      })
      .pauseFor(1_000)
      // chatiot response
      .callFunction(() => {
        const content = 'In the Acme Corp. plant, the <strong>Drilling machine #2</strong> in <strong>Sector #3</strong> has been on since <strong>8:00 AM</strong>, however no operator was available for the last <strong>2 hours</strong>.'

        setMessages((prevMessages) => {
          if (prevMessages.findIndex((message) => message.content === content) !== -1) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              content,
              additionalContent: (
                <Pie
                  data={{
                    labels: ['Activity time', 'Inactivity time'],
                    datasets: [
                      {
                        label: 'Hours',
                        data: [8, 2],
                        backgroundColor: [
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(255, 99, 132, 0.2)',
                        ],
                        borderColor: [
                          'rgba(75, 192, 192, 1)',
                          'rgba(255, 99, 132, 1)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: {
                        align: 'start',
                        position: 'top',
                        labels: {
                          color: 'white',
                        }
                      },
                    },
                  }}
                />
              ),
              isUser: false,
              onTypingEnd: () => {
                setIsLoading(false)
                sendEvent('bot_response', {
                  index: 1,
                })
              },
            },
          ]
        })
      })
      .pauseFor(8_000)
      // user input
      .typeString('How much energy was wasted?')
      .pauseFor(200)
      .callFunction((state) => {
        setIsLoading(true)

        const content = getTypedText(state)

        setMessages((prevMessages) => {
          if (prevMessages.findIndex((message) => message.content === content) !== -1) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              content,
              isUser: true,
            },
          ]
        })

        removeTypedText(state)

        sendEvent('user_message', {
          index: 2,
        })
      })
      .pauseFor(1_000)
      // chatiot response
      .callFunction(() => {
        const content = 'During the last <strong>2 hours</strong>, the <strong>Drilling machine #2</strong> consumed <strong>8.2kWh</strong>.'

        setMessages((prevMessages) => {
          if (prevMessages.findIndex((message) => message.content === content) !== -1) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              content,
              additionalContent: (
                <Line
                  data={{
                    labels: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'],
                    datasets: [
                      {
                        label: 'Energy consumption (kWh)',
                        data: [0, 2, 4, 8.2],
                        borderColor: 'rgb(53, 162, 235)',
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                      },
                    ],
                  }}
                  options={{
                    scales: {
                      x: {
                        grid: {
                          color: 'gray',
                        },
                        ticks: {
                          color: 'white',
                        }
                      },
                      y: {
                        grid: {
                          color: 'gray',
                        },
                        ticks: {
                          color: 'white',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white',
                        }
                      },
                    },
                  }}
                />
              ),
              isUser: false,
              onTypingEnd: () => {
                setIsLoading(false)
                sendEvent('bot_response', {
                  index: 2,
                })
              },
            },
          ]
        })
      })
      .pauseFor(6_000)
      // user input
      .typeString('Turn off the machine after 10 minutes in which no operator is available in sector #3. Notify the sector manager when this happens more than twice per day')
      .pauseFor(200)
      .callFunction((state) => {
        setIsLoading(true)

        const content = getTypedText(state)

        setMessages((prevMessages) => {
          if (prevMessages.findIndex((message) => message.content === content) !== -1) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              content,
              isUser: true,
            },
          ]
        })

        removeTypedText(state)

        sendEvent('user_message', {
          index: 3,
        })
      })
      .pauseFor(1_000)
      // chatiot response
      .callFunction(() => {
        const content = 'The new rule has been set.<br><strong>John Mill</strong> will be notified if the <strong>Drilling machine #2</strong> is not sufficiently operational.'

        setMessages((prevMessages) => {
          if (prevMessages.findIndex((message) => message.content === content) !== -1) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              content,
              isUser: false,
              onTypingEnd: () => {
                setIsLoading(false)
                setHideInput(true)
                sendEvent('bot_response', {
                  index: 3,
                })
              },
            },
          ]
        })
      })
      .pauseFor(15_000)
      .callFunction(() => {
        if (isLoop) {
          setIsLoading(false)
          setHideInput(false)
          setMessages([])
          window.scrollTo(0, 0)
          window.location.reload()
        }
      })
      .start()
  }, [isLoop])

  useEffect(() => {
    if (isQr) {
      // if the page is loaded from the link in the QR code, log it to analytics
      sendEvent('scan_qr_code')
    }
  }, [isQr])

  return (
    <VStack
      minHeight='100vh'
      width='100%'
      alignItems='center'
      justifyContent='flex-start'
      padding={2}
      paddingBottom={12}
      gap={12}
      bgGradient='linear(to-b, whiteAlpha.50, blackAlpha.800)'
    >
      <VStack
        gap={12}
      >
        <Heading>
          Chat IoT
        </Heading>
        <Heading as='h6' textAlign='center'>
          Chat with your company's devices,<br />
          make data-driven decisions.
        </Heading>
      </VStack>
      <VStack
        width={{
          base: '100%',
          md: '70%',
          xl: '50%',
        }}
        minHeight={80}
        gap={4}
        borderWidth={1}
        borderRadius='md'
        bg='blackAlpha.500'
        justifyContent='space-between'
      >
        <Messages
          messages={messages}
        />
        {!hideInput && (
          <Box
            width='100%'
            padding={2}
          >
            <HStack
              width='100%'
              padding={2}
              borderWidth={1}
              borderRadius='md'
              justifyContent='space-between'
              textColor='gray.400'
            >
              <Typewriter
                onInit={onInit}
                options={{
                  delay: 50,
                }}
              />
              <Button
                colorScheme='cyan'
                bg='cyan.500'
                isLoading={isLoading}
                flexShrink={0}
              >
                Ask
              </Button>
            </HStack>
          </Box>
        )}
      </VStack>
      <VStack>
        <Heading as='h2' textAlign='center'>
          Interested in using Chat IoT for your business?
        </Heading>
        <ContactUsButton />
      </VStack>
      <Box>
        <Image
          width={{
            base: 32,
            md: 60,
          }}
          src={qrImage}
          alt='Chat IoT QR code'
        />
      </Box>
    </VStack>
  )
}

export default App
