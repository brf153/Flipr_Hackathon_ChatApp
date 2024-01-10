'use client';
import React from 'react';
import { 
  HiPaperAirplane, 
  HiPhoto
} from "react-icons/hi2";
import MessageInput from "./MessageInput";
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from "react-hook-form";
import axios from "axios";
import { CldUploadButton } from "next-cloudinary";
import useConversation from "@/app/hooks/useConversation";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { MdEmojiEmotions } from "react-icons/md";
import {AudioRecorder, useAudioRecorder} from "react-audio-voice-recorder";
import { useAudioContext } from '@/app/context/AudioContext';
import { BsRecordCircle } from 'react-icons/bs';
import { IoStop } from 'react-icons/io5';
import { promisify } from 'util';
import zlib from 'zlib';


const Form = () => {
  const { conversationId } = useConversation();
  const [emojiDrawer, setEmojiDrawer] = React.useState(false);
  const [emoji, setEmoji] = React.useState([] as any);
  const { audioContainerRef } = useAudioContext();
  const [showRecording, setRecording] = React.useState(true);
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder
  } = useAudioRecorder();
  const recorderControls = useAudioRecorder()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: {
      errors,
    }
  } = useForm<FieldValues>({
    defaultValues: {
      message: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue('message', '', { shouldValidate: true });
    axios.post('/api/messages', {
      ...data,
      dataType: 'text',
      conversationId: conversationId
    })
  }

  const handleUpload = (result: any) => {
    axios.post('/api/messages', {
      image: result.info.secure_url,
      dataType: 'image',
      conversationId: conversationId
    })
  }

  const handleEmojiSelect = (e: any) => {
    console.log('Selected Emoji:', e.native);
    const currentValue = watch('message');
    const updatedValue = currentValue + e.native;
    setValue('message', updatedValue);
    setEmoji((prevEmojis:any) => [...prevEmojis, e.native]);
  };

  const addAudioElement = async (blob: Blob) => {
    try {
      const CHUNK_SIZE = 1024; 
      const base64String = await convertBlobToBase64(blob);
      // Now you have the Base64 representation of the WAV file
      const compressedData = await compressData(base64String);
      const chunkedData = chunkString(compressedData.toString('base64'), CHUNK_SIZE);
      for (const data in chunkedData) {
        axios.post('/api/messages', {
          message: data,
          dataType: 'audio',
          conversationId: conversationId
        })
      }
      console.log('Base64 String:', chunkedData);
    } catch (error) {
      console.error('Error converting WAV to Base64:', error);
    }
  };

  const chunkString = (str: string, size: number): string[] => {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
  
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }
  
    return chunks;
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert Blob to Base64.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading Blob as data URL.'));
      };
      reader.readAsDataURL(blob);
    });
  };

  const compressData = async (data: string): Promise<Buffer> => {
    const compressedBuffer = await deflateAsync(Buffer.from(data, 'base64'));
    return compressedBuffer;
  };

  const deflateAsync = promisify(zlib.deflate);

  return ( 
    <div 
      className="
        py-4 
        px-4 
        bg-white 
        border-t 
        flex 
        items-center 
        gap-2 
        lg:gap-4 
        w-full
      "
    >
      <CldUploadButton 
        options={{ maxFiles: 1 }} 
        onUpload={handleUpload} 
        uploadPreset="qdmol9rf"
      >
        <HiPhoto size={30} className="text-sky-500" />
      </CldUploadButton>

      <div className='flex flex-col-reverse relative'>
      <MdEmojiEmotions size={30} className='text-sky-500 cursor-pointer' onClick={()=>setEmojiDrawer(!emojiDrawer)}/>
      {
        emojiDrawer && (
          <div className='absolute bottom-[50px]'>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div> 
        )
      }
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput 
          id="message" 
          register={register} 
          errors={errors} 
          required 
          placeholder="Write a message"
        />
        <button 
          type="submit" 
          className="
            rounded-full 
            p-2 
            bg-sky-500 
            cursor-pointer 
            hover:bg-sky-600 
            transition
          "
        >
          <HiPaperAirplane
            size={18}
            className="text-white"
          />
        </button>
      </form>

      <AudioRecorder 
      onRecordingComplete={addAudioElement}
      audioTrackConstraints={{
        noiseSuppression: true,
        echoCancellation: true,
      }} 
      downloadOnSavePress={false}
    />

      {/* {
        showRecording ? (
          <BsRecordCircle onClick={() => {
            setRecording(true);
            recorderControls.startRecording();
          }} />
        ):(
          <IoStop onClick={(e)=>{
            setRecording(false);
            recorderControls.stopRecording();
          }}/>
        )
      } */}

    </div>
  );
}
 
export default Form;