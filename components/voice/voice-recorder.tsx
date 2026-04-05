"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2,
  Save,
  Loader2,
  Volume2,
  Clock,
  FileAudio,
  AudioLines
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface VoiceRecorderProps {
  sessionId?: string
  onTranscript?: (transcript: string) => void
  onSave?: (recording: { url: string; duration: number; transcript?: string }) => void
}

export function VoiceRecorder({ sessionId, onTranscript, onSave }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(32).fill(0))
  const [permissionDenied, setPermissionDenied] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Audio visualizer
  const updateVisualizer = useCallback(() => {
    if (!analyzerRef.current) return
    
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
    analyzerRef.current.getByteFrequencyData(dataArray)
    
    const samples = 32
    const sampleSize = Math.floor(dataArray.length / samples)
    const newData = []
    
    for (let i = 0; i < samples; i++) {
      let sum = 0
      for (let j = 0; j < sampleSize; j++) {
        sum += dataArray[i * sampleSize + j]
      }
      newData.push(sum / sampleSize / 255)
    }
    
    setVisualizerData(newData)
    animationFrameRef.current = requestAnimationFrame(updateVisualizer)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio analyzer for visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 256
      source.connect(analyzer)
      analyzerRef.current = analyzer
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        setVisualizerData(new Array(32).fill(0))
      }
      
      mediaRecorder.start(100)
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)
      setPermissionDenied(false)
      
      // Start visualizer
      updateVisualizer()
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
      
    } catch (err) {
      console.error('Failed to start recording:', err)
      setPermissionDenied(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setDuration(d => d + 1)
        }, 1000)
        updateVisualizer()
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const playPauseAudio = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscript(null)
    setDuration(0)
    setCurrentTime(0)
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return
    
    setIsTranscribing(true)
    try {
      // Simulated transcription - in production, use Whisper API or similar
      // For demo, we'll use a placeholder
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const placeholderTranscript = "This is a placeholder transcription. In production, this would be the actual transcribed audio content from your recording. The transcription service would process your voice recording and convert it to text."
      
      setTranscript(placeholderTranscript)
      onTranscript?.(placeholderTranscript)
    } catch (err) {
      console.error('Transcription failed:', err)
    } finally {
      setIsTranscribing(false)
    }
  }

  const saveRecording = async () => {
    if (!audioBlob) return
    
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')
      
      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, audioBlob)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('evidence')
        .getPublicUrl(fileName)
      
      // Save metadata to database
      await supabase.from('voice_recordings').insert({
        session_id: sessionId || null,
        user_id: user.id,
        storage_path: fileName,
        duration_seconds: duration,
        transcript: transcript,
        processed: !!transcript
      })
      
      onSave?.({
        url: publicUrl,
        duration,
        transcript: transcript || undefined
      })
      
      // Reset state
      deleteRecording()
    } catch (err) {
      console.error('Failed to save recording:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full">
      {/* Permission Denied */}
      {permissionDenied && (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          Microphone access denied. Please enable microphone permissions to record audio.
        </div>
      )}

      {/* Recording State */}
      {!audioUrl && (
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          {/* Visualizer */}
          <div className="flex items-end justify-center gap-1 h-24 mb-6">
            {visualizerData.map((value, i) => (
              <motion.div
                key={i}
                className={`w-2 rounded-full ${isRecording && !isPaused ? 'bg-primary' : 'bg-muted'}`}
                animate={{ 
                  height: isRecording && !isPaused ? Math.max(4, value * 96) : 4 
                }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold text-foreground">
              {formatTime(duration)}
            </div>
            {isRecording && (
              <p className="text-sm text-muted-foreground mt-1">
                {isPaused ? 'Paused' : 'Recording...'}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Mic className="w-8 h-8" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                  className="h-14 w-14 rounded-full"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="h-16 w-16 rounded-full"
                >
                  <Square className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isRecording 
              ? 'Click the red button to stop recording'
              : 'Click to start recording your voice'
            }
          </p>
        </div>
      )}

      {/* Playback State */}
      {audioUrl && (
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => setDuration(Math.floor(e.currentTarget.duration))}
          />

          {/* Audio Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileAudio className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Voice Recording</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button
              onClick={playPauseAudio}
              size="lg"
              className="h-14 w-14 rounded-full bg-primary"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <AudioLines className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Transcript</span>
              </div>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={deleteRecording}
              variant="outline"
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            {!transcript && (
              <Button
                onClick={transcribeAudio}
                variant="outline"
                className="flex-1"
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Transcribe
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={saveRecording}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
