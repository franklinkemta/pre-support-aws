import { useState, useRef, useEffect, useCallback } from 'react'
import { TypewriterClass } from 'typewriter-effect'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080' // Default to localhost for development
const TIMEOUT = 3000 // 3 seconds
const DEFAULT_STATUS_TRANSCRIPT = 'Ringing...'

export const useDialogAPI = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(DEFAULT_STATUS_TRANSCRIPT)
  const [typewriter, setTypeWriter] = useState<TypewriterClass>()
  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const handleUserInput = (event: BlobEvent) => {
    if (event.data.size > 0) {
        // user said someting or interupted assistant
        if (audioPlayerRef.current && typewriter) {
            audioPlayerRef.current.pause()
            typewriter.pauseFor(2).deleteAll().typeString('...')
        }
        // send audio
        const audioBlob = event.data
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(audioBlob)
        } else {
            console.error('Not open. Cannot send audio.')
        }
    } else {
        // user went silent, assistant turn
        if (typewriter) {
            typewriter.pauseFor(2).deleteAll().typeString('Processing!')
        }
    }
    
  }

  const handleAssistantOutput = (output: { sessionId: string, audioBlob: Blob, transcript?: string}) => {
    if (output.audioBlob instanceof Blob) {
        const audioUrl = URL.createObjectURL(output.audioBlob)
        if (audioPlayerRef.current && typewriter) {
            audioPlayerRef.current.src = audioUrl
            audioPlayerRef.current.play()
            if (output.transcript) {
                typewriter.pauseFor(2).deleteAll().typeString(output.transcript)
            } else {
                typewriter.pauseFor(2).deleteAll().typeString('Answering!')
            }
        }
    } else {
        console.warn('invalid audio Blob')
    }
  }

  const startRecording = () => {
    setStatusMessage("Checking microphone...")
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
        setIsRecording(true)
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.ondataavailable = handleUserInput
        mediaRecorderRef.current.start()
    })
    .catch((error) => {
        console.error('Error accessing microphone:', error)
        setStatusMessage('Error accessing microphone. Please grant permissions.')
    })
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const endSession = async () => {
    try {
      stopRecording() 
      if (socketRef.current) {
        socketRef.current.close()
      }
      console.log('Session ended successfully')
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const toggleListening = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  },[isRecording])

  useEffect(() => {
    if (!typewriter) return

    const connectWebSocket = () => {
      socketRef.current = new WebSocket(BACKEND_URL) 

      socketRef.current.onopen = (event) => {
        console.log('Connected', event)
        if (socketRef.current) {
            socketRef.current.send("Hi")
        }
        if (!isRecording) startRecording()
      }

      socketRef.current.onmessage = (event) => {
          try {
            console.log("assistant message:", event.data)
            const data = JSON.parse(event.data);
            const msgType: string = data.type

            switch (msgType) {
                case 'message':
                    handleAssistantOutput(data.value)
                    break
                default:
                    console.error('Unknow event data type', data)
                    break
          }

          
        } catch (error) {
          console.error('Error handling incoming message:', error)
        }
      }

      socketRef.current.onclose = (event) => {
        console.log('closed:', event)
        if (!event.wasClean) {
          // Attempt reconnect if the connection closed unexpectedly
          setTimeout(connectWebSocket, TIMEOUT) // Reconnect after timeout
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('error:', error)
      }
    }

    connectWebSocket()

    return () => {
      socketRef.current?.close()
    }
  }, [BACKEND_URL, typewriter]) // Reconnect if BACKEND_URL changes

  useEffect(() => {
    if (!typewriter || !statusMessage) return
    typewriter.deleteAll()
    if (!isRecording && statusMessage != DEFAULT_STATUS_TRANSCRIPT) {
        typewriter.typeString(DEFAULT_STATUS_TRANSCRIPT).start()
        return
    }
    typewriter.stop()
    typewriter.typeString(statusMessage).start()

  }, [typewriter, statusMessage, isRecording])
  

    return {
        isRecording,
        statusMessage,
        toggleListening,
        endSession,
        setTypeWriter,
    }
}

export default useDialogAPI