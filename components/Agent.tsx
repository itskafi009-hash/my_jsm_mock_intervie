'use client'
import {useEffect,useRef} from "react";
import { vapi } from '@/lib/vapi.sdk';
import React, { useState } from 'react'
import Image from "next/image"
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {interviewer} from "@/constants";


enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface AgentProps{
    userName: string;
    userId: string;
    type: string;
    interviewId?: string;
    questions?: string[];
}
interface SavedMessage{
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    useEffect(() => {
        const oncallStart = () => setCallStatus(CallStatus.ACTIVE);
        const oncallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = {role: message.role, content: message.transcript}

                setMessages((prev) => [...prev, newMessage]);
            }
        }
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => console.log('Error', error);
        vapi.on('call-start', oncallStart);
        vapi.on('call-end', oncallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', oncallStart);
            vapi.off('call-end', oncallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);


        }
    }, [])

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generating feedback here...');
        //todo create a server action that generates feedback//
        const {success, id} = {
            success: true,
            id: 'feedback-id'
        }
        if (success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log('Error saving feedback here...');
            router.push('/');
        }
    }

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === 'generate') {
                router.push('/')
            } else {
                handleGenerateFeedback(messages);
            }
        }

    }, [messages, callStatus, type, userId]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)

        if (type === 'generate') {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            })
        } else {
            let formattedQuestions = '';
            if (questions) {
                formattedQuestions = questions
                    .map((question) => `-${question}`)
                    .join('\n');

            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions
                }
            })
        }}
        const handleDisconnect = async () => {
            setCallStatus(CallStatus.FINISHED)

            vapi.stop();
        }

        const latestMessage = messages[messages.length - 1]?.content;
        const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

        return (
            <>
                <div className="call-view">
                    <div className="card-interviewer">
                        <div className="avatar">
                            <Image
                                src="/ai-avatar.png"
                                alt="vapi"
                                width={65}
                                height={54}
                                className="object-cover"
                            />
                            {isSpeaking && <span className="animate-speak"/>}
                        </div>
                        <h3>AI Interview</h3>
                    </div>

                    <div className="card-border">
                        <div className="card-content">
                            <Image
                                src="/user-avatar.png"
                                alt="user avatar"
                                width={120}
                                height={120}
                                className="rounded-full object-cover"
                            />
                            <h3>{userName}</h3>
                        </div>
                    </div>
                </div>
                {messages.length > 0 && (
                    <div className="transcript-border">
                        <div className="transcript">
                            <p key={latestMessage}
                               className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                                {latestMessage}
                            </p>
                        </div>
                    </div>
                )}

                <div className="w-full flex justify-center mt-6">

                    {callStatus !== 'ACTIVE' ? (
                        <button className="relative btn-call" onClick={handleCall}>
                        <span
                            className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== "CONNECTING" && "hidden")}
                        />
                            <span>
                                 {isCallInactiveOrFinished ? 'Call' : '...'}
                              </span>
                        </button>

                    ) : (
                        <button onClick={handleDisconnect} className="btn-disconnect">
                            End
                        </button>
                    )}

                </div>
            </>
        )
    }
    export default Agent
