import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@headlessui/react'
import Typewriter from 'typewriter-effect'

import './styles.css'

const Assitant: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>("Ringing...")
  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  // Configuration (You might want to move these to a separate config file)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080' // Default to localhost for development

 

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(backendUrl) 

      socketRef.current.onopen = () => {
        console.log('Connected')
        fetchSessionId()
      }

      socketRef.current.onmessage = (event) => {
        try {
          const audioBlob = event.data
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
          setTimeout(connectWebSocket, 3000) // Reconnect after 3 seconds
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('error:', error)
        // setStatusMessage('Connection error.')
      }
    }

    connectWebSocket()

    return () => {
      socketRef.current?.close()
    }
  }, [backendUrl]) // Reconnect if backendUrl changes

  const fetchSessionId = async () => {
    try {
      const response = await fetch(`${backendUrl}/connect`)
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
        const response = await fetch(`${backendUrl}/end-session/${sessionId}`) 
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

  return (
    <div className="flex flex-col justify-center align-middle items-center place-items-center h-full mt-7 text-white">
      <div className="assistant-active flex justify-center align-middle place-items-center rounded-full h-40 w-40 border-8  border-[#FF9900]">
        <span className="text-4xl"></span>
      </div>

      <div className="flex mt-7">
        <Typewriter options={{cursor: ''}}/>
      </div>
        
      
      <div className="flex flex-col w-full fixed bottom-0 p-2 text-white" >
        <div className="inline-flex justify-center">
          <Button 
            onClick={stopRecording} disabled={!isRecording}
            className="rounded-full border-2 border-white py-2 px-4 text-md font-bold text-white">
            ⬜️
          </Button>
        </div>
        {statusMessage && <div className="flex animate-pulse text-right text-sm">{statusMessage}</div>}
      </div>
    </div>
  )
}

export default Assitant