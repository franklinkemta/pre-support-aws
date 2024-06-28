import { useState, useRef, useEffect } from 'react'
import { TypewriterClass } from 'typewriter-effect'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080' // Default to localhost for development
const TIMEOUT = 3000
const DEFAULT_STATUS_TRANSCRIPT = 'Ringing...'

export const useDialogAPI = () => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(DEFAULT_STATUS_TRANSCRIPT)
  const [typewriter, setTypeWriter] = useState<TypewriterClass>()
  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const fetchSessionId = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/connect`)
      if (!response.ok) {
        throw new Error(`Error fetching session ID: ${response.statusText}`)
      }
      const data = await response.json()
      setSessionId(data.session_id)
    } catch (error) {
      console.error('Error fetching session ID:', error)
      setStatusMessage('Error starting session.')
    }
  }

  const startRecording = () => {
    setStatusMessage(null) // Clear any previous errors

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setIsRecording(true)
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            sendAudio(event.data)
          }
        }
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

  const sendAudio = (audioBlob: Blob) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(audioBlob)
    } else {
      console.error('Not open. Cannot send audio.')
      setStatusMessage('Error sending audio. Please try again.') 
    }
  }

  const playAudio = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = audioUrl
      audioPlayerRef.current.play()
    }
  }

  const endSession = async () => {
    try {
      stopRecording() 
      if (socketRef.current) {
        socketRef.current.close()
      }
      if (sessionId) {
        // Send request to backend to end session and generate PDF (replace with your endpoint)
        const response = await fetch(`${BACKEND_URL}/end-session/${sessionId}`) 
        if (!response.ok) {
          throw new Error(`Error ending session: ${response.statusText}`)
        }
        // Handle response, e.g., display message that transcript is being generated
        console.log('Session ended successfully')
      }
    } catch (error) {
      console.error('Error ending session:', error)
      setStatusMessage('Error ending session.') 
    }
  }

  useEffect(() => {
    if (!typewriter) return
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(BACKEND_URL) 

      socketRef.current.onopen = () => {
        console.log('Connected')
        fetchSessionId()
      }

      socketRef.current.onmessage = (event) => {
        try {
          const audioBlob = event.data
          // event.data should contain audio transcript so it can be typed by the typewritter
          if (audioBlob instanceof Blob) {
            playAudio(audioBlob)
          } else {
            console.error('Received non-Blob data:', event.data)
          }
        } catch (error) {
          console.error('Error handling incoming message:', error)
          setStatusMessage('Error playing audio response.') 
        }
      }

      socketRef.current.onclose = (event) => {
        console.log('closed:', event)
        if (!event.wasClean) {
          // Attempt reconnect if the connection closed unexpectedly
          // typewriter.typeString("Welcome, please wait...")
          setTimeout(connectWebSocket, TIMEOUT) // Reconnect after 3 seconds
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('error:', error)
        // typewriter.typeString("Welcome, please wait...").start()
        // setStatusMessage('Connection error.')
      }
    }

    connectWebSocket()

    return () => {
      socketRef.current?.close()
    }
  }, [BACKEND_URL, typewriter]) // Reconnect if BACKEND_URL changes

  useEffect(() => {
    if (!typewriter || !statusMessage) return
    if (!sessionId) {
        typewriter.deleteAll()
        typewriter.typeString(DEFAULT_STATUS_TRANSCRIPT).start()
        return
    }
    typewriter.stop()
    typewriter.typeString(statusMessage).start()

  }, [typewriter, statusMessage])
  

    return {
        isRecording,
        statusMessage,
        startRecording,
        stopRecording,
        endSession,
        setTypeWriter,
    }
}

export default useDialogAPI