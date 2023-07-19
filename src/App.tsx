import { Box, Button, HStack, Heading, Image, Text, VStack } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import Typewriter, { TypewriterClass, TypewriterState } from 'typewriter-effect';
import chatIotLogo from './assets/chat-iot-logo.png';
import { sendEvent } from './ga';
import { EmailIcon } from '@chakra-ui/icons';

const CONTACT_US_LINK = 'mailto:info@omnia-network.com'

const ContactUsButton = () => {
  return (
    <Button
      leftIcon={<EmailIcon />}
      colorScheme='blue'
    >
      <a href={CONTACT_US_LINK}>Contact us</a>
    </Button>
  )
}

type Message = {
  content: string,
  isUser: boolean,
  onTypingEnd?: () => void,
}

type MessagesProps = {
  messages: Message[],
}

const MessageElement: React.FC<Message> = ({ content, isUser, onTypingEnd }) => {
  const onInit = useCallback((typewriter: TypewriterClass) => {
    typewriter
      .typeString(content)
      .callFunction(() => {
        if (onTypingEnd) {
          onTypingEnd()
        }
      })
      .start()
  }, [])

  if (isUser) {
    return (
      <HStack
        paddingInline={2}
        paddingBlock={4}
        gap={4}
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
      paddingInline={2}
      paddingBlock={4}
      backgroundColor='gray.700'
      gap={4}
      alignItems='flex-start'
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
      <Box>
        <Typewriter
          onInit={onInit}
          options={{
            delay: 50,
            cursor: '',
            autoStart: true,
            loop: false,
          }}
        />
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
  const [isContactButtonVisible, setIsContactButtonVisible] = useState(false)

  const onInit = useCallback((typewriter: TypewriterClass) => {
    typewriter
      // user input
      .typeString('What\'s the temperature in my industrial plant?')
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
        const content = 'The current temperature of the Acme plant is 27.1°C.'

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
                sendEvent('bot_response', {
                  index: 1,
                })
              },
            },
          ]
        })
      })
      .pauseFor(5_000)
      // user input
      .typeString('Give me last week\'s temperature')
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
        const content = 'During last week, the mean temperature in the Acme plant was 25.4°C.'

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
                sendEvent('bot_response', {
                  index: 2,
                })
              },
            },
          ]
        })
      })
      .pauseFor(7_000)
      .callFunction(() => {
        setIsContactButtonVisible(true)
      })
      .start()
  }, [])

  return (
    <VStack
      minHeight='100vh'
      width='100%'
      alignItems='center'
      justifyContent='flex-start'
      padding={2}
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
          Chat with your real-world data and devices
        </Heading>
      </VStack>
      <VStack
        width={{
          base: '95%',
          md: '70%',
        }}
        minHeight={80}
        gap={4}
        borderWidth={1}
        borderRadius='md'
        padding={2}
        bg='blackAlpha.500'
        justifyContent='space-between'
      >
        <Messages
          messages={messages}
        />
        {!isContactButtonVisible && (
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
              colorScheme='teal'
              isLoading={isLoading}
            >
              Ask
            </Button>
          </HStack>
        )}
        {isContactButtonVisible && (
          <ContactUsButton />
        )}
      </VStack>
      <VStack>
        <Heading as='h6' textAlign='center'>
          Get in touch with us
        </Heading>
        <ContactUsButton />
      </VStack>
    </VStack>
  )
}

export default App
