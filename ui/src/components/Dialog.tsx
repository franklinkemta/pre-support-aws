import React, { useState, useRef, useEffect } from 'react';

const ChatComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Configuration (You might want to move these to a separate config file)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'ws://localhost:8080'; // Default to localhost for development

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(backendUrl); 

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        fetchSessionId();
      };

      socketRef.current.onmessage = (event) => {
        try {
          const audioBlob = event.data;
          if (audioBlob instanceof Blob) {
            playAudio(audioBlob);
          } else {
            console.error('Received non-Blob data:', event.data);
          }
        } catch (error) {
          console.error('Error handling incoming message:', error);
          setErrorMessage('Error playing audio response.'); 
        }
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event);
        if (!event.wasClean) {
          // Attempt reconnect if the connection closed unexpectedly
          setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setErrorMessage('WebSocket connection error.');
      };
    };

    connectWebSocket();

    return () => {
      socketRef.current?.close();
    };
  }, [backendUrl]); // Reconnect if backendUrl changes

  const fetchSessionId = async () => {
    try {
      const response = await fetch(`${backendUrl}/connect`);
      if (!response.ok) {
        throw new Error(`Error fetching session ID: ${response.statusText}`);
      }
      const data = await response.json();
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Error fetching session ID:', error);
      setErrorMessage('Error starting session.');
    }
  };

  const startRecording = () => {
    setErrorMessage(null); // Clear any previous errors

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setIsRecording(true);
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            sendAudio(event.data);
          }
        };
        mediaRecorderRef.current.start();
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        setErrorMessage('Error accessing microphone. Please grant permissions.');
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendAudio = (audioBlob: Blob) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(audioBlob);
    } else {
      console.error('WebSocket not open. Cannot send audio.');
      setErrorMessage('Error sending audio. Please try again.'); 
    }
  };

  const playAudio = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
    }
  };

  const endSession = async () => {
    try {
      stopRecording(); 
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (sessionId) {
        // Send request to backend to end session and generate PDF (replace with your endpoint)
        const response = await fetch(`${backendUrl}/end-session/${sessionId}`); 
        if (!response.ok) {
          throw new Error(`Error ending session: ${response.statusText}`);
        }
        // Handle response, e.g., display message that transcript is being generated
        console.log('Session ended successfully');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      setErrorMessage('Error ending session.'); 
    }
  };

  return (
    <div>
      <h2>Voice Chat</h2>
      {errorMessage && <div className="error">{errorMessage}</div>}
      <audio ref={audioPlayerRef} controls />
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <button onClick={endSession} disabled={!sessionId}>
        End Session
      </button>
    </div>
  );
};

export default ChatComponent;