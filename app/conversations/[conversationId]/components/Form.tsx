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
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { useAudioContext } from '@/app/context/AudioContext';
import { BsRecordCircle } from 'react-icons/bs';
import { IoStop } from 'react-icons/io5';


const Form = () => {
  const { conversationId } = useConversation();
  const [emojiDrawer, setEmojiDrawer] = React.useState(false);
  const [emoji, setEmoji] = React.useState([] as any);
  const { audioContainerRef } = useAudioContext();
  const [showRecording, setRecording] = React.useState(true);
  // const [showRecording, setRecording] = React.useState(true);
  // const {
  //   startRecording,
  //   stopRecording,
  //   togglePauseResume,
  //   recordingBlob,
  //   isRecording,
  //   isPaused,
  //   recordingTime,
  //   mediaRecorder
  // } = useAudioRecorder();
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
      conversationId: conversationId
    })
  }

  const handleUpload = (result: any) => {
    axios.post('/api/messages', {
      image: result.info.secure_url,
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

  const addAudioElement = (e:any) => {
    console.log("Recording complete", e)
    recorderControls.stopRecording();
    const url = URL.createObjectURL(e);
    const audio = document.createElement('audio');
    audio.src = url;
    console.log('audioContainerRef.current:', audioContainerRef.current);

    if (audioContainerRef.current) {
      audioContainerRef.current.appendChild(audio);
    }
  };

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
      <MdEmojiEmotions size={30} className='text-sky-500' onClick={()=>setEmojiDrawer(!emojiDrawer)}/>
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
        onRecordingComplete={(blob) => addAudioElement(blob)}
        recorderControls={recorderControls}
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